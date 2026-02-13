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

    const { data: tables, error: tablesError } = await supabase
      .from('Table')
      .select('status, cycleNumber')
      .eq('userId', id);

    if (tablesError) {
      return NextResponse.json({ error: tablesError.message }, { status: 500 });
    }

    const activeTables = (tables || []).filter((t) => t.status === 'ACTIVE').length;
    const totalCycles = (tables || []).reduce((sum, t) => sum + (t.cycleNumber ?? 0), 0);

    // UserStats: totalEarned comes from UserStats table only; if no row or invalid, return 0
    const userStatsQuery = { from: 'UserStats', select: 'totalEarned', where: { userId: id } };
    console.log('[stats] UserStats query', userStatsQuery);
    const { data: userStats, error: userStatsError } = await supabase
      .from('UserStats')
      .select('totalEarned')
      .eq('userId', id)
      .single();
    console.log('[stats] UserStats raw response', { data: userStats, error: userStatsError });
    console.log('[stats] Row returned for userId', id, ':', userStats ? { userId: id, totalEarned: userStats.totalEarned } : 'none');
    let totalEarned = 0;
    if (userStatsError || userStats == null) {
      totalEarned = 0;
    } else if (userStats.totalEarned == null || userStats.totalEarned === undefined) {
      totalEarned = 0;
    } else {
      const n = typeof userStats.totalEarned === 'string' ? parseFloat(userStats.totalEarned) : Number(userStats.totalEarned);
      totalEarned = Number.isNaN(n) || n < 0 ? 0 : n;
    }

    return NextResponse.json({
      nickname: user.nickname ?? '',
      activeTables,
      totalCycles,
      totalEarned,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch stats' }, { status: 500 });
  }
}
