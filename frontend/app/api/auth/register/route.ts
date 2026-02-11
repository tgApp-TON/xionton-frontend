import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, telegramUsername, isPremium, nickname, tonWallet, referralCode } = body;

    if (!telegramId || !nickname) {
      return NextResponse.json(
        { error: 'telegramId and nickname are required' },
        { status: 400 }
      );
    }

    // Check if user already exists by telegramId
    const { data: existingUsers } = await supabase
      .from('User')
      .select('*')
      .eq('telegramId', String(telegramId));

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ success: true, user: existingUsers[0] });
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
        telegramId: String(telegramId),
        telegramUsername: telegramUsername || null,
        nickname,
        referrerId,
        referralCode: referralCodeValue,
        isPremium: Boolean(isPremium),
        accountCreatedDate: new Date().toISOString(),
        tonWallet: tonWallet != null && String(tonWallet).trim() !== '' ? String(tonWallet).trim() : '',
        role: 'USER',
        isVerified: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
