require('dotenv').config();
const { Bot } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot(process.env.BOT_TOKEN);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

bot.command('start', async (ctx) => {
  const user = ctx.from;
  if (!user) return;

  try {
    const { data: existing } = await supabase
      .from('User')
      .select('id, nickname')
      .eq('telegramId', user.id)
      .single();

    if (!existing) {
      await supabase.from('User').insert({
        telegramId: user.id,
        telegramUsername: user.username || null,
        isPremium: user.is_premium || false,
        nickname: user.username || 'user_' + user.id,
        tonWallet: 'PENDING',
        role: 'USER',
        referrerId: 1,
        walletBalance: 0,
        isVerified: false,
        payoutMethod: 'INSTANT',
        fraudScore: 0,
        directReferrals: 0,
        totalNetwork: 0,
        totalEarned: 0,
        totalInvested: 0,
        pendingPayout: 0,
        accountCreatedDate: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      });
      console.log('New user saved:', user.id, user.username);
    } else {
      await supabase
        .from('User')
        .update({ lastActive: new Date().toISOString() })
        .eq('telegramId', user.id);
      console.log('User updated:', user.id, user.username);
    }
  } catch (e) {
    console.error('DB error:', e.message);
  }

  const startParam = ctx.match;
  let appUrl = 'https://matrix-ton-app.vercel.app';
  if (startParam) {
    appUrl = 'https://matrix-ton-app.vercel.app?ref=' + startParam;
  }

  await ctx.reply(
    'Welcome to Matrix TON!\n\n' +
    'Decentralized matrix marketing on TON blockchain\n\n' +
    'How it works:\n' +
    '- Register and get Table 1 automatically\n' +
    '- Invite friends with your referral link\n' +
    '- Earn TON when your slots fill up\n' +
    '- Unlock more tables for bigger rewards\n\n' +
    'Open the app to get started!',
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'Open Matrix TON',
            web_app: { url: appUrl }
          }
        ]]
      }
    }
  );
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    'Matrix TON Help\n\n' +
    '/start - Open the app\n' +
    '/help - Show this message'
  );
});

bot.catch((err) => {
  console.error('Bot error:', err.message);
});

bot.start();
console.log('Matrix TON Bot started!');
