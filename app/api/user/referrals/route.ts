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
      .select('referralCode')
      .eq('id', id)
      .single();
    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const referralCode = currentUser.referralCode ?? '';

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
    if (referralIds.length > 0) {
      const { data: tables } = await supabase
        .from('Table')
        .select('userId')
        .in('userId', referralIds)
        .eq('status', 'ACTIVE');
      const countByUser: Record<number, number> = {};
      referralIds.forEach((uid: number) => (countByUser[uid] = 0));
      (tables || []).forEach((t: { userId: number }) => {
        countByUser[t.userId] = (countByUser[t.userId] ?? 0) + 1;
      });
      activeCountByUser = countByUser;
    }

    const referrals = list.map((u: { id: number; nickname: string; registeredAt: string }) => ({
      id: u.id,
      nickname: u.nickname,
      activeTables: activeCountByUser[u.id] ?? 0,
      createdAt: u.registeredAt,
    }));
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter((r: { activeTables: number }) => r.activeTables >= 1).length;

    return NextResponse.json({
      referralCode,
      referrals,
      totalReferrals,
      activeReferrals,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}
