import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const { data: tables, error } = await supabase
      .from('Table')
      .select('id, tableNumber, status, cycleNumber, createdAt, closedAt')
      .eq('userId', parseInt(userId))
      .order('tableNumber', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, tables: tables || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch tables' }, { status: 500 });
  }
}
