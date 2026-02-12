import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPayouts() {
  console.log('🧪 ТЕСТИРУЕМ BATCH ВЫПЛАТЫ\n');
  
  // Получаем тестовых пользователей
  const users = await prisma.user.findMany({
    where: {
      id: { in: [1, 4, 5, 7] }
    },
    include: { userStats: true }
  });
  
  console.log(`👥 Найдено пользователей: ${users.length}\n`);
  
  // Создаём pending payouts для каждого
  console.log('📝 Создаём pending payouts...\n');
  
  for (const user of users) {
    // 2-3 выплаты на каждого пользователя
    const payoutsCount = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < payoutsCount; i++) {
      const amount = 5 + Math.random() * 10; // 5-15 TON
      
      await prisma.pendingPayout.create({
        data: {
          userId: user.id,
          amount: amount,
          reason: 'slot_1',
          tableNumber: 2,
          status: 'pending',
          payoutMethod: 'BATCH'
        }
      });
      
      console.log(`   ✅ User ${user.id} (@${user.telegramUsername}): +${amount.toFixed(2)} TON`);
    }
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log('📊 СТАТИСТИКА PENDING PAYOUTS:\n');
  
  // Подсчитываем статистику
  const allPayouts = await prisma.pendingPayout.findMany({
    where: { status: 'pending' },
    include: { user: true }
  });
  
  const totalAmount = allPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
  const byUser = new Map<number, number>();
  
  for (const payout of allPayouts) {
    const current = byUser.get(payout.userId) || 0;
    byUser.set(payout.userId, current + Number(payout.amount));
  }
  
  console.log(`Всего pending выплат: ${allPayouts.length}`);
  console.log(`Общая сумма: ${totalAmount.toFixed(2)} TON`);
  console.log(`Уникальных получателей: ${byUser.size}\n`);
  
  console.log('📋 По пользователям:');
  for (const [userId, amount] of byUser) {
    const user = users.find(u => u.id === userId);
    console.log(`   User ${userId} (@${user?.telegramUsername}): ${amount.toFixed(2)} TON`);
  }
  
  console.log('\n🎉 ТЕСТ ЗАВЕРШЁН!\n');
  console.log('💡 Теперь запусти Payout Worker:\n');
  console.log('   npx ts-node src/workers/payout-worker.ts\n');
  
  await prisma.$disconnect();
}

testPayouts().catch(console.error);
