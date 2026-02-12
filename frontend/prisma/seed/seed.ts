import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  
  // 1. Создать MASTER
  const master = await prisma.user.create({
    data: {
      telegramId: BigInt(process.env.MASTER_TELEGRAM_ID!),
      telegramUsername: process.env.MASTER_TELEGRAM_USERNAME,
      isPremium: true,
      accountCreatedDate: new Date(Date.now() - 365 * 2 * 24 * 60 * 60 * 1000),
      nickname: 'MASTER',
      tonWallet: process.env.MASTER_WALLET_ADDRESS!,
      role: 'FOUNDER',
      referralCode: 'MASTER',
      isVerified: true,
      payoutMethod: 'INSTANT'
    }
  });
  
  console.log('✅ MASTER created:', master.id);
  
  // 2. Активировать все 12 столов
  for (let tableNum = 1; tableNum <= 12; tableNum++) {
    await prisma.table.create({
      data: {
        userId: master.id,
        tableNumber: tableNum,
        status: 'ACTIVE',
        cycleNumber: 1
      }
    });
    console.log(`✅ Table ${tableNum} activated`);
  }
  
  // 3. Создать UserStats
  await prisma.userStats.create({
    data: {
      userId: master.id
    }
  });
  
  console.log('🎉 MASTER setup complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
