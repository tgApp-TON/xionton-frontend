import { PrismaClient } from '@prisma/client';
import { getWalletTransactions } from '../services/ton/client';
import { SYSTEM_WALLETS, TABLE_PRICES } from '../services/ton/config';
import { activateTable } from '../services/ton/payment';
import { notifyTableActivated } from '../services/notification/telegram';

const prisma = new PrismaClient();

let lastProcessedLT: { [key: string]: string } = {};

async function monitorPayments() {
  console.log('🔍 Проверяем платежи...');
  
  try {
    await checkWallet(SYSTEM_WALLETS.INCOME, 'INCOME');
    await checkWallet(SYSTEM_WALLETS.OPERATIONS, 'OPERATIONS');
  } catch (error) {
    console.error('❌ Ошибка мониторинга:', error);
  }
}

async function checkWallet(walletAddress: string, walletType: string) {
  if (!walletAddress || walletAddress.includes('xxx')) {
    console.log(`⚠️ ${walletType}: кошелёк не настроен`);
    return;
  }
  
  console.log(`💰 Проверяем ${walletType}: ${walletAddress}`);
  
  const transactions = await getWalletTransactions(walletAddress, 20);
  
  console.log(`📊 Найдено транзакций: ${transactions.length}`);
  
  for (const tx of transactions) {
    try {
      const txHash = tx.hash().toString('hex');
      const lt = tx.lt.toString();
      
      if (lastProcessedLT[walletType] && lt <= lastProcessedLT[walletType]) {
        continue;
      }
      
      lastProcessedLT[walletType] = lt;
      
      const existing = await prisma.transaction.findUnique({
        where: { txHash }
      });
      
      if (existing) continue;
      
      // Проверяем входящее сообщение
      if (!tx.inMessage || tx.inMessage.info.type !== 'internal') {
        continue;
      }
      
      const inMsg = tx.inMessage.info;
      const amount = Number(inMsg.value.coins) / 1e9;
      const fromAddress = inMsg.src?.toString() || '';
      
      // Парсим comment из body
      let comment = '';
      if (tx.inMessage.body) {
        try {
          const slice = tx.inMessage.body.beginParse();
          if (slice.remainingBits >= 32) {
            const op = slice.loadUint(32);
            if (op === 0 && slice.remainingBits > 0) {
              comment = slice.loadStringTail();
            }
          }
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }
      
      if (!comment || !comment.startsWith('table_')) {
        console.log(`ℹ️ Транзакция без comment: ${amount} TON от ${fromAddress.slice(0, 10)}...`);
        continue;
      }
      
      const parts = comment.split('_');
      if (parts.length < 4) continue;
      
      const tableNumber = parseInt(parts[1]);
      const userId = parseInt(parts[3]);
      
      const expectedPrice = TABLE_PRICES[tableNumber as keyof typeof TABLE_PRICES];
      
      if (amount < expectedPrice) {
        console.log(`⚠️ Недостаточная сумма: ${amount} < ${expectedPrice}`);
        continue;
      }
      
      console.log(`✅ НАЙДЕН ПЛАТЁЖ: Table ${tableNumber} от User ${userId}, сумма ${amount} TON`);
      
      // Сохраняем транзакцию
      await prisma.transaction.create({
        data: {
          txHash: txHash,
          fromAddress: fromAddress,
          toAddress: walletAddress,
          amount: amount,
          fee: 0,
          type: 'TABLE_PURCHASE',
          tableNumber: tableNumber,
          comment: comment,
          status: 'confirmed'
        }
      });
      
      // Активируем стол
      await activateTable(userId, tableNumber, txHash);
      console.log(`🎉 Table ${tableNumber} АКТИВИРОВАН для User ${userId}!`);
      
      // Получаем данные пользователя для уведомления
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (user) {
        // Отправляем уведомление
        await notifyTableActivated(
          Number(user.telegramId),
          tableNumber,
          1
        );
        console.log(`🔔 Уведомление отправлено User ${userId}`);
      }
      
    } catch (error) {
      console.error('❌ Ошибка обработки транзакции:', error);
    }
  }
}

console.log('🤖 Payment Monitor запущен!');
console.log(`💰 Мониторинг: INCOME=${SYSTEM_WALLETS.INCOME}`);
console.log(`💰 Мониторинг: OPERATIONS=${SYSTEM_WALLETS.OPERATIONS}`);
console.log('⏱️  Проверка каждые 10 секунд...\n');

setInterval(monitorPayments, 10000);
monitorPayments();
