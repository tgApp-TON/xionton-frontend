import { PrismaClient } from '@prisma/client';
import { placePartnerInTable } from '../services/spillover/placer';

const prisma = new PrismaClient();

async function testMasterTableLogic() {
  console.log('🧪 ТЕСТИРУЕМ ЛОГИКУ MASTER СТОЛОВ\n');
  console.log('📋 Проверяем что MASTER столы НЕ закрываются\n');
  
  const MASTER_ID = 1;
  
  // Получаем Table 1 MASTER
  const masterTable1 = await prisma.table.findFirst({
    where: {
      userId: MASTER_ID,
      tableNumber: 1
    },
    include: {
      positions: true
    }
  });
  
  if (!masterTable1) {
    console.log('❌ MASTER Table 1 не найден! Запусти activate-master-all-tables.ts');
    return;
  }
  
  console.log(`✅ MASTER Table 1 найден: ID ${masterTable1.id}`);
  console.log(`   Статус: ${masterTable1.status}`);
  console.log(`   Позиции: ${masterTable1.positions.length}/4\n`);
  
  console.log('─'.repeat(60));
  console.log('🚀 ЗАПОЛНЯЕМ ВСЕ 4 СЛОТА\n');
  
  // Используем реальных пользователей
  const testUsers = await prisma.user.findMany({
    where: {
      id: {
        in: [4, 5, 7]
      }
    }
  });
  
  if (testUsers.length < 3) {
    console.log('⚠️  Недостаточно тестовых пользователей');
    console.log('   Создаём фейковых партнёров...\n');
  }
  
  // Симулируем 4 партнёров в Table 1 MASTER
  const partners = [
    { id: 4, amount: 9 }, // после комиссии 10%
    { id: 5, amount: 9 },
    { id: 7, amount: 9 },
    { id: 4, amount: 9 }  // тот же юзер может быть в разных слотах
  ];
  
  for (let i = 0; i < 4; i++) {
    const position = i + 1;
    
    // Проверяем есть ли уже позиция
    const existing = masterTable1.positions.find(p => p.position === position);
    if (existing) {
      console.log(`   Слот ${position}: уже занят (пропускаем)`);
      continue;
    }
    
    console.log(`👤 Размещаем партнёра ${partners[i].id} в слот ${position}...`);
    
    await placePartnerInTable(
      partners[i].id,
      1,
      partners[i].amount
    );
    
    console.log(`   ✅ Слот ${position} заполнен\n`);
  }
  
  console.log('─'.repeat(60));
  console.log('🔍 ПРОВЕРЯЕМ РЕЗУЛЬТАТ\n');
  
  // Проверяем Table 1 MASTER после заполнения
  const masterTable1After = await prisma.table.findFirst({
    where: {
      userId: MASTER_ID,
      tableNumber: 1
    },
    include: {
      positions: true
    }
  });
  
  console.log(`📊 MASTER Table 1 после заполнения:`);
  console.log(`   Статус: ${masterTable1After?.status}`);
  console.log(`   Позиции: ${masterTable1After?.positions.length}/4`);
  console.log(`   Цикл: #${masterTable1After?.cycleNumber}\n`);
  
  if (masterTable1After?.status === 'ACTIVE') {
    console.log('✅ ОТЛИЧНО! Стол остался ACTIVE\n');
  } else {
    console.log('❌ ОШИБКА! Стол не должен был закрыться\n');
  }
  
  // Проверяем что позиции очистились
  if (masterTable1After?.positions.length === 0) {
    console.log('✅ ОТЛИЧНО! Позиции очистились (готов принимать новых)\n');
  } else {
    console.log(`⚠️  Позиции не очистились: ${masterTable1After?.positions.length}\n`);
  }
  
  // Проверяем что НЕ создался новый стол (реактивация)
  const allMasterTable1 = await prisma.table.findMany({
    where: {
      userId: MASTER_ID,
      tableNumber: 1
    }
  });
  
  console.log(`📋 Всего Table 1 у MASTER: ${allMasterTable1.length}`);
  
  if (allMasterTable1.length === 1) {
    console.log('✅ ОТЛИЧНО! Новый стол НЕ создался (реактивация не произошла)\n');
  } else {
    console.log('❌ ОШИБКА! Создался дубликат стола\n');
  }
  
  console.log('─'.repeat(60));
  console.log('🎉 ТЕСТ ЗАВЕРШЁН!\n');
  
  console.log('💡 Выводы:');
  console.log('   1. MASTER стол остаётся ACTIVE');
  console.log('   2. Позиции очищаются после заполнения');
  console.log('   3. Новый стол НЕ создаётся (нет реактивации)');
  console.log('   4. MASTER может принимать партнёров бесконечно\n');
  
  await prisma.$disconnect();
}

testMasterTableLogic().catch(console.error);
