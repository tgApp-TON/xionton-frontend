import { Bot, InlineKeyboard, Keyboard } from 'grammy';
import { createClient } from '@supabase/supabase-js';
import { loadTranslations, getUserLanguageByTelegramId, Language } from '../../src/services/i18n';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Bot(process.env.MAIN_BOT_TOKEN!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const userTrans = new Map<number, Record<string, string>>();

async function getTrans(tid: number) {
  if (userTrans.has(tid)) return userTrans.get(tid)!;
  const lang = await getUserLanguageByTelegramId(supabase, tid);
  const t = await loadTranslations(supabase, lang);
  userTrans.set(tid, t);
  return t;
}

function t(tr: Record<string, string>, k: string, fb = k) {
  return tr[k] || fb;
}

async function showLang(ctx: any) {
  const { data: langs } = await supabase.from('Language').select('code,name,flag').eq('isActive',true).order('name');
  if (!langs) return;
  const kb = new InlineKeyboard();
  for (let i = 0; i < langs.length; i += 2) {
    kb.text(`${langs[i].flag} ${langs[i].name}`, `lang_${langs[i].code}`);
    if (langs[i+1]) kb.text(`${langs[i+1].flag} ${langs[i+1].name}`, `lang_${langs[i+1].code}`);
    kb.row();
  }
  await ctx.reply('🌍 Select language / Выберите язык', { reply_markup: kb });
}

function menu(tr: Record<string, string>) {
  return new Keyboard()
    .text(t(tr,'menu_profile')).text(t(tr,'menu_tables')).row()
    .text(t(tr,'menu_referrals')).text(t(tr,'menu_balance')).row()
    .text(t(tr,'menu_faq')).text(t(tr,'menu_settings')).resized();
}

bot.command('start', async (ctx) => {
  if (!ctx.from) return;
  const { data: u } = await supabase.from('User').select('id').eq('telegramId',ctx.from.id).maybeSingle();
  if (!u) await showLang(ctx);
  else {
    const tr = await getTrans(ctx.from.id);
    await ctx.reply(t(tr,'welcome_title')+'\n\n'+t(tr,'welcome_description'), { reply_markup: menu(tr) });
  }
});

bot.on('callback_query:data', async (ctx) => {
  const d = ctx.callbackQuery.data;
  if (d.startsWith('lang_')) {
    const lang = d.replace('lang_','') as Language;
    await supabase.from('User').update({language:lang}).eq('telegramId',ctx.from!.id);
    userTrans.delete(ctx.from!.id);
    const tr = await getTrans(ctx.from!.id);
    await ctx.answerCallbackQuery({text:t(tr,'language_changed')});
    await ctx.reply(t(tr,'welcome_title')+'\n\n'+t(tr,'welcome_description'), { reply_markup: menu(tr) });
  }
  if (d === 'change_language') { await showLang(ctx); await ctx.answerCallbackQuery(); }
});

bot.on('message:text', async (ctx) => {
  if (!ctx.from || !ctx.message.text) return;
  console.log('[BOT] Message from:', ctx.from?.id, 'text:', ctx.message.text);
  const txt = ctx.message.text;
  
  if (txt.includes('👤')) {
    const tr = await getTrans(ctx.from.id);
    const { data: u } = await supabase.from('User')
      .select('id,nickname,totalEarned,totalInvestedReal,last30DaysEarned,last30DaysInvested,last30DaysReferrals,registeredAt')
      .eq('telegramId',ctx.from.id).maybeSingle();
    if (!u) { 
      await ctx.reply(t(tr, 'not_registered', '❌ Not registered')); 
      return; 
    }
    
    await supabase.rpc('update_30day_stats', { p_user_id: u.id });
    const { data: upd } = await supabase.from('User').select('*').eq('id',u.id).single();
    const { count: tables } = await supabase.from('MatrixTable').select('*',{count:'exact',head:true}).eq('userId',u.id).eq('status','ACTIVE');
    const { count: refs } = await supabase.from('User').select('*',{count:'exact',head:true}).eq('referrerId',u.id);
    
    await ctx.reply(
      `👤 ${upd.nickname}\n📅 ${new Date(upd.registeredAt).toLocaleDateString()}\n\n` +
      `📊 ${t(tr, 'stats_all_time', 'ALL TIME')}:\n` +
      `💸 ${Number(upd.totalInvestedReal||0).toFixed(2)} TON ${t(tr, 'stats_spent', 'spent')}\n` +
      `📈 ${Number(upd.totalEarned||0).toFixed(2)} TON ${t(tr, 'stats_earned', 'earned')}\n` +
      `👥 ${refs||0} ${t(tr, 'stats_referrals', 'referrals')}\n` +
      `📊 ${tables||0}/12 ${t(tr, 'stats_tables', 'tables')}\n\n` +
      `📅 ${t(tr, 'stats_last_30_days', 'LAST 30 DAYS')}:\n` +
      `💸 ${Number(upd.last30DaysInvested||0).toFixed(2)} TON\n` +
      `📈 ${Number(upd.last30DaysEarned||0).toFixed(2)} TON\n` +
      `👥 ${upd.last30DaysReferrals||0} ${t(tr, 'stats_new', 'new')}`
    );
  }
  
  if (txt.includes('📊')) {
    const tr = await getTrans(ctx.from.id);
    const { data: u } = await supabase.from('User').select('id').eq('telegramId',ctx.from.id).maybeSingle();
    if (!u) { await ctx.reply(t(tr, 'not_registered', '❌ Not registered')); return; }
    const { data: tbls } = await supabase.from('MatrixTable').select('tableNumber,cycleCount').eq('userId',u.id).order('tableNumber');
    let msg = `📊 ${t(tr, 'my_tables', 'My Tables')}\n\n`;
    for (let i=1; i<=12; i++) {
      const tb = tbls?.find((x:any) => x.tableNumber === i);
      msg += tb ? `🟢 T${i}: ${t(tr, 'table_cycle', 'Cycle')} ${tb.cycleCount}\n` : `⚪️ T${i}\n`;
    }
    await ctx.reply(msg);
  }
  
  if (txt.includes('👥')) {
    const tr = await getTrans(ctx.from.id);
    const { data: u } = await supabase.from('User').select('id,referralCode').eq('telegramId',ctx.from.id).maybeSingle();
    if (!u) { await ctx.reply(t(tr, 'not_registered', '❌ Not registered')); return; }
    await supabase.rpc('update_30day_stats', { p_user_id: u.id });
    const { data: upd } = await supabase.from('User').select('last30DaysReferrals').eq('id',u.id).single();
    const { count: refs } = await supabase.from('User').select('*',{count:'exact',head:true}).eq('referrerId',u.id);
    await ctx.reply(`👥 ${t(tr, 'referral_program', 'Referral Program')}\n\n🔗 https://t.me/MatrixTONTON_Bot?start=${u.referralCode}\n\n📊 ${t(tr, 'total', 'Total')}: ${refs||0}\n📅 ${t(tr, 'stats_last_30_days', 'Last 30 days')}: ${upd.last30DaysReferrals||0}`);
  }
  
  if (txt.includes('💰')) {
    const tr = await getTrans(ctx.from.id);
    const { data: u } = await supabase.from('User').select('totalEarned,totalInvestedReal,last30DaysEarned,last30DaysInvested,tonWallet').eq('telegramId',ctx.from.id).maybeSingle();
    if (!u) { await ctx.reply(t(tr, 'not_registered', '❌ Not registered')); return; }
    await ctx.reply(
      `💰 ${t(tr, 'finances', 'Finances')}\n\n` +
      `📊 ${t(tr, 'stats_all_time', 'ALL TIME')}:\n` +
      `💸 ${Number(u.totalInvestedReal||0).toFixed(2)} TON\n` +
      `📈 ${Number(u.totalEarned||0).toFixed(2)} TON\n\n` +
      `📅 ${t(tr, 'stats_last_30_days', 'LAST 30 DAYS')}:\n` +
      `💸 ${Number(u.last30DaysInvested||0).toFixed(2)} TON\n` +
      `📈 ${Number(u.last30DaysEarned||0).toFixed(2)} TON\n\n` +
      `🔗 ${u.tonWallet || t(tr, 'not_connected', 'Not connected')}`
    );
  }
  
  if (txt.includes('FAQ')) await ctx.reply('📖 FAQ\n\nMatrix TON');
  if (txt.includes('⚙️')) { 
    const tr = await getTrans(ctx.from.id); 
    await ctx.reply(`⚙️ ${t(tr, 'menu_settings', 'Settings')}`, {reply_markup: new InlineKeyboard().text('🌐 Language','change_language')}); 
  }
});

console.log('🤖 Bot STATS (with full translations)');
bot.start();
