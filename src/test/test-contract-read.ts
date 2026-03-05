import dotenv from 'dotenv';
dotenv.config();

import { TonClient, Address } from '@ton/ton';

const CONTRACT_ADDRESS = 'EQDjjT7CWLNL2_Kkd7aizOoFks5GJF696PjfSL_rz6ucAcrs';

async function main() {
  const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TON_API_KEY || '',
  });

  const address = Address.parse(CONTRACT_ADDRESS);
  const balance = await client.getBalance(address);
  const state = await client.getContractState(address);
  
  console.log('✅ Contract:', CONTRACT_ADDRESS);
  console.log('💰 Balance:', Number(balance) / 1e9, 'TON');
  console.log('📦 State:', state.state);
  console.log('📏 Code size:', state.code?.length, 'bytes');
}

main().catch(console.error);
