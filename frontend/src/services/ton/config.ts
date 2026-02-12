import dotenv from 'dotenv';

dotenv.config();

// Адреса кошельков системы
export const SYSTEM_WALLETS = {
  INCOME: process.env.INCOME_WALLET || '',
  OPERATIONS: process.env.OPERATIONS_WALLET || '',
  MASTER: process.env.MASTER_WALLET_ADDRESS || ''
};

// Цены столов
export const TABLE_PRICES = {
  1: 10,
  2: 20,
  3: 40,
  4: 80,
  5: 160,
  6: 320,
  7: 640,
  8: 1280,
  9: 2560,
  10: 5120,
  11: 10240,
  12: 20480
} as const;

// Комиссия платформы
export const PLATFORM_FEE = 0.1; // 10%

// TON Connect URL
export const TON_CONNECT_MANIFEST = 'https://raw.githubusercontent.com/yourusername/matrix-ton/main/public/tonconnect-manifest.json';

export const isTestnet = process.env.TON_NETWORK === 'testnet';
