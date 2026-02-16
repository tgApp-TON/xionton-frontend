import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const tableNumberParam = request.nextUrl.searchParams.get('tableNumber');

  if (!userId || !tableNumberParam) {
    return NextResponse.json({ error: 'userId and tableNumber required' }, { status: 400 });
  }

  const id = parseInt(userId, 10);
  const tableNumber = parseInt(tableNumberParam, 10);
  if (Number.isNaN(id) || id < 1 || Number.isNaN(tableNumber) || tableNumber < 1 || tableNumber > 12) {
    return NextResponse.json({ error: 'Invalid userId or tableNumber' }, { status: 400 });
  }

  try {
    const { data: tableRow, error: tableErr } = await supabase
      .from('MatrixTable')
      .select('slot1, slot2, slot3, slot4, cycleCount, frozen2Amount')
      .eq('userId', id)
      .eq('tableNumber', tableNumber)
      .maybeSingle();

    if (tableErr) {
      return NextResponse.json({ error: tableErr.message }, { status: 500 });
    }

    const tableData = tableRow
      ? {
          slot1: tableRow.slot1,
          slot2: tableRow.slot2,
          slot3: tableRow.slot3,
          slot4: tableRow.slot4,
          cycleCount: tableRow.cycleCount ?? 0,
          frozen2Amount: tableRow.frozen2Amount != null ? Number(tableRow.frozen2Amount) : null,
        }
      : null;

    const slotIds = tableData
      ? [tableData.slot1, tableData.slot2, tableData.slot3, tableData.slot4].filter((s): s is number => s != null)
      : [];
    const uniqueIds = [...new Set(slotIds)];

    let slotUsers: { slot1: { nickname: string } | null; slot2: { nickname: string } | null; slot3: { nickname: string } | null; slot4: { nickname: string } | null } = {
      slot1: null,
      slot2: null,
      slot3: null,
      slot4: null,
    };

    if (uniqueIds.length > 0) {
      const { data: users } = await supabase.from('User').select('id, nickname').in('id', uniqueIds);
      const nickMap: Record<number, string> = {};
      (users ?? []).forEach((u: any) => {
        nickMap[u.id] = u.nickname ?? `User ${u.id}`;
      });
      if (tableData) {
        slotUsers.slot1 = tableData.slot1 != null ? { nickname: nickMap[tableData.slot1] ?? `#${tableData.slot1}` } : null;
        slotUsers.slot2 = tableData.slot2 != null ? { nickname: nickMap[tableData.slot2] ?? `#${tableData.slot2}` } : null;
        slotUsers.slot3 = tableData.slot3 != null ? { nickname: nickMap[tableData.slot3] ?? `#${tableData.slot3}` } : null;
        slotUsers.slot4 = tableData.slot4 != null ? { nickname: nickMap[tableData.slot4] ?? `#${tableData.slot4}` } : null;
      }
    }

    const { data: payouts } = await supabase
      .from('PayoutLog')
      .select('amount, slotNumber, createdAt')
      .eq('toUserId', id)
      .eq('tableNumber', tableNumber)
      .order('createdAt', { ascending: false })
      .limit(10);

    const payoutHistory = (payouts ?? []).map((p: any) => ({
      amount: Number(p.amount),
      slotNumber: p.slotNumber,
      createdAt: p.createdAt,
    }));

    const { data: allPayouts } = await supabase
      .from('PayoutLog')
      .select('amount')
      .eq('toUserId', id)
      .eq('tableNumber', tableNumber);

    const totalEarned = (allPayouts ?? []).reduce((acc: number, p: any) => acc + Number(p.amount ?? 0), 0);
    const payoutCount = (allPayouts ?? []).length;

    return NextResponse.json({
      tableData,
      slotUsers,
      totalEarned: Math.round(totalEarned * 100) / 100,
      payoutCount,
      payoutHistory,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch table detail';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
