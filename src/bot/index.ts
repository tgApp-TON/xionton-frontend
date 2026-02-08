import { Bot, InlineKeyboard, Keyboard } from 'grammy';
import dotenv from 'dotenv';
import { findOrCreateUser, getUserData } from '../services/db';
import { generatePaymentLink, generatePaymentQR, TABLE_PRICES } from '../services/ton/payment';

dotenv.config();

const bot = new Bot(process.env.MAIN_BOT_TOKEN!);

// Главное меню
const mainKeyboard = new Keyboard()
  .text('👤 Профиль').text('📊 Мои столы').row()
  .text('👥 Рефералы').text('💰 Баланс').row()
  .text('📖 Помощь')
  .resized();

// Команда /start с реферальной ссылкой
bot.command('start', async (ctx) => {
  if (!ctx.from) return;
  
  const firstName = ctx.from.first_name || 'User';
  const telegramId = ctx.from.id;
  
  // Парсим реферальный код из /start ref123
  const args = ctx.message?.text?.split(' ');
  let referralCode: string | undefined;
  
  if (args && args.length > 1) {
    referralCode = args[1];
    console.log(`📎 Реферальный код: ${referralCode}`);
  }
  
  // Регистрация или получение пользователя из БД
  const user = await findOrCreateUser(telegramId, {
    username: ctx.from.username,
    firstName: ctx.from.first_name,
    isPremium: ctx.from.is_premium
  }, referralCode);
  
  await ctx.reply(
    `👋 Привет, ${firstName}!\n\n` +
    `Добро пожаловать в Matrix TON!\n\n` +
    `🚀 Это автоматическая матричная система на TON блокчейне.\n\n` +
    `📊 Доступно 12 столов с прогрессией ×2\n` +
    `💰 Цены: от 10 до 20,480 TON\n` +
    `✨ Автоматические выплаты каждые 10 минут\n\n` +
    `${ctx.from.is_premium ? '✅' : '❌'} Telegram Premium: ${ctx.from.is_premium ? 'Есть' : 'Требуется!'}\n\n` +
    `Выбери действие ниже 👇`,
    { reply_markup: mainKeyboard }
  );
});

// Кнопка "👤 Профиль"
bot.hears('👤 Профиль', async (ctx) => {
  if (!ctx.from) return;
  
  const userData = await getUserData(ctx.from.id);
  
  if (!userData) {
    await ctx.reply('❌ Пользователь не найден. Нажми /start');
    return;
  }
  
  const inlineKeyboard = new InlineKeyboard()
    .text('🔗 Реферальная ссылка', 'ref_link').row()
    .text('📊 Статистика', 'stats');
  
  await ctx.reply(
    `👤 Твой профиль\n\n` +
    `ID: ${ctx.from.id}\n` +
    `Имя: ${ctx.from.first_name}\n` +
    `Username: @${ctx.from.username || 'не указан'}\n` +
    `Роль: ${userData.role}\n` +
    `Premium: ${userData.isPremium ? '✅' : '❌'}\n` +
    `Регистрация: ${userData.registeredAt.toLocaleDateString('ru')}\n\n` +
    `💰 Всего заработано: ${userData.userStats?.totalEarned.toString() || '0'} TON\n` +
    `👥 Рефералов: ${userData.userStats?.totalReferrals || 0}\n\n` +
    `🎯 Выбери действие:`,
    { reply_markup: inlineKeyboard }
  );
});

// Кнопка "📊 Мои столы"
bot.hears('📊 Мои столы', async (ctx) => {
  if (!ctx.from) return;
  
  const userData = await getUserData(ctx.from.id);
  
  if (!userData) {
    await ctx.reply('❌ Пользователь не найден. Нажми /start');
    return;
  }
  
  const tables = userData.tables || [];
  const activeTables = tables.filter(t => t.status === 'ACTIVE');
  
  const inlineKeyboard = new InlineKeyboard();
  
  // Показываем первые 3 стола
  for (let i = 1; i <= 3; i++) {
    const table = tables.find(t => t.tableNumber === i);
    const status = table ? '🟢' : '⚪️';
    const price = TABLE_PRICES[i as keyof typeof TABLE_PRICES];
    inlineKeyboard.text(`${status} Table ${i} (${price} TON)`, `table_${i}`).row();
  }
  
  inlineKeyboard.text('📋 Все столы', 'all_tables');
  
  await ctx.reply(
    `📊 Твои столы\n\n` +
    `Активных: ${activeTables.length}/12\n\n` +
    `🟢 - Активен\n` +
    `⚪️ - Не куплен\n\n` +
    `Выбери стол для деталей:`,
    { reply_markup: inlineKeyboard }
  );
});

// Кнопка "👥 Рефералы"
bot.hears('👥 Рефералы', async (ctx) => {
  if (!ctx.from) return;
  
  const userData = await getUserData(ctx.from.id);
  
  if (!userData) {
    await ctx.reply('❌ Пользователь не найден. Нажми /start');
    return;
  }
  
  const refCount = userData.referrals?.length || 0;
  
  await ctx.reply(
    `👥 Твои рефералы\n\n` +
    `Всего: ${refCount}\n` +
    `Активных: ${refCount}\n` +
    `Заработано с рефералов: 0 TON\n\n` +
    `${refCount > 0 ? '📋 Список рефералов:\n' + userData.referrals?.slice(0, 5).map((ref, i) => `${i + 1}. @${ref.telegramUsername || 'user'}`).join('\n') : ''}` +
    `\n\nПригласи друзей и получай доход! 🚀`
  );
});

