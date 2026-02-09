import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get MASTER user with tables
    const { data: masterUser, error: userError } = await supabase
      .from('User')
      .select('id, nickname, role, telegramId')
      .eq('nickname', 'MASTER')
      .single();

    if (userError || !masterUser) {
      return NextResponse.json({ error: 'MASTER user not found' }, { status: 404 });
    }

    // Get all tables for MASTER
    const { data: tables, error: tablesError } = await supabase
      .from('Table')
      .select('id, tableNumber, status, cycleNumber')
      .eq('userId', masterUser.id)
      .order('tableNumber');

    return NextResponse.json({
      success: true,
      user: masterUser,
      tables: tables || [],
      tablesCount: tables?.length || 0
    });
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
