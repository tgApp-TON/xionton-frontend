import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const telegramId = request.nextUrl.searchParams.get('telegramId');
  const userIdParam = request.nextUrl.searchParams.get('userId');

  if (userIdParam) {
    const userId = parseInt(userIdParam, 10);
    if (Number.isNaN(userId)) return NextResponse.json({ exists: false });
    const { data: userRow } = await supabase
      .from('User')
      .select('id, nickname, role, tonWallet, referralCode, telegramUsername')
      .eq('id', userId)
      .single();
    if (!userRow) return NextResponse.json({ exists: false });

    // Update Telegram data from request headers if available (base64-encoded)
    const telegramDataBase64 = request.headers.get('x-telegram-user-base64');
    if (telegramDataBase64) {
      try {
        const telegramData = Buffer.from(telegramDataBase64, 'base64').toString('utf8');
        const userData = JSON.parse(telegramData);
        const updates: Record<string, string> = {};
        if (userData.username && userData.username !== userRow.telegramUsername) {
          updates.telegramUsername = userData.username;
        }
        if (Object.keys(updates).length > 0) {
          await supabase.from('User').update(updates).eq('id', userId);
        }
      } catch {
        // Ignore parsing errors
      }
    }

    let referralCode = userRow.referralCode ?? '';
    if (!referralCode || referralCode.trim() === '') {
      const prefix = (userRow.nickname || 'U').replace(/\W/g, '').slice(0, 3).toUpperCase() || 'U';
      referralCode = `${prefix}_${String(100000 + Math.floor(Math.random() * 900000))}`;
      await supabase.from('User').update({ referralCode }).eq('id', userId);
    }
    return NextResponse.json({
      exists: true,
      user: { id: userRow.id, nickname: userRow.nickname, role: userRow.role, tonWallet: userRow.tonWallet, referralCode },
    });
  }

  if (!telegramId) return NextResponse.json({ exists: false });

  const { data } = await supabase
    .from('User')
    .select('id, nickname, role')
    .eq('telegramId', telegramId)
    .single();

  if (data) return NextResponse.json({ exists: true, user: data });
  return NextResponse.json({ exists: false });
}
