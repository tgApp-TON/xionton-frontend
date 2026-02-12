import { PrismaClient } from '@prisma/client';
import { findActiveTableUpline, getNextAvailablePosition, isTableFull } from './finder';
import { TABLE_PRICES } from '../ton/config';
import { notifySpillover, notifyTableClosed } from '../notification/telegram';

const prisma = new PrismaClient();

/**
 * SPILLOVER RULES:
 * - Slots 1/2/3: partner STOPS here; slot 1 → payout to owner, 2–3 → held for autopurchase; spillover ENDS.
 * - Slot 4 (non-MASTER): money → OPERATIONS_WALLET (reactivation), owner gets 0; table CLOSES & REACTIVATES; partner from slot 4 continues spillover UP.
 * - Slot 4 (MASTER): money → MASTER wallet; table reactivates; spillover STOPS (end of chain).
 * Referral bond is PERMANENT (never changed during spillover).
 */

// Разместить партнёра в столе
export async function placePartnerInTable(
  partnerUserId: number,
  tableNumber: number,
  amount: number
): Promise<void> {
  
  console.log(`🔄 Размещаем User ${partnerUserId} в Table ${tableNumber}`);
  
  // Найти активный стол вверх
  const placement = await findActiveTableUpline(partnerUserId, tableNumber);
  
  if (!placement) {
    console.error(`❌ Не найден активный стол для размещения!`);
    return;
  }
  
  const { userId: tableOwnerId, tableId } = placement;
  
  console.log(`✅ Найден стол: Table ${tableNumber} владельца User ${tableOwnerId}`);
  
  // Определяем позицию
  const position = await getNextAvailablePosition(tableId);
  
  console.log(`📍 Позиция: ${position}`);
  
  // Получаем данные партнёра
  const partner = await prisma.user.findUnique({
    where: { id: partnerUserId }
  });
  
  // Получаем данные стола для cycleNumber
  const table = await prisma.table.findUnique({
    where: { id: tableId }
  });
  
  if (!partner || !table) {
    console.error('❌ Партнёр или стол не найден');
    return;
  }
  
  // Создаём запись о размещении
  await prisma.tablePosition.create({
    data: {
      tableId: tableId,
      partnerUserId: partnerUserId,
      partnerNickname: partner.nickname,
      position: position,
      cycleNumber: table.cycleNumber,
      amountPaid: amount,
      amountReceived: position === 1 ? amount : 0,
      status: position === 1 ? 'PAID_OUT' : 'HELD_FOR_AUTOPURCHASE'
    }
  });
  
  console.log(`✅ Партнёр размещён в позицию ${position}`);
  
  // Обработка по позициям
  await processPosition(tableId, position, tableOwnerId, partnerUserId, tableNumber, amount);
  
  // Проверяем заполнен ли стол
  if (await isTableFull(tableId)) {
    console.log(`🎉 Стол ${tableId} заполнен!`);
    
    // КРИТИЧНО: Проверяем это MASTER или обычный пользователь
    if (tableOwnerId === 1) {
      console.log(`👑 MASTER стол - НЕ закрываем, просто очищаем позиции`);
      await handleMasterTableReset(tableId, tableNumber);
    } else {
      console.log(`👤 Обычный стол - обрабатываем закрытие и реактивацию`);
      await handleTableClosure(tableId, tableOwnerId, tableNumber);
    }
  }
}

