/**
 * Matrix TON business logic engine.
 * Pure functions; no HTTP. Works with Supabase client.
 */

const GAS = 0.5;
const COMMISSION = 0.1;
const TABLE_PRICES: Record<number, number> = {
  1: 10, 2: 20, 3: 40, 4: 80, 5: 160, 6: 320, 7: 640, 8: 1280,
  9: 2560, 10: 5120, 11: 10240, 12: 20480,
};

export interface MatrixUser {
  id: number;
  referrerId: number | null;
  walletBalance: number;
  totalEarned: number;
}

export interface MatrixTable {
  id: number;
  userId: number;
  tableNumber: number;
  slot1: number | null;
  slot2: number | null;
  slot3: number | null;
  slot4: number | null;
  frozen2Amount: number | null;
  cycleCount: number;
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

type SupabaseClient = any;

function num(val: unknown): number {
  if (val == null) return 0;
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  return Number.isNaN(n) ? 0 : n;
}

/** Pay net amount to user: User.walletBalance += net, User.totalEarned += net, UserStats.totalEarned += net, log payout, app revenue GAS */
async function pay(
  toUserId: number,
  amount: number,
  tableNumber: number,
  slotNumber: number,
  logType: 'SLOT' | 'FROZEN' | 'GAS',
  supabase: SupabaseClient,
  fromUserId?: number
): Promise<void> {
  const net = r2(amount - GAS);
  if (net <= 0) {
    console.log('[matrix-engine] pay: net <= 0, skip', { toUserId, amount, net });
    return;
  }

  const { data: user, error: userErr } = await supabase.from('User').select('walletBalance, totalEarned').eq('id', toUserId).single();
  if (userErr) console.error('[matrix-engine] pay: User select error', { toUserId, error: userErr });
  const currentWallet = num((user as any)?.walletBalance);
  const currentUserEarned = num((user as any)?.totalEarned);
  const newWallet = r2(currentWallet + net);
  const newTotalEarned = r2(currentUserEarned + net);

  const { error: userUpd } = await supabase.from('User').update({ walletBalance: newWallet, totalEarned: newTotalEarned }).eq('id', toUserId);
  if (userUpd) console.error('[matrix-engine] pay: User walletBalance/totalEarned update error', { toUserId, error: userUpd });

  const { data: stats } = await supabase.from('UserStats').select('totalEarned').eq('userId', toUserId).single();
  const currentEarned = num((stats as any)?.totalEarned);
  const newEarned = r2(currentEarned + net);
  const { error: upsertErr } = await supabase.from('UserStats').upsert(
    { userId: toUserId, totalEarned: newEarned, updatedAt: new Date().toISOString() },
    { onConflict: 'userId' }
  );
  if (upsertErr) {
    const { error: updateErr } = await supabase.from('UserStats').update({ totalEarned: newEarned, updatedAt: new Date().toISOString() }).eq('userId', toUserId);
    if (updateErr) {
      const { error: insertErr } = await supabase.from('UserStats').insert({ userId: toUserId, totalEarned: newEarned, updatedAt: new Date().toISOString() });
      if (insertErr) console.error('[matrix-engine] pay: UserStats insert error', { toUserId, error: insertErr });
    }
  }

  const { error: logErr } = await supabase.from('PayoutLog').insert({
    fromUserId: fromUserId ?? toUserId,
    toUserId: toUserId,
    amount: net,
    tableNumber,
    slotNumber,
    type: logType,
  });
  if (logErr) console.error('[matrix-engine] pay: PayoutLog insert error', { toUserId, error: logErr });

  const { error: revErr } = await supabase.from('AppRevenue').insert({
    amount: GAS,
    type: 'GAS',
    sourceUserId: toUserId,
    tableNumber,
  });
  if (revErr) console.error('[matrix-engine] pay: AppRevenue insert error', { toUserId, error: revErr });
}

/** Go up referrer chain until someone has MatrixTable for tableNumber; MASTER (id=1) is fallback.
 *  Starts from userId's REFERRER (sponsor), not the user themselves - so buyer does not count as "parent". */
export async function findParentWithTable(
  userId: number,
  tableNumber: number,
  supabase: SupabaseClient
): Promise<MatrixUser | null> {
  const { data: startUser } = await supabase.from('User').select('referrerId').eq('id', userId).single();
  let currentId: number | null = (startUser as any)?.referrerId ?? null;
  if (currentId == null) currentId = 1;
  const seen = new Set<number>();
  console.log('[matrix-engine] findParentWithTable', { userId, tableNumber, startFrom: currentId });

  while (currentId != null && !seen.has(currentId)) {
    seen.add(currentId);
    const { data: user } = await supabase
      .from('User')
      .select('id, referrerId, walletBalance')
      .eq('id', currentId)
      .single();
    if (!user) {
      console.log('[matrix-engine] findParentWithTable: no user for', currentId);
      break;
    }
    const referrerId = (user as any).referrerId ?? null;

    const { data: table } = await supabase
      .from('MatrixTable')
      .select('id')
      .eq('userId', currentId)
      .eq('tableNumber', tableNumber)
      .maybeSingle();
    if (table) {
      console.log('[matrix-engine] findParentWithTable: found parent', { parentId: currentId, tableNumber });
      const { data: u } = await supabase.from('User').select('id, referrerId, walletBalance').eq('id', currentId).single();
      const { data: s } = await supabase.from('UserStats').select('totalEarned').eq('userId', currentId).single();
      return {
        id: (u as any).id,
        referrerId: (u as any).referrerId ?? null,
        walletBalance: num((u as any)?.walletBalance),
        totalEarned: num((s as any)?.totalEarned),
      };
    }

    currentId = referrerId;
  }

  console.log('[matrix-engine] findParentWithTable: using MASTER (id=1)');
  const { data: master } = await supabase.from('User').select('id, referrerId, walletBalance').eq('id', 1).single();
  const { data: masterStats } = await supabase.from('UserStats').select('totalEarned').eq('userId', 1).single();
  if (master)
    return {
      id: 1,
      referrerId: (master as any).referrerId ?? null,
      walletBalance: num((master as any)?.walletBalance),
      totalEarned: num((masterStats as any)?.totalEarned),
    };
  return null;
}

/**
 * Fill next slot on owner's table (or overflow to upline). Recursive.
 * newMemberId = user who is filling the slot; amount = payment amount for this fill.
 */
export async function processSlotFill(
  ownerId: number,
  tableNumber: number,
  newMemberId: number,
  amount: number,
  supabase: SupabaseClient,
  depth: number = 0
): Promise<void> {
  if (depth > 500) throw new Error('processSlotFill: max depth exceeded');
  console.log('[matrix-engine] processSlotFill', { ownerId, tableNumber, newMemberId, amount, depth });

  const { data: tableRow, error: tableErr } = await supabase
    .from('MatrixTable')
    .select('id, userId, tableNumber, slot1, slot2, slot3, slot4, frozen2Amount, cycleCount')
    .eq('userId', ownerId)
    .eq('tableNumber', tableNumber)
    .maybeSingle();
  if (tableErr) console.error('[matrix-engine] processSlotFill: MatrixTable select error', { ownerId, tableNumber, error: tableErr });

  if (!tableRow) {
    if (ownerId === 1) throw new Error('MASTER (id=1) must have MatrixTable rows for tables 1-12; seed the database.');
    const parent = await findParentWithTable(ownerId, tableNumber, supabase);
    if (!parent) throw new Error('No parent with table found');
    return processSlotFill(parent.id, tableNumber, newMemberId, amount, supabase, depth + 1);
  }

  const t = tableRow as any;
  const slot1 = t.slot1 != null ? Number(t.slot1) : null;
  const slot2 = t.slot2 != null ? Number(t.slot2) : null;
  const slot3 = t.slot3 != null ? Number(t.slot3) : null;
  const slot4 = t.slot4 != null ? Number(t.slot4) : null;

  if (slot1 != null && slot2 != null && slot3 != null && slot4 != null) {
    const parent = await findParentWithTable(ownerId, tableNumber, supabase);
    if (!parent) throw new Error('No parent with table found (full)');
    return processSlotFill(parent.id, tableNumber, newMemberId, amount, supabase, depth + 1);
  }

  const tableId = t.id;
  const frozen2 = t.frozen2Amount != null ? num(t.frozen2Amount) : null;

  let slotNum: 1 | 2 | 3 | 4;
  if (slot1 == null) slotNum = 1;
  else if (slot2 == null) slotNum = 2;
  else if (slot3 == null) slotNum = 3;
  else slotNum = 4;

  const updates: any = {};
  if (slotNum === 1) updates.slot1 = newMemberId;
  if (slotNum === 2) updates.slot2 = newMemberId;
  if (slotNum === 3) updates.slot3 = newMemberId;
  if (slotNum === 4) updates.slot4 = newMemberId;

  console.log('[matrix-engine] processSlotFill: updating slot', { ownerId, tableNumber, tableId, slotNum, newMemberId, updates });
  const { error: slotUpdErr } = await supabase.from('MatrixTable').update(updates).eq('id', tableId);
  if (slotUpdErr) console.error('[matrix-engine] processSlotFill: MatrixTable slot update error', { tableId, error: slotUpdErr });

  if (slotNum === 1) {
    await pay(ownerId, amount, tableNumber, 1, 'SLOT', supabase, newMemberId);
    return;
  }

  if (slotNum === 2) {
    const nextTable = tableNumber + 1;
    const hasNext = nextTable <= 12;
    const { data: next } = hasNext
      ? await supabase.from('MatrixTable').select('id').eq('userId', ownerId).eq('tableNumber', nextTable).maybeSingle()
      : { data: null };
    if (tableNumber === 12 || (hasNext && next)) {
      await pay(ownerId, amount, tableNumber, 2, 'SLOT', supabase, newMemberId);
    } else {
      await supabase.from('MatrixTable').update({ frozen2Amount: amount }).eq('id', tableId);
    }
    return;
  }

  if (slotNum === 3) {
    await pay(ownerId, amount, tableNumber, 3, 'SLOT', supabase, newMemberId);
    if (frozen2 != null && frozen2 > 0) {
      await pay(ownerId, frozen2, tableNumber, 2, 'FROZEN', supabase, newMemberId);
      await supabase.from('MatrixTable').update({ frozen2Amount: null }).eq('id', tableId);
    }
    const nextNum = tableNumber + 1;
    const priceNext = TABLE_PRICES[nextNum];
    if (priceNext != null) {
      const { data: existingNext } = await supabase
        .from('MatrixTable')
        .select('id')
        .eq('userId', ownerId)
        .eq('tableNumber', nextNum)
        .maybeSingle();
      const { data: owner } = await supabase.from('User').select('walletBalance').eq('id', ownerId).single();
      const wallet = num((owner as any)?.walletBalance);
      const totalCostNext = r2(priceNext + GAS); // price + blockchain fee
      if (!existingNext && wallet >= totalCostNext) { // проверка totalCost
        const commission = r2(priceNext * COMMISSION);
        await supabase.from('User').update({ walletBalance: r2(wallet - totalCostNext) }).eq('id', ownerId); // списываем totalCost
        await supabase.from('MatrixTable').insert({
          userId: ownerId,
          tableNumber: nextNum,
          slot1: null,
          slot2: null,
          slot3: null,
          slot4: null,
          frozen2Amount: null,
          status: 'ACTIVE',
          cycleCount: 0,
        });
        await supabase.from('AppRevenue').insert({
          amount: commission,
          type: 'COMMISSION',
          sourceUserId: ownerId,
          tableNumber: nextNum,
        });
        await supabase.from('AppRevenue').insert({
          amount: GAS,
          type: 'GAS',
          sourceUserId: ownerId,
          tableNumber: nextNum,
        });
        const { data: statsRow } = await supabase.from('UserStats').select('activeTables').eq('userId', ownerId).single();
        const activeTables = (statsRow as any) ? Number((statsRow as any).activeTables) || 0 : 0;
        const { error: ue } = await supabase.from('UserStats').update({ activeTables: activeTables + 1, updatedAt: new Date().toISOString() }).eq('userId', ownerId);
        if (ue) await supabase.from('UserStats').insert({ userId: ownerId, activeTables: 1, updatedAt: new Date().toISOString() });
        const parent = await findParentWithTable(ownerId, nextNum, supabase);
        if (parent) {
          const fillAmount = r2(priceNext * (1 - COMMISSION));
          await processSlotFill(parent.id, nextNum, ownerId, fillAmount, supabase, depth + 1);
        }
      }
    }
    return;
  }

  if (slotNum === 4) {
    await supabase
      .from('MatrixTable')
      .update({
        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null,
        frozen2Amount: null,
        cycleCount: (t.cycleCount ?? 0) + 1,
      })
      .eq('id', tableId);

    const { data: statsRow } = await supabase.from('UserStats').select('totalCycles').eq('userId', ownerId).single();
    const totalCycles = (statsRow as any) ? Number((statsRow as any).totalCycles) || 0 : 0;
    await supabase.from('UserStats').update({ totalCycles: totalCycles + 1, updatedAt: new Date().toISOString() }).eq('userId', ownerId);
    const parent = await findParentWithTable(ownerId, tableNumber, supabase);
    if (parent) {
      await processSlotFill(parent.id, tableNumber, ownerId, amount, supabase, depth + 1);
    }
  }
}

export async function engineBuyTable(
  userId: number,
  tableNumber: number,
  supabase: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  const price = TABLE_PRICES[tableNumber];
  if (price == null) return { success: false, error: 'Invalid table number' };
  const totalCost = r2(price + GAS); // price + blockchain fee
  const { data: user, error: userErr } = await supabase.from('User').select('id, walletBalance').eq('id', userId).single();
  if (userErr || !user) return { success: false, error: 'User not found' };
  const wallet = num((user as any).walletBalance);
  if (wallet < totalCost) return { success: false, error: 'Insufficient balance' }; // проверка totalCost
  const { data: existing } = await supabase
    .from('MatrixTable')
    .select('id')
    .eq('userId', userId)
    .eq('tableNumber', tableNumber)
    .maybeSingle();
  if (existing) return { success: false, error: 'Already own this table' };
  if (tableNumber > 1) {
    const { data: prev } = await supabase
      .from('MatrixTable')
      .select('id')
      .eq('userId', userId)
      .eq('tableNumber', tableNumber - 1)
      .maybeSingle();
    if (!prev) return { success: false, error: 'Must own previous table first' };
  }
  const commission = r2(price * COMMISSION);
  await supabase.from('User').update({ walletBalance: r2(wallet - totalCost) }).eq('id', userId); // списываем totalCost
  const { data: inserted } = await supabase
    .from('MatrixTable')
    .insert({
      userId,
      tableNumber,
      slot1: null,
      slot2: null,
      slot3: null,
      slot4: null,
      frozen2Amount: null,
      status: 'ACTIVE',
      cycleCount: 0,
    })
    .select('id')
    .single();
  if (!inserted) return { success: false, error: 'Failed to create table' };
  await supabase.from('AppRevenue').insert({
    amount: commission,
    type: 'COMMISSION',
    sourceUserId: userId,
    tableNumber,
  });
  await supabase.from('AppRevenue').insert({
    amount: GAS,
    type: 'GAS',
    sourceUserId: userId,
    tableNumber,
  });
  const { data: statsRow } = await supabase.from('UserStats').select('activeTables').eq('userId', userId).single();
  const activeTables = (statsRow as any) ? Number((statsRow as any).activeTables) || 0 : 0;
  const { error: ue } = await supabase.from('UserStats').update({ activeTables: activeTables + 1, updatedAt: new Date().toISOString() }).eq('userId', userId);
  if (ue) await supabase.from('UserStats').insert({ userId, activeTables: 1, updatedAt: new Date().toISOString() });
  const { data: sponsor } = await supabase.from('User').select('referrerId').eq('id', userId).single();
  const sponsorId = (sponsor as any)?.referrerId;
  if (sponsorId) {
    const fillAmount = r2(price * (1 - COMMISSION));
    await processSlotFill(sponsorId, tableNumber, userId, fillAmount, supabase);
  }
  return { success: true };
}

/**
 * Call after user is created. Gives them table 1, deducts price, logs commission, fills sponsor's slot.
 */
export async function engineRegisterUser(
  newUserId: number,
  sponsorId: number,
  supabase: SupabaseClient
): Promise<void> {
  const price1 = TABLE_PRICES[1];
  if (price1 == null) throw new Error('Table 1 price not defined');
  const totalCost = r2(price1 + GAS); // price + blockchain fee
  const { data: user } = await supabase.from('User').select('walletBalance').eq('id', newUserId).single();
  const wallet = num((user as any)?.walletBalance);
  const newWallet = r2(wallet - totalCost); // списываем price+GAS
  await supabase.from('User').update({ walletBalance: newWallet }).eq('id', newUserId);
  await supabase.from('MatrixTable').insert({
    userId: newUserId,
    tableNumber: 1,
    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null,
    frozen2Amount: null,
    status: 'ACTIVE',
    cycleCount: 0,
  });
  const commission = r2(price1 * COMMISSION);
  await supabase.from('AppRevenue').insert({
    amount: commission,
    type: 'COMMISSION',
    sourceUserId: newUserId,
    tableNumber: 1,
  });
  await supabase.from('AppRevenue').insert({
    amount: GAS,
    type: 'GAS',
    sourceUserId: newUserId,
    tableNumber: 1,
  });
  const { error: ue } = await supabase.from('UserStats').update({ activeTables: 1, updatedAt: new Date().toISOString() }).eq('userId', newUserId);
  if (ue) await supabase.from('UserStats').insert({ userId: newUserId, activeTables: 1, updatedAt: new Date().toISOString() });
  const fillAmount = r2(price1 * (1 - COMMISSION));
  await processSlotFill(sponsorId, 1, newUserId, fillAmount, supabase);
}
