import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

interface UserCreateData {
  username?: string;
  firstName?: string;
  isPremium?: boolean;
}

// Найти или создать пользователя
export async function findOrCreateUser(
  telegramId: number,
  data: UserCreateData,
  referralCode?: string
) {
  // Проверяем существует ли пользователь
  let user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
    include: {
      userStats: true,
      tables: true
    }
  });

  if (user) {
    console.log(`✅ Пользователь найден: ${user.id}`);
    return user;
  }

  console.log(`🆕 Создаём нового пользователя: ${telegramId}`);

  // Найти реферера по коду
  let referrerId: number | null = null;

  if (referralCode) {
    console.log(`📎 Обработка реферального кода: ${referralCode}`);
    
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode }
    });

    if (referrer) {
      referrerId = referrer.id;
      console.log(`✅ Реферер найден: User ${referrerId}`);
      
      // Обновляем статистику реферера
      await prisma.userStats.update({
        where: { userId: referrerId },
        data: {
          totalReferrals: {
            increment: 1
          }
        }
      });
      
      console.log(`📊 Статистика реферера обновлена (+1 реферал)`);
    } else {
      console.log(`⚠️ Реферер с кодом ${referralCode} не найден`);
    }
  }

  // Если нет реферера - ставим MASTER (ID=1)
  if (!referrerId) {
    referrerId = 1;
    console.log(`👑 Нет реферера, используем MASTER (ID=1)`);
  }

  // Генерируем уникальный nickname
  const nickname = `User${telegramId.toString().slice(-6)}`;
  
  // Генерируем реферальный код
  const newReferralCode = `REF${telegramId.toString().slice(-6)}`;
  
  // Временный уникальный кошелёк (будет заменён через TON Connect)
  const tempWallet = `TEMP_${telegramId}`;

  // Создаём пользователя
  user = await prisma.user.create({
    data: {
      telegramId: BigInt(telegramId),
      telegramUsername: data.username,
      isPremium: data.isPremium || false,
      accountCreatedDate: new Date(),
      nickname: nickname,
      tonWallet: tempWallet,
      referrerId: referrerId,
      referralCode: newReferralCode,
      role: 'USER'
    },
    include: {
      userStats: true,
      tables: true
    }
  });

  // Создаём UserStats
  await prisma.userStats.create({
    data: {
      userId: user.id
    }
  });

  console.log(`✅ Пользователь создан: ID ${user.id}, реферер: ${referrerId}`);

  return user;
}

// Получить данные пользователя
export async function getUserData(telegramId: number) {
  return await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
    include: {
      userStats: true,
      tables: {
        orderBy: { tableNumber: 'asc' }
      },
      referrals: {
        select: {
          id: true,
          telegramUsername: true,
          nickname: true,
          registeredAt: true
        },
        take: 10
      }
    }
  });
}

// Обновить TON кошелёк
export async function updateUserWallet(telegramId: number, wallet: string) {
  return await prisma.user.update({
    where: { telegramId: BigInt(telegramId) },
    data: { tonWallet: wallet }
  });
}

console.log('💾 Database service инициализирован');
