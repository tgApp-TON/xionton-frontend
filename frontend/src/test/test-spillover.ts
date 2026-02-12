import { PrismaClient } from '@prisma/client';
import { activateTable } from '../services/ton/payment';

const prisma = new PrismaClient();

async function testSpillover() {
  console.log('🧪 ТЕСТИРУЕМ SPILLOVER\n');
  
  // Удаляем старого тестового юзера (если был) - каскадно
  const existingUser = await prisma.user.findUnique({
    where: { telegramId: BigInt(999888777) }
  });
  
  if (existingUser) {
    console.log('🗑️  Удаляем старые тестовые данные...');
    
    // Сначала удаляем связанные данные
    await prisma.table.deleteMany({ where: { userId: existingUser.id } });
    await prisma.userStats.deleteMany({ where: { userId: existingUser.id } });
    await prisma.transaction.deleteMany({ where: { comment: { contains: 'test' } } });
    
    // Теперь можно удалить user
    await prisma.user.delete({ where: { id: existingUser.id } });
    
    console.log('✅ Старые данные удалены\n');
  }
  
  // Создаём тестового пользователя (реферал MASTER)
  const testUser = await prisma.user.create({
    data: {
      telegramId: BigInt(999888777),
      telegramUsername: 'testuser',
      isPremium: true,
      accountCreatedDate: new Date(),
      nickname: 'TestUser',
      tonWallet: 'UQtest',
      referrerId: 1,
      referralCode: 'REF999',
      role: 'USER'
    }
  });
  
  console.log(`✅ Создан тестовый User ID: ${testUser.id}`);
  
  // Создаём UserStats
  await prisma.userStats.create({
    data: {
      userId: testUser.id
    }
  });
  
  console.log(`✅ UserStats создан\n`);
  
  // MOCK транзакция
  const tx = await prisma.transaction.create({
    data: {
      txHash: 'test_tx_' + Date.now(),
      fromAddress: 'UQtest',
      toAddress: 'UQsystem',
      amount: 20,
      fee: 0,
      type: 'TABLE_PURCHASE',
      tableNumber: 2,
      comment: 'table_2_test',
      status: 'pending'
    }
  });
  
  console.log(`✅ MOCK транзакция создана\n`);
  console.log('─'.repeat(60));
  console.log('🚀 АКТИВИРУЕМ TABLE 2 для TestUser\n');
  
  // Активируем стол (должен сработать spillover)
  await activateTable(testUser.id, 2, tx.txHash);
  
  console.log('\n' + '─'.repeat(60));
  console.log('📊 РЕЗУЛЬТАТЫ:\n');
  
  // Проверяем результат
  const userTable = await prisma.table.findFirst({
    where: {
      userId: testUser.id,
      tableNumber: 2
    }
  });
  
  console.log(`✅ Table 2 TestUser создан: ID ${userTable?.id}`);
  
  // Проверяем размещение у MASTER
  const masterTable = await prisma.table.findFirst({
    where: {
      userId: 1,
      tableNumber: 2
    },
    include: {
      positions: true
    }
  });
  
  console.log(`✅ Table 2 MASTER имеет ${masterTable?.positions.length || 0} позиций`);
  
  if (masterTable?.positions.length) {
    console.log('\n📋 Позиции в столе MASTER:');
    masterTable.positions.forEach(p => {
      console.log(`   Позиция ${p.position}: User ${p.partnerUserId}, сумма ${p.amountPaid} TON`);
    });
  }
  
  console.log('\n🎉 ТЕСТ ЗАВЕРШЁН!\n');
  
  await prisma.$disconnect();
}

testSpillover().catch(console.error);
