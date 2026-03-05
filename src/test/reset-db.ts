import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MASTER_TELEGRAM_ID = 669838070;

async function main() {
  console.log('🔍 Текущие пользователи:');
  const all = await prisma.user.findMany({ select: { id: true, telegramId: true, telegramUsername: true, role: true } });
  all.forEach(u => console.log(`  ID=${u.id} tg=${u.telegramId} @${u.telegramUsername} role=${u.role}`));

  console.log('\n🗑️  Удаляем всех кроме MASTER...');
  
  const master = await prisma.user.findFirst({ where: { telegramId: BigInt(MASTER_TELEGRAM_ID) } });
  if (!master) { console.log('❌ MASTER не найден!'); return; }

  // Удаляем зависимые записи
  await prisma.table.deleteMany({ where: { userId: { not: master.id } } });
  await prisma.userStats.deleteMany({ where: { userId: { not: master.id } } });
  await prisma.user.updateMany({ where: { referrerId: { not: null }, id: { not: master.id } }, data: { referrerId: null } });
  await prisma.user.deleteMany({ where: { id: { not: master.id } } });

  console.log('✅ Готово. Остались пользователи:');
  const remaining = await prisma.user.findMany({ select: { id: true, telegramId: true, telegramUsername: true } });
  remaining.forEach(u => console.log(`  ID=${u.id} tg=${u.telegramId} @${u.telegramUsername}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
