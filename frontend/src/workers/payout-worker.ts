import { PrismaClient } from '@prisma/client';
import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// TON Client
const endpoint = process.env.TON_NETWORK === 'testnet'
  ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
  : 'https://toncenter.com/api/v2/jsonRPC';

const tonClient = new TonClient({ endpoint });

// Минимальная сумма для выплаты
const MIN_PAYOUT_AMOUNT = 1; // 1 TON

// Обработать batch выплаты
async function processBatchPayouts() {
  console.log('💸 Начинаем обработку batch выплат...\n');
  
  try {
    // Получаем все pending выплаты
    const pendingPayouts = await prisma.pendingPayout.findMany({
      where: {
        status: 'pending',
        amount: {
          gte: MIN_PAYOUT_AMOUNT
        }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`📊 Найдено pending выплат: ${pendingPayouts.length}\n`);
    
    if (pendingPayouts.length === 0) {
      console.log('✅ Нет выплат для обработки\n');
      return;
    }
    
    // Группируем по пользователям
    const payoutsByUser = new Map<number, typeof pendingPayouts>();
    
    for (const payout of pendingPayouts) {
      const userId = payout.userId;
      if (!payoutsByUser.has(userId)) {
        payoutsByUser.set(userId, []);
      }
      payoutsByUser.get(userId)!.push(payout);
    }
    
    console.log(`👥 Уникальных получателей: ${payoutsByUser.size}\n`);
    
    // Обрабатываем каждого пользователя
    for (const [userId, userPayouts] of payoutsByUser) {
      await processUserPayouts(userId, userPayouts);
    }
    
    console.log('🎉 Batch выплаты завершены!\n');
    
  } catch (error) {
    console.error('❌ Ошибка обработки batch выплат:', error);
  }
}

// Обработать выплаты одного пользователя
async function processUserPayouts(userId: number, payouts: any[]) {
  try {
    const user = payouts[0].user;
    
    // Проверяем есть ли кошелёк
    if (!user.tonWallet || user.tonWallet.startsWith('TEMP_')) {
      console.log(`⚠️ User ${userId} (@${user.telegramUsername}): нет TON кошелька, пропускаем`);
      return;
    }
    
    // Суммируем все выплаты
    const totalAmount = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
    
    console.log(`💰 User ${userId} (@${user.telegramUsername}):`);
    console.log(`   Выплат: ${payouts.length}`);
    console.log(`   Сумма: ${totalAmount.toFixed(2)} TON`);
    console.log(`   Кошелёк: ${user.tonWallet}`);
    
    // MOCK отправка (в реальности здесь TON transfer)
    const txHash = await sendTonPayment(user.tonWallet, totalAmount);
    
    if (txHash) {
      console.log(`   ✅ Отправлено! TX: ${txHash.slice(0, 16)}...`);
      
      // Обновляем статус всех выплат
      const payoutIds = payouts.map(p => p.id);
      
      await prisma.pendingPayout.updateMany({
        where: {
          id: { in: payoutIds }
        },
        data: {
          status: 'completed',
          txHash: txHash,
          processedAt: new Date()
        }
      });
      
      console.log(`   📊 Статистика обновлена\n`);
    } else {
      console.log(`   ❌ Ошибка отправки\n`);
    }
    
  } catch (error) {
    console.error(`❌ Ошибка выплаты User ${userId}:`, error);
  }
}

// Отправить TON платёж
async function sendTonPayment(toAddress: string, amount: number): Promise<string | null> {
  try {
    // MOCK для тестов
    if (process.env.TON_NETWORK === 'testnet') {
      console.log(`   🧪 MOCK отправка ${amount.toFixed(2)} TON на ${toAddress}`);
      return `MOCK_TX_${Date.now()}`;
    }
    
    // Реальная отправка (раскомментировать для продакшена)
    /*
    const mnemonic = process.env.OPERATIONS_WALLET_MNEMONIC!.split(' ');
    const keyPair = await mnemonicToPrivateKey(mnemonic);
    
    const wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: keyPair.publicKey
    });
    
    const contract = tonClient.open(wallet);
    
    const seqno = await contract.getSeqno();
    
    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [
        internal({
          to: toAddress,
          value: BigInt(amount * 1e9),
          body: 'Payout from Matrix TON'
        })
      ]
    });
    
    return 'real_tx_hash';
    */
    
    return `MOCK_TX_${Date.now()}`;
    
  } catch (error) {
    console.error('❌ Ошибка отправки TON:', error);
    return null;
  }
}

// Главный цикл
console.log('💸 Payout Worker запущен!');
console.log('⏱️  Обработка каждые 10 минут...\n');

// Запускаем сразу
processBatchPayouts();

// Потом каждые 10 минут
setInterval(processBatchPayouts, 10 * 60 * 1000);
