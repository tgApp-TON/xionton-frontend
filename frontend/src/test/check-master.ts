import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking MASTER account...\n');
  
  // Получить MASTER
  const master = await prisma.user.findFirst({
    where: { role: 'FOUNDER' },
    include: {
      tables: true,
      userStats: true
    }
  });
  
  if (!master) {
    console.log('❌ MASTER not found!');
    return;
  }
  
  console.log('✅ MASTER found:');
  console.log('  ID:', master.id);
  console.log('  Nickname:', master.nickname);
  console.log('  Telegram:', master.telegramUsername);
  console.log('  Wallet:', master.tonWallet);
  console.log('  Role:', master.role);
  console.log('  Payout Method:', master.payoutMethod);
  console.log('  Registered:', master.registeredAt);
  
  console.log('\n📊 Tables:');
  master.tables.forEach(table => {
    console.log(`  Table ${table.tableNumber}: ${table.status} (Cycle #${table.cycleNumber})`);
  });
  
  console.log('\n💰 Stats:');
  console.log('  Total Earned:', master.userStats?.totalEarned.toString(), 'TON');
  console.log('  Total Referrals:', master.userStats?.totalReferrals);
  console.log('  Active Tables:', master.userStats?.activeTables);
  
  console.log('\n🎉 Everything looks good!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
