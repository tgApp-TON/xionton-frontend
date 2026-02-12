import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const telegramId = request.nextUrl.searchParams.get('telegramId');
  const userIdParam = request.nextUrl.searchParams.get('userId');

  if (userIdParam) {
    const userId = parseInt(userIdParam, 10);
    if (Number.isNaN(userId)) return NextResponse.json({ exists: false });
    const { data } = await supabase
      .from('User')
      .select('id, nickname, role, tonWallet')
      .eq('id', userId)
      .single();
    if (data) return NextResponse.json({ exists: true, user: data });
    return NextResponse.json({ exists: false });
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
