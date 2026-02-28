import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { engineRegisterUser } from '@/lib/matrix-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, telegramUsername, isPremium, nickname, tonWallet, referralCode } = body;
    console.log('Register API received:', { telegramId, telegramUsername, isPremium, nickname, tonWallet: tonWallet ? 'present' : 'empty', referralCode });

    if (!telegramId || !nickname) {
      return NextResponse.json(
        { error: 'telegramId and nickname are required' },
        { status: 400 }
      );
    }

    // Convert telegramId to a valid bigint-compatible value
    // If it starts with "wallet_" or contains non-numeric chars, generate a numeric hash
    let numericTelegramId: string;
    if (/^\d+$/.test(String(telegramId))) {
      numericTelegramId = String(telegramId);
    } else {
      // Create a numeric hash from the string (use char codes)
      const str = String(telegramId);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
      }
      numericTelegramId = String(Math.abs(hash) + 9000000000);
    }

    // Check if user already exists by tonWallet first
    if (tonWallet && String(tonWallet).trim() !== '') {
      const { data: walletUsers } = await supabase
        .from('User')
        .select('*')
        .eq('tonWallet', String(tonWallet).trim());
      if (walletUsers && walletUsers.length > 0) {
        return NextResponse.json({ success: true, user: walletUsers[0] });
      }
    }

    // Check if user already exists by telegramId
    const { data: existingUsers } = await supabase
      .from('User')
      .select('*')
      .eq('telegramId', numericTelegramId);

    if (existingUsers && existingUsers.length > 0) {
      const existing = existingUsers[0];
      // Update telegramUsername on every login if it changed
      if (telegramUsername != null && String(telegramUsername) !== (existing.telegramUsername ?? '')) {
        await supabase
          .from('User')
          .update({ telegramUsername: telegramUsername || null })
          .eq('id', existing.id);
        const { data: updated } = await supabase
          .from('User')
          .select('*')
          .eq('id', existing.id)
          .single();
        return NextResponse.json({ success: true, user: updated ?? existing });
      }
      return NextResponse.json({ success: true, user: existing });
    }

    // referrerId defaults to 1 (MASTER)
    let referrerId = 1;
    if (referralCode && referralCode !== 'MASTER') {
      const { data: referrer } = await supabase
        .from('User')
        .select('id')
        .eq('referralCode', String(referralCode).toUpperCase())
        .single();

      if (referrer) {
        referrerId = referrer.id;
      }
    }

    const referralCodeValue = String(nickname).toUpperCase().slice(0, 10);

    const { data: user, error } = await supabase
      .from('User')
      .insert({
        telegramId: numericTelegramId,
        telegramUsername: telegramUsername || null,
        nickname,
        referrerId,
        referralCode: referralCodeValue,
        isPremium: Boolean(isPremium),
        accountCreatedDate: new Date().toISOString(),
        tonWallet: tonWallet != null && String(tonWallet).trim() !== '' ? String(tonWallet).trim() : '',
        role: 'USER',
        isVerified: true,
        language: 'en',  // Default, user can change in bot
      })
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const newUser = user as { id: number; [key: string]: unknown };
    const sponsorId = referrerId;

    // Set starting wallet balance for testing (engine will deduct table 1 price)
    await supabase
      .from('User')
      .update({ walletBalance: 50000 })
      .eq('id', newUser.id);

    let matrixSuccess = false;
    try {
      // Table 1 creation removed - users must explicitly buy tables via /api/table/buy
      // await engineRegisterUser(newUser.id, sponsorId, supabase);
      matrixSuccess = true;
    } catch (engineErr) {
      console.error('[register] matrix engine error:', engineErr);
    }

    // Ensure UserStats exists for new user
    if (matrixSuccess) {
      await supabase.from('UserStats').upsert(
        {
          userId: newUser.id,
          totalEarned: 0,
          totalReferrals: 0,
          totalCycles: 0,
          activeTables: 1,
          updatedAt: new Date().toISOString(),
        },
        { onConflict: 'userId' }
      );
    }

    const { data: userWithBalance } = await supabase
      .from('User')
      .select('*')
      .eq('id', newUser.id)
      .single();

    return NextResponse.json({
      success: true,
      user: userWithBalance ?? user,
      warning: matrixSuccess ? undefined : 'User created but matrix setup failed. You can buy table 1 manually.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
