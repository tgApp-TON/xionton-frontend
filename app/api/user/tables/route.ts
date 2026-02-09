import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    // Get user's tables
    const { data: tables, error } = await supabase
      .from('Table')
      .select(`
        id,
        tableNumber,
        status,
        cycleNumber,
        createdAt,
        closedAt
      `)
      .eq('userId', parseInt(userId))
      .order('tableNumber', { ascending: true });

    if (error) throw error;

    // Get positions for each table
    const tablesWithPositions = await Promise.all(
      (tables || []).map(async (table) => {
        const { data: positions } = await supabase
          .from('TablePosition')
          .select('id, position, partnerUserId, amountPaid, status')
          .eq('tableId', table.id)
          .order('position', { ascending: true });

        return {
          ...table,
          positions: positions || [],
          filledSlots: positions?.length || 0
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      tables: tablesWithPositions 
    });
  } catch (error) {
    console.error('Tables fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tables' 
    }, { status: 500 });
  }
}
