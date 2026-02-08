import { TABLE_PRICES, SYSTEM_WALLETS, PLATFORM_FEE } from './config';
import { prisma } from '../db';

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
  const table = await prisma.table.create({
    data: {
      userId: userId,
      tableNumber: tableNumber,
      status: 'ACTIVE',
      cycleNumber: 1
    }
  });
  
  await prisma.transaction.updateMany({
    where: {
      txHash: txHash,
      status: 'pending'
    },
    data: {
      status: 'completed'
    }
  });
  
  await prisma.userStats.update({
    where: { userId: userId },
    data: {
      activeTables: {
        increment: 1
      }
    }
  });
  
  return table;
}
