import { Bot } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

const notifyBot = new Bot(process.env.NOTIFY_BOT_TOKEN!);

// Отправить уведомление пользователю
export async function sendNotification(
  telegramId: number,
  message: string
) {
  try {
    await notifyBot.api.sendMessage(telegramId, message, {
      parse_mode: 'HTML'
    });
    console.log(`✅ Уведомление отправлено: ${telegramId}`);
  } catch (error) {
    console.error(`❌ Ошибка отправки уведомления:`, error);
  }
}

// Уведомление об активации стола
export async function notifyTableActivated(
  telegramId: number,
  tableNumber: number,
  cycleNumber: number
) {
  const message = 
    `🎉 <b>Стол активирован!</b>\n\n` +
    `✅ Table ${tableNumber} (Цикл #${cycleNumber})\n` +
    `Теперь вы можете принимать партнёров!\n\n` +
    `💰 Доход за цикл: ${(10 * Math.pow(2, tableNumber - 1) * 2.7).toFixed(0)} TON`;
  
  await sendNotification(telegramId, message);
}

// Уведомление о выплате
export async function notifyPayoutReceived(
  telegramId: number,
  amount: number,
  tableNumber: number,
  slotNumber: number
) {
  const message = 
    `💰 <b>Выплата получена!</b>\n\n` +
    `Сумма: ${amount} TON\n` +
    `Стол: Table ${tableNumber}\n` +
    `Слот: #${slotNumber}\n\n` +
    `Деньги отправлены на ваш кошелёк! 🚀`;
  
  await sendNotification(telegramId, message);
}

// Уведомление о новом реферале
export async function notifyNewReferral(
  telegramId: number,
  referralUsername: string,
  tableNumber: number
) {
  const message = 
    `👥 <b>Новый партнёр!</b>\n\n` +
    `@${referralUsername} присоединился\n` +
    `Стол: Table ${tableNumber}\n\n` +
    `Продолжайте приглашать! 🎯`;
  
  await sendNotification(telegramId, message);
}

// Уведомление о spillover
export async function notifySpillover(
  telegramId: number,
  partnerUsername: string,
  tableNumber: number,
  fromUser: string
) {
  const message = 
    `🔄 <b>Spillover получен!</b>\n\n` +
    `@${partnerUsername} размещён в вашем Table ${tableNumber}\n` +
    `От: @${fromUser}\n\n` +
    `Ваша структура растёт! 📈`;
  
  await sendNotification(telegramId, message);
}

// Уведомление о закрытии стола
export async function notifyTableClosed(
  telegramId: number,
  tableNumber: number,
  cycleNumber: number,
  totalEarned: number
) {
  const message = 
    `✨ <b>Стол закрыт!</b>\n\n` +
    `Table ${tableNumber} (Цикл #${cycleNumber})\n` +
    `Заработано: ${totalEarned} TON\n\n` +
    `Стол автоматически реактивирован! 🔄`;
  
  await sendNotification(telegramId, message);
}

// Уведомление об автопокупке
export async function notifyAutoPurchase(
  telegramId: number,
  tableNumber: number
) {
  const price = 10 * Math.pow(2, tableNumber - 1);
  const message = 
    `🎁 <b>Автопокупка!</b>\n\n` +
    `Table ${tableNumber} куплен автоматически\n` +
    `Стоимость: ${price} TON\n\n` +
    `Система работает за вас! 🤖`;
  
  await sendNotification(telegramId, message);
}

console.log('🔔 Notification service инициализирован');
