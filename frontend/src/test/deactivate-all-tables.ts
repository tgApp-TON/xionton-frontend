import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deactivateAllTables() {
  // Удалить ВСЕ столы у MASTER
  const result = await prisma.table.deleteMany({
    where: {
      userId: 1
    }
  });
  
  console.log(`✅ Удалено столов: ${result.count}`);
  
  // Обновить статистику
  await prisma.userStats.update({
    where: { userId: 1 },
    data: {
      activeTables: 0
    }
  });
  
  console.log('✅ Все столы деактивированы!');
  console.log('📊 Теперь можешь тестировать покупку!');
  
  await prisma.$disconnect();
}

deactivateAllTables();
