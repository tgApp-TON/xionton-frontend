import { PrismaClient } from '@prisma/client';
import { findActiveTableUpline, getNextAvailablePosition, isTableFull } from './finder';
import { TABLE_PRICES } from '../ton/config';
import { notifySpillover, notifyTableClosed } from '../notification/telegram';

const prisma = new PrismaClient();

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
    console.log(`🎉 Стол ${tableId} заполнен! Обрабатываем закрытие...`);
    await handleTableClosure(tableId, tableOwnerId, tableNumber);
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
    // СЛОТ 1: Деньги владельцу СРАЗУ (для Table 2-12)
    if (tableNumber > 1) {
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
  }
  
  if (position === 2 || position === 3) {
    // СЛОТЫ 2-3: Держим для автопокупки
    console.log(`💼 Слот ${position}: держим ${amount} TON для автопокупки`);
    
    // Проверяем автопокупку после заполнения слота 3
    if (position === 3) {
      const { checkAndProcessAutoPurchase } = await import('../autopurchase/processor');
      await checkAndProcessAutoPurchase(ownerId, tableNumber);
    }
  }
  
  if (position === 4) {
    // СЛОТ 4: Реактивация
    console.log(`🔄 Слот 4: ${amount} TON для реактивации`);
  }
}

// Обработка закрытия стола
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
  
  // Партнёр из слота 4 делает spillover
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
