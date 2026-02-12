import { PrismaClient } from '@prisma/client';
import { TABLE_PRICES } from '../ton/config';
import { placePartnerInTable } from '../spillover/placer';
import { notifyAutoPurchase } from '../notification/telegram';

const prisma = new PrismaClient();

// Проверить и обработать автопокупку следующего стола
export async function checkAndProcessAutoPurchase(
  userId: number,
  currentTableNumber: number
): Promise<void> {
  
  console.log(`🔍 Проверяем автопокупку для User ${userId}, Table ${currentTableNumber}`);
  
  // Следующий стол
  const nextTableNumber = currentTableNumber + 1;
  
  if (nextTableNumber > 12) {
    console.log(`✅ Table ${currentTableNumber} - последний стол, автопокупка не требуется`);
    return;
  }
  
  // Проверяем куплен ли следующий стол
  const nextTable = await prisma.table.findFirst({
    where: {
      userId: userId,
      tableNumber: nextTableNumber
    }
  });
  
  if (nextTable) {
    console.log(`✅ Table ${nextTableNumber} уже куплен, автопокупка не требуется`);
    return;
  }
  
  // Получаем накопленные средства из слотов 2-3 текущего стола
  const currentTable = await prisma.table.findFirst({
    where: {
      userId: userId,
      tableNumber: currentTableNumber,
      status: 'ACTIVE'
    },
    include: {
      positions: true
    }
  });
  
  if (!currentTable) {
    console.log(`❌ Текущий стол не найден`);
    return;
  }
  
  // Считаем накопленные средства из слотов 2 и 3
  const slot2 = currentTable.positions.find(p => p.position === 2);
  const slot3 = currentTable.positions.find(p => p.position === 3);
  
  // Проверяем что ОБА слота заполнены
  if (!slot2 || !slot3) {
    console.log(`⏳ Слоты 2-3 ещё не заполнены`);
    return;
  }
  
  if (slot2.status !== 'HELD_FOR_AUTOPURCHASE' || slot3.status !== 'HELD_FOR_AUTOPURCHASE') {
    console.log(`⏳ Слоты 2-3 уже использованы`);
    return;
  }
  
  let accumulated = Number(slot2.amountPaid) + Number(slot3.amountPaid);
  
  console.log(`💰 Накоплено из слотов 2-3: ${accumulated} TON`);
  console.log(`💡 Автопокупка: слоты 2-3 = оплата следующего стола!`);
  
  const nextTablePrice = TABLE_PRICES[nextTableNumber as keyof typeof TABLE_PRICES];
  console.log(`💎 Цена Table ${nextTableNumber}: ${nextTablePrice} TON`);
  
  console.log(`✅ Автопокупка активирована!`);
  
  // АКТИВИРУЕМ следующий стол
  const newTable = await prisma.table.create({
    data: {
      userId: userId,
      tableNumber: nextTableNumber,
      status: 'ACTIVE',
      cycleNumber: 1
    }
  });
  
  console.log(`✅ Table ${nextTableNumber} активирован: ID ${newTable.id}`);
  
  // Обновляем статусы слотов 2-3 (использованы для автопокупки)
  await prisma.tablePosition.update({
    where: { id: slot2.id },
    data: { status: 'PLATFORM_INCOME' }
  });
  
  await prisma.tablePosition.update({
    where: { id: slot3.id },
    data: { status: 'PLATFORM_INCOME' }
  });
  
  console.log(`📝 Слоты 2-3 помечены как использованные`);
  
  // Обновляем статистику
  await prisma.userStats.update({
    where: { userId: userId },
    data: {
      activeTables: {
        increment: 1
      }
    }
  });
  
  console.log(`📊 Статистика обновлена (+1 активный стол)`);
  
  // SPILLOVER: Размещаем пользователя в следующем столе ВВЕРХ
  // Используем накопленную сумму (36 TON = слоты 2+3)
  console.log(`🔄 Запуск spillover для Table ${nextTableNumber}`);
  await placePartnerInTable(userId, nextTableNumber, accumulated);
  
  // Отправляем уведомление
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await notifyAutoPurchase(
      Number(user.telegramId),
      nextTableNumber
    );
  }
  
  console.log(`🎉 Автопокупка Table ${nextTableNumber} завершена!\n`);
}
