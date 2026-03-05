import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
      await supabase.rpc('update_30day_stats', { p_user_id: parseInt(userId) });
    } catch (error) {
      console.error('Failed to update stats:', error);
    }

    const { data: user, error: userError } = await supabase
      .from('User')
      .select('nickname, totalInvestedReal, last30DaysInvested, last30DaysReferrals, registeredAt')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const uid = parseInt(userId, 10);

    // Earned = only real payouts from PayoutLog (ignore User.totalEarned to avoid stale/wrong data)
    const { data: allPayouts } = await supabase
      .from('PayoutLog')
      .select('amount')
      .eq('toUserId', uid);
    const allTimeEarned = (allPayouts ?? []).reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: recentPayouts } = await supabase
      .from('PayoutLog')
      .select('amount')
      .eq('toUserId', uid)
      .gte('createdAt', thirtyDaysAgo.toISOString());
    const last30DaysEarned = (recentPayouts ?? []).reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);

    const { count: activeTables } = await supabase
      .from('MatrixTable')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId)
      .eq('status', 'ACTIVE');

    const { count: totalReferrals } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true })
      .eq('referrerId', userId);

    return NextResponse.json({
      user: {
        nickname: user.nickname,
        registeredAt: user.registeredAt,
      },
      allTime: {
        invested: Number(user.totalInvestedReal || 0),
        earned: Math.round(allTimeEarned * 100) / 100,
        referrals: totalReferrals || 0,
        activeTables: activeTables || 0,
      },
      last30Days: {
        invested: Number(user.last30DaysInvested || 0),
        earned: Math.round(last30DaysEarned * 100) / 100,
        referrals: user.last30DaysReferrals || 0,
      }
    });

  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
