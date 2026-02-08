import { PrismaClient } from '@prisma/client';
import { findOrCreateUser } from '../services/db';

const prisma = new PrismaClient();

async function testReferral() {
  console.log('🧪 ТЕСТИРУЕМ РЕФЕРАЛЬНУЮ СИСТЕМУ\n');
  
  // Получаем MASTER
  const master = await prisma.user.findUnique({
    where: { id: 1 },
    include: { userStats: true }
  });
  
  console.log(`👑 MASTER: ${master?.nickname}, реферальный код: ${master?.referralCode}`);
  console.log(`📊 Рефералов у MASTER: ${master?.userStats?.totalReferrals || 0}\n`);
  
  console.log('─'.repeat(60));
  console.log('🆕 СОЗДАЁМ USER1 (без реферального кода)\n');
  
  const user1 = await findOrCreateUser(111222333, {
    username: 'user1',
    firstName: 'User One',
    isPremium: true
  });
  
  console.log(`✅ User1 создан: ID ${user1.id}, реферер: ${user1.referrerId}`);
  console.log(`🔗 Реферальный код User1: ${user1.referralCode}\n`);
  
  console.log('─'.repeat(60));
  console.log('🆕 СОЗДАЁМ USER2 (с реферальным кодом User1)\n');
  
  const user2 = await findOrCreateUser(444555666, {
    username: 'user2',
    firstName: 'User Two',
    isPremium: true
  }, user1.referralCode!);
  
  console.log(`✅ User2 создан: ID ${user2.id}, реферер: ${user2.referrerId}`);
  console.log(`🔗 Реферальный код User2: ${user2.referralCode}\n`);
  
  console.log('─'.repeat(60));
  console.log('📊 ПРОВЕРЯЕМ СТАТИСТИКУ\n');
  
  const user1Updated = await prisma.user.findUnique({
    where: { id: user1.id },
    include: { 
      userStats: true,
      referrals: true
    }
  });
  
  console.log(`User1 статистика:`);
  console.log(`  Рефералов: ${user1Updated?.userStats?.totalReferrals || 0}`);
  console.log(`  Список: ${user1Updated?.referrals.map(r => r.nickname).join(', ')}\n`);
  
  const masterUpdated = await prisma.user.findUnique({
    where: { id: 1 },
    include: { 
      userStats: true,
      referrals: true
    }
  });
  
  console.log(`MASTER статистика:`);
  console.log(`  Рефералов: ${masterUpdated?.userStats?.totalReferrals || 0}`);
  console.log(`  Список: ${masterUpdated?.referrals.map(r => r.nickname).join(', ')}\n`);
  
  console.log('🎉 ТЕСТ ЗАВЕРШЁН!\n');
  
  await prisma.$disconnect();
}

testReferral().catch(console.error);
