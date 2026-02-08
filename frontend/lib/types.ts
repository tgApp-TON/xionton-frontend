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
  12: 20480,
};
