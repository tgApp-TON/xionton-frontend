import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get('nickname');

  if (!nickname) {
    return NextResponse.json({ error: 'Nickname required', available: false }, { status: 400 });
  }

  if (nickname.length < 3 || nickname.length > 20 || !/^[a-zA-Z0-9_]+$/.test(nickname)) {
    return NextResponse.json({ available: false });
  }

  if (nickname.toLowerCase() === 'master') {
    return NextResponse.json({ available: false });
  }

  const { data, error } = await supabase
    .from('User')
    .select('id')
    .eq('nickname', nickname)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Supabase error:', error);
    return NextResponse.json({ available: false });
  }

  return NextResponse.json({ available: !data });
}
