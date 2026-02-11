import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, telegramUsername, isPremium, nickname, tonWallet, referralCode } = body;

    if (!telegramId || !nickname || !tonWallet) {
      return NextResponse.json(
        { error: 'telegramId, nickname, and tonWallet are required' },
        { status: 400 }
      );
    }

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
        tonWallet: String(tonWallet),
        role: 'USER',
        isVerified: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        const { data: users, error: lookupError } = await supabase
          .from('User')
          .select('*')
          .eq('telegramId', String(telegramId));

        console.log('All users with telegramId:', JSON.stringify(users), 'error:', JSON.stringify(lookupError));

        if (users && users.length > 0) {
          return NextResponse.json({ success: true, user: users[0] });
        }

        // Try with numeric telegramId
        const { data: users2 } = await supabase
          .from('User')
          .select('*')
          .eq('telegramId', Number(telegramId));

        console.log('Users with numeric telegramId:', JSON.stringify(users2));

        if (users2 && users2.length > 0) {
          return NextResponse.json({ success: true, user: users2[0] });
        }

        return NextResponse.json({ error: 'Could not find existing user' }, { status: 400 });
      }
      console.error('Registration error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
