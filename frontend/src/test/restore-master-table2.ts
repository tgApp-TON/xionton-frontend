import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreMasterTable2() {
  console.log('🔄 Восстанавливаем Table 2 для MASTER...\n');
  
  // Создать Table 2
  const table = await prisma.table.create({
    data: {
      userId: 1,
      tableNumber: 2,
      status: 'ACTIVE',
      cycleNumber: 1
    }
  });
  
  console.log(`✅ Table 2 создан: ID ${table.id}`);
  
  // Обновить статистику
  await prisma.userStats.update({
    where: { userId: 1 },
    data: {
      activeTables: 1
    }
  });
  
  console.log('✅ Статистика обновлена\n');
  
  await prisma.$disconnect();
}

restoreMasterTable2();