// Обработка позиции
async function processPosition(
  tableId: number,
  position: number,
  ownerId: number,
  partnerId: number,
  tableNumber: number,
  amount: number
) {
  
  if (position === 1) {
    // СЛОТ 1: Деньги владельцу СРАЗУ
    console.log(`💰 Слот 1: выплата ${amount} TON владельцу ${ownerId}`);
    
    // Добавляем в pending_payouts для batch выплаты
    await prisma.pendingPayout.create({
      data: {
        userId: ownerId,
        amount: amount,
        reason: 'slot_1',
        tableNumber: tableNumber,
        status: 'pending',
        payoutMethod: 'BATCH'
      }
    });
    
    console.log(`📝 Добавлено в pending payouts`);
    
    // Обновляем статистику
    await prisma.userStats.update({
      where: { userId: ownerId },
      data: {
        totalEarned: {
          increment: amount
        }
      }
    });
  }
  
  if (position === 2 || position === 3) {
    // СЛОТЫ 2-3: Держим для автопокупки
    console.log(`💼 Слот ${position}: держим ${amount} TON для автопокупки`);
    
    // Проверяем автопокупку после заполнения слота 3
    if (position === 3 && ownerId !== 1) { // MASTER не нуждается в автопокупке
      const { checkAndProcessAutoPurchase } = await import('../autopurchase/processor');
      await checkAndProcessAutoPurchase(ownerId, tableNumber);
    }
  }
  
  if (position === 4) {
    // SLOT 4 RULE: non-MASTER → money to OPERATIONS (reactivation), owner gets 0. MASTER → money to MASTER wallet, spillover STOPS.
    if (ownerId === 1) {
      // MASTER slot 4 exception: money → MASTER wallet, table reactivates, spillover STOPS (handled in handleMasterTableReset — no recursion)
      console.log(`👑 Слот 4 MASTER: ${amount} TON → MASTER wallet`);
      await prisma.pendingPayout.create({
        data: {
          userId: 1,
          amount: amount,
          reason: 'slot_4_master',
          tableNumber: tableNumber,
          status: 'pending',
          payoutMethod: 'BATCH',
        },
      });
      await prisma.userStats.update({
        where: { userId: 1 },
        data: { totalEarned: { increment: amount } },
      });
      const pos = await prisma.tablePosition.findFirst({
        where: { tableId, position: 4, partnerUserId: partnerId },
      });
      if (pos) {
        await prisma.tablePosition.update({
          where: { id: pos.id },
          data: { status: 'PAID_OUT' },
        });
      }
    } else {
      // Non-MASTER: money → OPERATIONS_WALLET (for reactivation), table owner gets 0 TON
      console.log(`🔄 Слот 4: ${amount} TON → OPERATIONS (реактивация), владелец 0 TON`);
      const pos = await prisma.tablePosition.findFirst({
        where: { tableId, position: 4, partnerUserId: partnerId },
      });
      if (pos) {
        await prisma.tablePosition.update({
          where: { id: pos.id },
          data: { status: 'PLATFORM_INCOME' },
        });
      }
    }
  }
}

// Обработка стола MASTER - просто очищаем позиции
async function handleMasterTableReset(
  tableId: number,
  tableNumber: number
) {
  
  console.log(`👑 Обработка MASTER стола ${tableId}...`);
  
  // ВАЖНО: MASTER столы НЕ обрабатывают spillover слота 4
  // Просто очищаем все позиции и готовы принимать новых
  
  // ОЧИЩАЕМ позиции (MASTER стол остаётся активным)
  await prisma.tablePosition.deleteMany({
    where: { tableId: tableId }
  });
  
  console.log(`✅ MASTER Table ${tableNumber} очищен, готов принимать новых партнёров\n`);
}

// Обработка закрытия стола (для обычных пользователей)
async function handleTableClosure(
  tableId: number,
  ownerId: number,
  tableNumber: number
) {
  
  // Получаем стол
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { positions: true }
  });
  
  if (!table) return;
  
  // Закрываем стол
  await prisma.table.update({
    where: { id: tableId },
    data: {
      status: 'CLOSED',
      closedAt: new Date()
    }
  });
  
  console.log(`✅ Стол ${tableId} закрыт`);
  
  // Реактивируем стол (новый цикл)
  const newTable = await prisma.table.create({
    data: {
      userId: ownerId,
      tableNumber: tableNumber,
      status: 'ACTIVE',
      cycleNumber: table.cycleNumber + 1
    }
  });
  
  console.log(`🔄 Стол ${tableNumber} реактивирован, цикл #${table.cycleNumber + 1}`);
  
  // Обновляем статистику
  const cycleField = `table${tableNumber}Cycles` as any;
  await prisma.userStats.update({
    where: { userId: ownerId },
    data: {
      [cycleField]: {
        increment: 1
      }
    }
  });
  
  // Отправляем уведомление
  const user = await prisma.user.findUnique({ where: { id: ownerId } });
  if (user) {
    const totalEarned = table.positions.reduce((sum, p) => sum + Number(p.amountPaid), 0);
    await notifyTableClosed(
      Number(user.telegramId),
      tableNumber,
      table.cycleNumber,
      totalEarned
    );
  }
  
  // Партнёр из слота 4 делает spillover (только для обычных пользователей!)
  const slot4Partner = table.positions.find(p => p.position === 4);
  if (slot4Partner) {
    console.log(`🔄 Партнёр ${slot4Partner.partnerUserId} из слота 4 делает spillover`);
    // Рекурсивно размещаем
    await placePartnerInTable(
      slot4Partner.partnerUserId,
      tableNumber,
      Number(slot4Partner.amountPaid)
    );
  }
}

export { findActiveTableUpline, getNextAvailablePosition, isTableFull };
