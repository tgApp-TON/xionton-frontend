// User types
export interface User {
  id: number;
  telegramId: string;
  nickname: string;
  tonWallet: string;
  role: 'owner' | 'founder' | 'partner' | 'user';
  referrerId: number | null;
  referralCode: string;
  registeredAt: string;
}

export interface UserStats {
  userId: number;
  activeTables: number;
  totalEarned: number;
  totalReferrals: number;
  table1Cycles: number;
  table2Cycles: number;
  table3Cycles: number;
  table4Cycles: number;
  table5Cycles: number;
  table6Cycles: number;
  table7Cycles: number;
  table8Cycles: number;
  table9Cycles: number;
  table10Cycles: number;
  table11Cycles: number;
  table12Cycles: number;
}

// Table types
export interface Table {
  id: number;
  userId: number;
  tableNumber: number;
  status: 'ACTIVE' | 'CLOSED';
  cycleNumber: number;
  createdAt: string;
  closedAt: string | null;
  positions?: TablePosition[];
}

export interface TablePosition {
  id: number;
  tableId: number;
  partnerUserId: number;
  partnerNickname: string;
  position: number;
  cycleNumber: number;
  amountPaid: number;
  amountReceived: number;
  status: 'PAID_OUT' | 'PENDING_PAYOUT' | 'HELD_FOR_AUTOPURCHASE' | 'PLATFORM_INCOME';
  createdAt: string;
}

// Dashboard data
export interface DashboardData {
  user: User;
  stats: UserStats;
  tables: Table[];
  recentTransactions: Transaction[];
  pendingPayouts: PendingPayout[];
}

export interface Transaction {
  id: number;
  txHash: string;
  amount: number;
  type: string;
  tableNumber: number | null;
  status: string;
  createdAt: string;
}

export interface PendingPayout {
  id: number;
  amount: number;
  reason: string;
  tableNumber: number | null;
  status: string;
  createdAt: string;
}

// Referral types
export interface Referral {
  id: number;
  nickname: string;
  telegramUsername: string | null;
  registeredAt: string;
  activeTables: number;
  totalEarned: number;
}

// Table prices
export const TABLE_PRICES: Record<number, number> = {
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
};
