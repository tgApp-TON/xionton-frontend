import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateMasterAllTables() {
  console.log('👑 АКТИВАЦИЯ ВСЕХ 12 СТОЛОВ ДЛЯ MASTER\n');
  
  const MASTER_ID = 1;
  
  // Проверяем MASTER
  const master = await prisma.user.findUnique({
    where: { id: MASTER_ID },
    include: {
      tables: true,
      userStats: true
    }
  });
  
  if (!master) {
    console.log('❌ MASTER не найден!');
    return;
  }
  
  console.log(`👑 MASTER: ${master.nickname}`);
  console.log(`📊 Текущих активных столов: ${master.userStats?.activeTables || 0}\n`);
  
  // СНАЧАЛА удаляем позиции в столах MASTER
  const masterTableIds = master.tables.map(t => t.id);
  
  if (masterTableIds.length > 0) {
    await prisma.tablePosition.deleteMany({
      where: {
        tableId: {
          in: masterTableIds
        }
      }
    });
    
    console.log('🗑️  Позиции в столах MASTER удалены');
  }
  
  // ПОТОМ удаляем столы MASTER
  await prisma.table.deleteMany({
    where: { userId: MASTER_ID }
  });
  
  console.log('🗑️  Старые столы MASTER удалены\n');
  
  // Создаём все 12 столов
  console.log('📝 Создаём 12 столов...\n');
  
  for (let tableNumber = 1; tableNumber <= 12; tableNumber++) {
    await prisma.table.create({
      data: {
        userId: MASTER_ID,
        tableNumber: tableNumber,
        status: 'ACTIVE',
        cycleNumber: 1
      }
    });
    
    const price = 10 * Math.pow(2, tableNumber - 1);
    console.log(`   ✅ Table ${tableNumber} (${price} TON)`);
  }
  
  // Обновляем статистику
  await prisma.userStats.update({
    where: { userId: MASTER_ID },
    data: {
      activeTables: 12
    }
  });
  
  console.log('\n📊 Статистика обновлена: 12 активных столов\n');
  
  // Проверяем результат
  const updatedMaster = await prisma.user.findUnique({
    where: { id: MASTER_ID },
    include: {
      tables: {
        orderBy: { tableNumber: 'asc' }
      }
    }
  });
  
  console.log('─'.repeat(60));
  console.log('✅ РЕЗУЛЬТАТ:\n');
  
  updatedMaster?.tables.forEach(t => {
    const price = 10 * Math.pow(2, t.tableNumber - 1);
    console.log(`   Table ${t.tableNumber}: ${t.status}, Cycle #${t.cycleNumber} (${price} TON)`);
  });
  
  console.log('\n🎉 MASTER готов принимать всех партнёров!\n');
  
  await prisma.$disconnect();
}

activateMasterAllTables().catch(console.error);
