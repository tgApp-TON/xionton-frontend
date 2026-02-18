import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

    await supabase.rpc('update_30day_stats', { p_user_id: parseInt(userId) });

    const { data: user, error: userError } = await supabase
      .from('User')
      .select('nickname, totalEarned, totalInvestedReal, last30DaysEarned, last30DaysInvested, last30DaysReferrals, registeredAt')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

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
        earned: Number(user.totalEarned || 0),
        referrals: totalReferrals || 0,
        activeTables: activeTables || 0,
      },
      last30Days: {
        invested: Number(user.last30DaysInvested || 0),
        earned: Number(user.last30DaysEarned || 0),
        referrals: user.last30DaysReferrals || 0,
      }
    });

  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
