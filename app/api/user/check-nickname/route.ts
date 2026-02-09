import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get('nickname');

  if (!nickname) {
    return NextResponse.json({ error: 'Nickname required' }, { status: 400 });
  }

  if (nickname.toLowerCase() === 'master') {
    return NextResponse.json({ taken: true, available: false });
  }

  // Use Supabase client instead of Prisma
  const { data, error } = await supabase
    .from('User')
    .select('id')
    .eq('nickname', nickname)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Supabase error:', error);
  }

  return NextResponse.json({ 
    taken: !!data, 
    available: !data 
  });
}
