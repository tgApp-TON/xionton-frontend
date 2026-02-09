import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function renameTestUsers() {
  console.log('🔄 Renaming test users...\n');

  // Get all non-MASTER users
  const { data: users, error } = await supabase
    .from('User')
    .select('id, nickname, role')
    .neq('id', 1)
    .order('id', { ascending: true });

  if (error || !users) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${users.length} test users to rename\n`);

  // Rename each user
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const newNickname = `Test${i + 1}`;
    let referralCode = newNickname.toUpperCase().slice(0, 10);

    console.log(`${i + 1}. Renaming "${user.nickname}" → "${newNickname}"...`);

    // Check if referralCode already exists, if so add suffix
    const { data: existing } = await supabase
      .from('User')
      .select('id')
      .eq('referralCode', referralCode)
      .neq('id', user.id)
      .maybeSingle();

    if (existing) {
      // Add timestamp suffix to make it unique
      referralCode = `${newNickname.toUpperCase().slice(0, 6)}${Date.now().toString().slice(-4)}`;
      console.log(`   ⚠️  ReferralCode conflict, using: ${referralCode}`);
    }

    const { error: updateError } = await supabase
      .from('User')
      .update({ 
        nickname: newNickname,
        referralCode: referralCode
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(`   ❌ Error:`, updateError.message);
    } else {
      console.log(`   ✅ Done (referralCode: ${referralCode})`);
    }
  }

  console.log('\n✅ All test users renamed!');
}

renameTestUsers().catch(console.error);