// Кнопка "💰 Баланс"
bot.hears('💰 Баланс', async (ctx) => {
  if (!ctx.from) return;
  
  const userData = await getUserData(ctx.from.id);
  
  if (!userData) {
    await ctx.reply('❌ Пользователь не найден. Нажми /start');
    return;
  }
  
  const inlineKeyboard = new InlineKeyboard()
    .text('📥 Пополнить', 'deposit').row()
    .text('📤 Вывести', 'withdraw');
  
  await ctx.reply(
    `💰 Баланс\n\n` +
    `Доступно: 0 TON\n` +
    `В обработке: 0 TON\n` +
    `Всего заработано: ${userData.userStats?.totalEarned.toString() || '0'} TON\n` +
    `Всего выведено: 0 TON`,
    { reply_markup: inlineKeyboard }
  );
});

// Кнопка "📖 Помощь"
bot.hears('📖 Помощь', async (ctx) => {
  await ctx.reply(
    `📖 Помощь Matrix TON\n\n` +
    `🔹 Купи Table 1 за 10 TON\n` +
    `🔹 Приведи 4 партнёров\n` +
    `🔹 Получи 27 TON автоматически\n` +
    `🔹 Система купит Table 2 за тебя\n` +
    `🔹 Повторяй до Table 12!\n\n` +
    `Вопросы? @MatrixTON_Support`
  );
});

// Обработка inline кнопок
bot.on('callback_query:data', async (ctx) => {
  if (!ctx.from) return;
  
  const data = ctx.callbackQuery.data;
  const userData = await getUserData(ctx.from.id);
  
  if (!userData) {
    await ctx.answerCallbackQuery({ text: 'Пользователь не найден' });
    return;
  }
  
  if (data === 'ref_link') {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `🔗 Твоя реферальная ссылка:\n\n` +
      `https://t.me/MatrixTONTON_Bot?start=${userData.referralCode}\n\n` +
      `Поделись с друзьями! 🚀`
    );
  }
  
  if (data === 'stats') {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `📊 Статистика\n\n` +
      `Рефералов: ${userData.userStats?.totalReferrals || 0}\n` +
      `Активных столов: ${userData.userStats?.activeTables || 0}\n` +
      `Заработано: ${userData.userStats?.totalEarned.toString() || '0'} TON\n` +
      `Выведено: 0 TON`
    );
  }
  
  if (data.startsWith('table_')) {
    const tableNum = parseInt(data.split('_')[1]);
    const table = userData.tables?.find(t => t.tableNumber === tableNum);
    const price = TABLE_PRICES[tableNum as keyof typeof TABLE_PRICES];
    const earnings = price * 2.7;
    
    await ctx.answerCallbackQuery();
    
    if (table) {
      await ctx.reply(
        `🟢 Table ${tableNum}\n\n` +
        `Цена: ${price} TON\n` +
        `Статус: ${table.status}\n` +
        `Цикл: #${table.cycleNumber}\n` +
        `Доход за цикл: ${earnings} TON\n\n` +
        `✅ Стол активен!`
      );
    } else {
      const buyKeyboard = new InlineKeyboard()
        .text(`💎 Купить Table ${tableNum} (${price} TON)`, `buy_table_${tableNum}`);
      
      await ctx.reply(
        `⚪️ Table ${tableNum}\n\n` +
        `Цена: ${price} TON\n` +
        `Статус: Не куплен\n` +
        `Доход за цикл: ${earnings} TON\n\n` +
        `Купи стол и начни зарабатывать!`,
        { reply_markup: buyKeyboard }
      );
    }
  }
  
  // ПОКУПКА СТОЛА
  if (data.startsWith('buy_table_')) {
    const tableNum = parseInt(data.split('_')[2]);
    const price = TABLE_PRICES[tableNum as keyof typeof TABLE_PRICES];
    
    await ctx.answerCallbackQuery();
    
    const paymentUrl = generatePaymentLink(userData.id, tableNum, userData.tonWallet);
    const qrUrl = generatePaymentQR(paymentUrl);
    
    const paymentKeyboard = new InlineKeyboard()
      .url('💳 Оплатить через TON Wallet', paymentUrl).row()
      .text('✅ Я оплатил', `confirm_${tableNum}`).row()
      .text('❌ Отмена', 'cancel_payment');
    
    await ctx.replyWithPhoto(qrUrl, {
      caption:
        `💳 Оплата Table ${tableNum}\n\n` +
        `Сумма: ${price} TON\n\n` +
        `1️⃣ Отсканируй QR код\n` +
        `2️⃣ Или нажми кнопку "Оплатить"\n` +
        `3️⃣ После оплаты нажми "Я оплатил"\n\n` +
        `⏱ Активация в течение 1 минуты`,
      reply_markup: paymentKeyboard
    });
  }
  
  if (data.startsWith('confirm_')) {
    const tableNum = parseInt(data.split('_')[1]);
    
    await ctx.answerCallbackQuery({ text: '⏳ Проверяем оплату...' });
    
    await ctx.reply(
      `⏳ Проверяем оплату Table ${tableNum}...\n\n` +
      `Это может занять до 1 минуты.\n` +
      `Мы уведомим тебя когда стол активируется!`
    );
  }
  
  if (data === 'all_tables') {
    await ctx.answerCallbackQuery();
    
    let message = '📊 Все столы:\n\n';
    
    for (let i = 1; i <= 12; i++) {
      const table = userData.tables?.find(t => t.tableNumber === i);
      const price = TABLE_PRICES[i as keyof typeof TABLE_PRICES];
      const status = table ? `🟢 Цикл #${table.cycleNumber}` : '⚪️ Не куплен';
      message += `Table ${i} (${price} TON): ${status}\n`;
    }
    
    await ctx.reply(message);
  }
});

console.log('🤖 Main Bot запущен с реферальной системой!');
bot.start();
