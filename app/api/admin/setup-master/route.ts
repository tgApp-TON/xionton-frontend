import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Find MASTER user
    const { data: masterUser, error: findError } = await supabase
      .from('User')
      .select('id')
      .eq('nickname', 'MASTER')
      .single();

    if (findError || !masterUser) {
      return NextResponse.json({ error: 'MASTER user not found' }, { status: 404 });
    }

    const masterId = masterUser.id;

    // Update MASTER role to FOUNDER
    const { error: updateError } = await supabase
      .from('User')
      .update({ role: 'FOUNDER' })
      .eq('id', masterId);

    if (updateError) {
      console.error('Error updating MASTER role:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Create all 12 tables for MASTER
    const tables = [];
    for (let tableNumber = 1; tableNumber <= 12; tableNumber++) {
      const { data: table, error: tableError } = await supabase
        .from('Table')
        .insert({
          userId: masterId,
          tableNumber,
          status: 'ACTIVE',
          cycleNumber: 1
        })
        .select()
        .single();

      if (tableError) {
        // Table might already exist, check if it's a duplicate error
        if (tableError.code !== '23505') { // Not a unique constraint violation
          console.error(`Error creating table ${tableNumber}:`, tableError);
        }
      } else {
        tables.push(table);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'MASTER user setup complete',
      masterId,
      tablesCreated: tables.length,
      tables
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
