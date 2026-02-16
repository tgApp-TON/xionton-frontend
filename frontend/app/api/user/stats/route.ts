import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const id = parseInt(userId, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('nickname')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { count: matrixTableCount } = await supabase
      .from('MatrixTable')
      .select('id', { count: 'exact', head: true })
      .eq('userId', id);
    const activeTables = matrixTableCount ?? 0;

    const { data: matrixTables } = await supabase
      .from('MatrixTable')
      .select('cycleCount')
      .eq('userId', id);
    const totalCycles = (matrixTables ?? []).reduce((sum: number, t: any) => sum + (Number(t.cycleCount) || 0), 0);

    const { data: payouts } = await supabase
      .from('PayoutLog')
      .select('amount')
      .eq('toUserId', id);
    const totalEarned = (payouts ?? []).reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);

    return NextResponse.json({
      nickname: user.nickname ?? '',
      activeTables,
      totalCycles,
      totalEarned: Math.round(totalEarned * 100) / 100,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch stats' }, { status: 500 });
  }
}
