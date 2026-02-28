// Re-export everything from types/index.ts for convenience
export * from './types/index';

// Also export DashboardData and related types directly for easier imports
export type {
  DashboardData,
  User,
  UserStats,
  Transaction,
  PendingPayout,
  Referral
} from './types/index';

// Keep these exports for backward compatibility
export interface Table {
  id: number;
  userId: number;
  tableNumber: number;
  status: 'ACTIVE' | 'CLOSED';
  cycleNumber: number;
  createdAt: string;
  closedAt: string | null;
  positions: TablePosition[];
}

export interface TablePosition {
  id: number;
  tableId: number;
  partnerUserId: number;
  partnerNickname?: string;
  position: number;
  cycleNumber: number;
  amountPaid: number;
  amountReceived: number;
  status: 'PAID_OUT' | 'PENDING_PAYOUT' | 'HELD_FOR_AUTOPURCHASE' | 'PLATFORM_INCOME';
  txHash?: string;
  processedAt?: string;
  createdAt: string;
}

export const TABLE_PRICES: Record<number, number> = {
  1: 0.0001,
  2: 0.0002,
  3: 0.0004,
  4: 0.0008,
  5: 0.0016,
  6: 0.0032,
  7: 0.0064,
  8: 0.0128,
  9: 0.0256,
  10: 0.0512,
  11: 0.1024,
  12: 0.2048
};
