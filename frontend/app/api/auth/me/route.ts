import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ exists: false, error: 'telegramId required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('User')
    .select('id, nickname, telegramId, referralCode')
    .eq('telegramId', String(telegramId))
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Auth me error:', error);
    return NextResponse.json({ exists: false });
  }

  if (!data) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ exists: true, user: data });
}
