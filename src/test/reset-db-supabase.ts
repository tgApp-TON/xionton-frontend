import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const MASTER_TELEGRAM_ID = '669838070';
const MASTER_WALLET = 'UQBFsQEIh7Gj38FoFgYiT_PStgbtTd6D3f0qG-E9-u2vDToY';

async function main() {
  // Показываем всех пользователей
  const { data: users } = await supabase.from('User').select('id, telegramId, telegramUsername, role, tonWallet');
  console.log('👥 Все пользователи:');
  users?.forEach(u => console.log(`  ID=${u.id} tg=${u.telegramId} @${u.telegramUsername} wallet=${u.tonWallet}`));

  // Находим мастера
  const master = users?.find(u => u.telegramId == MASTER_TELEGRAM_ID);
  if (!master) { console.log('❌ MASTER не найден!'); return; }
  console.log(`\n👑 MASTER: ID=${master.id}`);

  const otherIds = users?.filter(u => u.id !== master.id).map(u => u.id) || [];
  console.log(`🗑️  Удаляем ${otherIds.length} пользователей...`);

  if (otherIds.length > 0) {
    await supabase.from('PendingPayout').delete().in('userId', otherIds);
    await supabase.from('ActivityLog').delete().in('userId', otherIds);
    await supabase.from('Transaction').delete().in('userId', otherIds);
    await supabase.from('UserStats').delete().in('userId', otherIds);
    await supabase.from('TablePosition').delete().neq('id', 0);
    await supabase.from('Table').delete().in('userId', otherIds);
    await supabase.from('User').update({ referrerId: null }).in('id', otherIds);
    await supabase.from('User').delete().in('id', otherIds);
  }

  // Обновляем кошелёк мастера
  await supabase.from('User').update({ tonWallet: MASTER_WALLET }).eq('id', master.id);

  console.log('✅ Готово!');
  const { data: remaining } = await supabase.from('User').select('id, telegramId, telegramUsername, tonWallet');
  remaining?.forEach(u => console.log(`  ID=${u.id} tg=${u.telegramId} @${u.telegramUsername} wallet=${u.tonWallet}`));
}

main().catch(console.error);
