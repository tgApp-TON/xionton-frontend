import { PrismaClient } from '@prisma/client';
import { activateTable } from '../services/ton/payment';

const prisma = new PrismaClient();

async function testAutoPurchase() {
  console.log('🧪 ТЕСТИРУЕМ АВТОПОКУПКУ СТОЛОВ\n');
  
  // Используем TestUser (ID=4)
  const testUser = await prisma.user.findUnique({
    where: { id: 4 },
    include: {
      tables: true,
      userStats: true
    }
  });
  
  if (!testUser) {
    console.log('❌ TestUser не найден');
    return;
  }
  
  console.log(`👤 TestUser: ${testUser.nickname} (ID: ${testUser.id})`);
  console.log(`📊 Активных столов: ${testUser.userStats?.activeTables || 0}\n`);
  
  // Проверяем какие столы есть
  console.log('📋 Текущие столы:');
  for (let i = 1; i <= 12; i++) {
    const table = testUser.tables.find(t => t.tableNumber === i);
    const status = table ? `✅ ${table.status}` : '❌ Не куплен';
    console.log(`   Table ${i}: ${status}`);
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log('🚀 СИМУЛИРУЕМ ЗАПОЛНЕНИЕ TABLE 2\n');
  
  // Находим Table 2 TestUser
  let table2 = testUser.tables.find(t => t.tableNumber === 2);
  
  if (!table2) {
    console.log('❌ Table 2 не найден, создаём...');
    
    // Создаём Table 2 если нет
    const tx = await prisma.transaction.create({
      data: {
        txHash: 'auto_test_' + Date.now(),
        fromAddress: 'UQtest',
        toAddress: 'UQsystem',
        amount: 20,
        fee: 0,
        type: 'TABLE_PURCHASE',
        tableNumber: 2,
        comment: 'auto_test',
        status: 'pending'
      }
    });
    
    await activateTable(testUser.id, 2, tx.txHash);
    
    // Перезагружаем данные
    const foundTable = await prisma.table.findFirst({
      where: {
        userId: testUser.id,
        tableNumber: 2
      }
    });
    
    if (!foundTable) {
      console.log('❌ Не удалось создать Table 2');
      return;
    }
    
    table2 = foundTable;
  }
  
  console.log(`✅ Table 2 найден: ID ${table2.id}\n`);
  
  // Симулируем партнёров в слоты 1, 2, 3
  console.log('👥 Создаём партнёров в слотах 1-3...\n');
  
  const partners = [
    { id: 5, nickname: 'User222333' },
    { id: 7, nickname: 'User555666' },
    { id: 1, nickname: 'MASTER' }
  ];
  
  for (let i = 0; i < 3; i++) {
    const position = i + 1;
    const amount = 18; // После комиссии 10%
    
    // Проверяем есть ли уже позиция
    const existing = await prisma.tablePosition.findFirst({
      where: {
        tableId: table2.id,
        position: position
      }
    });
    
    if (existing) {
      console.log(`   Позиция ${position}: уже занята`);
      continue;
    }
    
    await prisma.tablePosition.create({
      data: {
        tableId: table2.id,
        partnerUserId: partners[i].id,
        partnerNickname: partners[i].nickname,
        position: position,
        cycleNumber: table2.cycleNumber,
        amountPaid: amount,
        amountReceived: position === 1 ? amount : 0,
        status: position === 1 ? 'PAID_OUT' : 'HELD_FOR_AUTOPURCHASE'
      }
    });
    
    console.log(`   ✅ Слот ${position}: ${partners[i].nickname} (${amount} TON)`);
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log('🔍 ПРОВЕРЯЕМ АВТОПОКУПКУ TABLE 3\n');
  
  // Вызываем автопокупку вручную
  const { checkAndProcessAutoPurchase } = await import('../services/autopurchase/processor');
  await checkAndProcessAutoPurchase(testUser.id, 2);
  
  console.log('\n' + '─'.repeat(60));
  console.log('📊 РЕЗУЛЬТАТЫ:\n');
  
  // Проверяем Table 3
  const table3 = await prisma.table.findFirst({
    where: {
      userId: testUser.id,
      tableNumber: 3
    }
  });
  
  if (table3) {
    console.log(`✅ Table 3 автоматически куплен!`);
    console.log(`   ID: ${table3.id}`);
    console.log(`   Статус: ${table3.status}`);
    console.log(`   Цикл: #${table3.cycleNumber}\n`);
    
    // Проверяем размещение в Table 3 MASTER
    const masterTable3 = await prisma.table.findFirst({
      where: {
        userId: 1,
        tableNumber: 3
      },
      include: {
        positions: true
      }
    });
    
    if (masterTable3) {
      console.log(`✅ TestUser размещён в Table 3 MASTER:`);
      const testUserPosition = masterTable3.positions.find(p => p.partnerUserId === testUser.id);
      if (testUserPosition) {
        console.log(`   Позиция: ${testUserPosition.position}`);
        console.log(`   Сумма: ${testUserPosition.amountPaid} TON\n`);
      }
    }
  } else {
    console.log(`❌ Table 3 НЕ куплен (проверьте логику)\n`);
  }
  
  // Проверяем статусы слотов 2-3 в Table 2
  const table2Updated = await prisma.table.findUnique({
    where: { id: table2.id },
    include: { positions: true }
  });
  
  console.log('📋 Статусы слотов Table 2:');
  table2Updated?.positions.forEach(p => {
    console.log(`   Слот ${p.position}: ${p.status}`);
  });
  
  console.log('\n🎉 ТЕСТ ЗАВЕРШЁН!\n');
  
  await prisma.$disconnect();
}

testAutoPurchase().catch(console.error);
