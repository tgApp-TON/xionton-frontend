import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * REFERRAL BONDS: Permanent. Established at registration via referral link.
 * Does NOT change during spillover — partner remains the referrer of the original inviter.
 */

// Найти активный стол ВВЕРХ по структуре
export async function findActiveTableUpline(
  userId: number,
  tableNumber: number
): Promise<{ userId: number; tableId: number } | null> {
  
  // Получаем пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { referrer: true }
  });
  
  if (!user) return null;
  
  // Начинаем с реферера
  let currentUserId = user.referrerId;
  
  // Поднимаемся вверх до 100 уровней (защита от бесконечного цикла)
  for (let i = 0; i < 100; i++) {
    if (!currentUserId) {
      // Дошли до верха без реферера - используем MASTER (ID=1)
      currentUserId = 1;
    }
    
    // Ищем активный стол у текущего пользователя
    const table = await prisma.table.findFirst({
      where: {
        userId: currentUserId,
        tableNumber: tableNumber,
        status: 'ACTIVE'
      },
      include: {
        positions: true
      }
    });
    
    if (table) {
      // Проверяем есть ли свободные позиции
      const filledPositions = table.positions.length;
      
      if (filledPositions < 4) {
        // Есть свободное место!
        return {
          userId: currentUserId,
          tableId: table.id
        };
      }
      
      // Стол полный, идём выше
    }
    
    // Получаем реферера текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId }
    });
    
    if (!currentUser || !currentUser.referrerId) {
      // Дошли до MASTER
      break;
    }
    
    currentUserId = currentUser.referrerId;
  }
  
  // Не нашли - возвращаем MASTER
  const masterTable = await prisma.table.findFirst({
    where: {
      userId: 1,
      tableNumber: tableNumber,
      status: 'ACTIVE'
    }
  });
  
  if (masterTable) {
    return {
      userId: 1,
      tableId: masterTable.id
    };
  }
  
  return null;
}

// Определить номер свободной позиции в столе
export async function getNextAvailablePosition(tableId: number): Promise<number> {
  const positions = await prisma.tablePosition.findMany({
    where: { tableId },
    orderBy: { position: 'asc' }
  });
  
  // Позиции: 1, 2, 3, 4
  const occupied = positions.map(p => p.position);
  
  for (let pos = 1; pos <= 4; pos++) {
    if (!occupied.includes(pos)) {
      return pos;
    }
  }
  
  return 1; // Не должно произойти
}

// Проверить заполнен ли стол
export async function isTableFull(tableId: number): Promise<boolean> {
  const count = await prisma.tablePosition.count({
    where: { tableId }
  });
  
  return count >= 4;
}
