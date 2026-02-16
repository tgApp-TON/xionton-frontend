import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const isMaster = (id: number) => id === 1;

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

    const { data: myPayouts } = await supabase
      .from('PayoutLog')
      .select('amount')
      .eq('toUserId', id);
    const myTotalEarned = Math.round((myPayouts ?? []).reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0) * 100) / 100;

    let sponsor: { nickname: string; activeTables: number; referralsCount: number } | null = null;
    if (referrerId != null && !isMaster(referrerId)) {
      const { data: sponsorUser } = await supabase
        .from('User')
        .select('id, nickname')
        .eq('id', referrerId)
        .single();
      if (sponsorUser && !isMaster((sponsorUser as any).id)) {
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
    const list = (referralUsers || []).filter((u: any) => !isMaster(u.id));
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

      for (const rid of referralIds) {
        const { data: payouts } = await supabase
          .from('PayoutLog')
          .select('amount')
          .eq('toUserId', rid);
        totalEarnedByUser[rid] = Math.round((payouts ?? []).reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0) * 100) / 100;
      }
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
