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

async function listUsers() {
  console.log('👥 All users in database:\n');

  const { data: users, error } = await supabase
    .from('User')
    .select('id, nickname, role, telegramUsername, registeredAt, referrerId, metadata')
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users found');
    return;
  }

  console.log(`Total: ${users.length} users\n`);
  console.log('─'.repeat(80));

  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.nickname} (ID: ${user.id})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Telegram: @${user.telegramUsername || 'N/A'}`);
    console.log(`   Registered: ${new Date(user.registeredAt).toLocaleDateString()}`);
    console.log(`   Referrer ID: ${user.referrerId || 'None (MASTER)'}`);
    
    if (user.metadata) {
      const meta = user.metadata as any;
      console.log(`   Country: ${meta.country || 'N/A'}`);
      console.log(`   Name: ${meta.firstName || ''} ${meta.lastName || ''}`);
    }
  });

  console.log('\n' + '─'.repeat(80));
  
  // Count by role
  const roleCount = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 By role:');
  Object.entries(roleCount).forEach(([role, count]) => {
    console.log(`   ${role}: ${count}`);
  });

  // Count by referrer
  const referrerCount = users.reduce((acc, user) => {
    const ref = user.referrerId || 'None';
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {} as Record<string | number, number>);

  console.log('\n📊 By referrer:');
  Object.entries(referrerCount).forEach(([ref, count]) => {
    console.log(`   Referrer ${ref}: ${count} users`);
  });
}

listUsers().catch(console.error);
