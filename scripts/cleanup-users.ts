/**
 * Cleanup non-founder users and their related data from Supabase.
 * Uses SUPABASE_URL and SUPABASE_SERVICE_KEY from .env.local.
 *
 * Run: cd frontend && npx ts-node --project tsconfig.json scripts/cleanup-users.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load .env.local from frontend directory
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('Fetching non-founder user IDs...');
  const { data: users, error: usersError } = await supabase
    .from('User')
    .select('id')
    .neq('role', 'FOUNDER');

  if (usersError) {
    console.error('Failed to fetch users:', usersError);
    process.exit(1);
  }

  const userIds = (users || []).map((u) => u.id);
  if (userIds.length === 0) {
    console.log('No non-founder users to delete.');
    return;
  }

  console.log(`Found ${userIds.length} non-founder user(s). Deleting related data...`);

  // Get table IDs for these users
  const { data: tables } = await supabase.from('Table').select('id').in('userId', userIds);
  const tableIds = (tables || []).map((t) => t.id);

  // 1. TablePosition (references Table)
  if (tableIds.length > 0) {
    const { error: e1 } = await supabase.from('TablePosition').delete().in('tableId', tableIds);
    if (e1) console.error('TablePosition delete error:', e1.message);
    else console.log('  Deleted TablePosition records');
  }

  // 2. Table
  const { error: e2 } = await supabase.from('Table').delete().in('userId', userIds);
  if (e2) console.error('Table delete error:', e2.message);
  else console.log('  Deleted Table records');

  // 3. UserBalance (if table exists)
  try {
    const { error: e3 } = await supabase.from('UserBalance').delete().in('userId', userIds);
    if (e3) console.log('  UserBalance: skipped (table may not exist or error:', e3.message, ')');
    else console.log('  Deleted UserBalance records');
  } catch {
    console.log('  UserBalance: skipped (table may not exist)');
  }

  // 4. PendingPayout
  const { error: e4 } = await supabase.from('PendingPayout').delete().in('userId', userIds);
  if (e4) console.error('PendingPayout delete error:', e4.message);
  else console.log('  Deleted PendingPayout records');

  // 5. PartnerConfig
  const { error: e5 } = await supabase.from('PartnerConfig').delete().in('userId', userIds);
  if (e5) console.error('PartnerConfig delete error:', e5.message);
  else console.log('  Deleted PartnerConfig records');

  // 6. ActivityLog (FK from User)
  const { error: e6 } = await supabase.from('ActivityLog').delete().in('userId', userIds);
  if (e6) console.error('ActivityLog delete error:', e6.message);
  else console.log('  Deleted ActivityLog records');

  // 7. UserStats (FK from User)
  const { error: e7 } = await supabase.from('UserStats').delete().in('userId', userIds);
  if (e7) console.error('UserStats delete error:', e7.message);
  else console.log('  Deleted UserStats records');

  // 8. User where role != 'FOUNDER'
  const { data: deletedUsers, error: e8 } = await supabase
    .from('User')
    .delete()
    .neq('role', 'FOUNDER')
    .select('id');

  if (e8) {
    console.error('User delete error:', e8);
    process.exit(1);
  }

  const deletedCount = deletedUsers?.length ?? 0;
  console.log(`\nDeleted ${deletedCount} user(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
