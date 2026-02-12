import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ registered: false, error: 'telegramId required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('User')
    .select('id, nickname')
    .eq('telegramId', String(telegramId))
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Auth check error:', error);
    return NextResponse.json({ registered: false });
  }

  return NextResponse.json({ registered: !!data, user: data || null });
}
