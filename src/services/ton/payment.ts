import { TABLE_PRICES, SYSTEM_WALLETS, PLATFORM_FEE } from './config';
import { prisma } from '../db';
import { placePartnerInTable } from '../spillover/placer';

// Экспортируем TABLE_PRICES
export { TABLE_PRICES };

// Генерация payment ссылки для TON
export function generatePaymentLink(
  userId: number,
  tableNumber: number,
  walletAddress: string
): string {
  const price = TABLE_PRICES[tableNumber as keyof typeof TABLE_PRICES];
  
  if (!price) {
    throw new Error('Invalid table number');
  }
  
  // Определяем куда идут деньги (Table 1 -> INCOME, остальные -> OPERATIONS)
  const recipient = tableNumber === 1 ? SYSTEM_WALLETS.INCOME : SYSTEM_WALLETS.OPERATIONS;
  
  // Comment для идентификации платежа
  const comment = `table_${tableNumber}_user_${userId}_${Date.now()}`;
  
  // TON payment URL (ton://transfer)
  const paymentUrl = `ton://transfer/${recipient}?amount=${price * 1e9}&text=${encodeURIComponent(comment)}`;
  
  return paymentUrl;
}

// Генерация QR кода для платежа
export function generatePaymentQR(paymentUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`;
}

// Создать запись о платеже в БД
export async function createPaymentRecord(
  tableNumber: number,
  amount: number,
  fromAddress: string,
  toAddress: string,
  comment: string
) {
  return await prisma.transaction.create({
    data: {
      txHash: '',
      fromAddress: fromAddress,
      toAddress: toAddress,
      amount: amount,
      fee: 0,
      type: 'TABLE_PURCHASE',
      tableNumber: tableNumber,
      comment: comment,
      status: 'pending'
    }
  });
}

// Активировать стол после оплаты
export async function activateTable(
  userId: number,
  tableNumber: number,
  txHash: string
) {
  console.log(`🎯 Активируем Table ${tableNumber} для User ${userId}`);
  
  // Создать стол пользователя (пустой)
  const table = await prisma.table.create({
    data: {
      userId: userId,
      tableNumber: tableNumber,
      status: 'ACTIVE',
      cycleNumber: 1
    }
  });
  
  console.log(`✅ Стол создан: ID ${table.id}`);
  
  // Обновить транзакцию
  await prisma.transaction.updateMany({
    where: {
      txHash: txHash,
      status: 'pending'
    },
    data: {
      status: 'completed'
    }
  });
  
  // Обновить статистику
  await prisma.userStats.update({
    where: { userId: userId },
    data: {
      activeTables: {
        increment: 1
      }
    }
  });
  
  console.log(`📊 Статистика обновлена`);

  // TABLE 1 SPECIAL RULES
  if (tableNumber === 1) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referrerId: true },
    });
    const referrerId = user?.referrerId ?? null;
    if (referrerId === 1) {
      // MASTER (id=1): 100% already to INCOME_WALLET, partner NOT visible, no placement
      console.log(`👑 Table 1: referrer is MASTER — partner not placed in any table`);
      return table;
    }
    // Regular referrer: 10% INCOME (already), 90% (9 TON) to slots — place partner in referrer's Table 1
    console.log(`🔄 Table 1: placing partner in referrer's Table 1 (9 TON to slots)`);
    await placePartnerInTable(userId, 1, 9);
    return table;
  }

  // TABLES 2+: spillover — place partner upline
  const price = TABLE_PRICES[tableNumber as keyof typeof TABLE_PRICES];
  const afterFee = price * (1 - PLATFORM_FEE);
  if (afterFee > 0) {
    console.log(`🔄 Запуск spillover для User ${userId}, Table ${tableNumber}`);
    await placePartnerInTable(userId, tableNumber, afterFee);
  }

  return table;
}
