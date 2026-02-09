import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, username, nickname, referralCode, country } = body;

    // Find referrer by referral code
    let referrerId = 1; // Default to MASTER
    
    if (referralCode && referralCode !== 'MASTER') {
      const { data: referrer } = await supabase
        .from('User')
        .select('id')
        .eq('referralCode', referralCode)
        .single();
      
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Generate referral code (max 10 chars)
    const referralCodeValue = nickname.toUpperCase().slice(0, 10);

    // Create user
    // Note: tonWallet is unique, so we use a placeholder that will be updated later
    const tonWalletPlaceholder = `pending_${telegramId}_${Date.now()}`;

    const { data: user, error } = await supabase
      .from('User')
      .insert({
        telegramId: telegramId.toString(),
        telegramUsername: username,
        nickname,
        referrerId,
        referralCode: referralCodeValue,
        isPremium: true,
        accountCreatedDate: new Date().toISOString(),
        tonWallet: tonWalletPlaceholder,
        role: 'USER',
        isVerified: true
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
