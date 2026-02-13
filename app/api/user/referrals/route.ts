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
    const { data: currentUser, error: userError } = await supabase
      .from('User')
      .select('referralCode, referrerId, nickname')
      .eq('id', id)
      .single();
    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const referralCode = currentUser.referralCode ?? '';
    const referrerId = currentUser.referrerId ?? null;
    const currentUserNickname = currentUser.nickname ?? 'You';

    let myTotalEarned = 0;
    const { data: myStats } = await supabase
      .from('UserStats')
      .select('totalEarned')
      .eq('userId', id)
      .single();
    if (myStats?.totalEarned != null) {
      const n = typeof myStats.totalEarned === 'string' ? parseFloat(myStats.totalEarned) : Number(myStats.totalEarned);
      myTotalEarned = Number.isNaN(n) ? 0 : n;
    }

    let sponsor: { nickname: string; activeTables: number; referralsCount: number } | null = null;
    if (referrerId != null && referrerId !== 1) {
      const { data: sponsorUser } = await supabase
        .from('User')
        .select('id, nickname')
        .eq('id', referrerId)
        .single();
      if (sponsorUser) {
        const { data: sponsorTables } = await supabase
          .from('Table')
          .select('id')
          .eq('userId', referrerId)
          .eq('status', 'ACTIVE');
        const { count: sponsorRefCount } = await supabase
          .from('User')
          .select('id', { count: 'exact', head: true })
          .eq('referrerId', referrerId);
        sponsor = {
          nickname: sponsorUser.nickname ?? '',
          activeTables: sponsorTables?.length ?? 0,
          referralsCount: sponsorRefCount ?? 0,
        };
      }
    }

    const { data: referralUsers, error: refError } = await supabase
      .from('User')
      .select('id, nickname, registeredAt')
      .eq('referrerId', id)
      .order('registeredAt', { ascending: false });
    if (refError) {
      return NextResponse.json({ error: refError.message }, { status: 500 });
    }
    const list = referralUsers || [];
    const referralIds = list.map((u: { id: number }) => u.id);

    let activeCountByUser: Record<number, number> = {};
    let referralsCountByUser: Record<number, number> = {};
    let totalEarnedByUser: Record<number, number> = {};

    if (referralIds.length > 0) {
      const { data: tables } = await supabase
        .from('Table')
        .select('userId')
        .in('userId', referralIds)
        .eq('status', 'ACTIVE');
      referralIds.forEach((uid: number) => (activeCountByUser[uid] = 0));
      (tables || []).forEach((t: { userId: number }) => {
        activeCountByUser[t.userId] = (activeCountByUser[t.userId] ?? 0) + 1;
      });

      for (const rid of referralIds) {
        const { count } = await supabase
          .from('User')
          .select('id', { count: 'exact', head: true })
          .eq('referrerId', rid);
        referralsCountByUser[rid] = count ?? 0;
      }

      const { data: userStatsRows } = await supabase
        .from('UserStats')
        .select('userId, totalEarned')
        .in('userId', referralIds);
      (userStatsRows || []).forEach((row: { userId: number; totalEarned: number | string }) => {
        const n = typeof row.totalEarned === 'string' ? parseFloat(row.totalEarned) : Number(row.totalEarned);
        totalEarnedByUser[row.userId] = Number.isNaN(n) ? 0 : n;
      });
      referralIds.forEach((uid: number) => {
        if (totalEarnedByUser[uid] === undefined) totalEarnedByUser[uid] = 0;
      });
    }

    let tablesByUser: Record<number, { tableNumber: number; status: string }[]> = {};
    if (referralIds.length > 0) {
      const { data: allTables } = await supabase
        .from('Table')
        .select('userId, tableNumber, status')
        .in('userId', referralIds);
      referralIds.forEach((uid: number) => (tablesByUser[uid] = []));
      (allTables || []).forEach((t: { userId: number; tableNumber: number; status: string }) => {
        if (!tablesByUser[t.userId]) tablesByUser[t.userId] = [];
        tablesByUser[t.userId].push({ tableNumber: t.tableNumber, status: t.status });
      });
    }

    const referrals = list.map((u: { id: number; nickname: string; registeredAt: string }) => ({
      id: u.id,
      nickname: u.nickname,
      activeTables: activeCountByUser[u.id] ?? 0,
      referralsCount: referralsCountByUser[u.id] ?? 0,
      totalEarned: totalEarnedByUser[u.id] ?? 0,
      createdAt: u.registeredAt,
      tables: tablesByUser[u.id] ?? [],
    }));

    const totalReferrals = referrals.length;
    const workers = referrals.filter((r: { activeTables: number }) => r.activeTables >= 1).length;
    const loosers = referrals.filter((r: { activeTables: number }) => r.activeTables === 0).length;

    return NextResponse.json({
      referralCode,
      currentUserNickname,
      myTotalEarned,
      sponsor,
      referrals,
      totalReferrals,
      workers,
      loosers,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}
