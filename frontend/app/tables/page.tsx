'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CanvasTableCard } from '@/components/tables/CanvasTableCard';
import { ScrollButtons } from '@/components/ScrollButtons';
import { Table, TABLE_PRICES } from '@/lib/types';
import { Wallet, Users, TrendingUp, Table as TableIcon } from 'lucide-react';

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTables([
      {
        id: 1,
        userId: 1,
        tableNumber: 1,
        status: 'ACTIVE',
        cycleNumber: 12,
        createdAt: new Date().toISOString(),
        closedAt: null,
        positions: [
          { id: 1, tableId: 1, partnerUserId: 4, partnerNickname: 'Alice', position: 1, cycleNumber: 12, amountPaid: 9, amountReceived: 9, status: 'PAID_OUT', createdAt: new Date().toISOString() },
          { id: 2, tableId: 1, partnerUserId: 5, partnerNickname: 'Bob', position: 2, cycleNumber: 12, amountPaid: 9, amountReceived: 0, status: 'HELD_FOR_AUTOPURCHASE', createdAt: new Date().toISOString() },
          { id: 3, tableId: 1, partnerUserId: 7, partnerNickname: 'Charlie', position: 3, cycleNumber: 12, amountPaid: 9, amountReceived: 0, status: 'HELD_FOR_AUTOPURCHASE', createdAt: new Date().toISOString() },
          { id: 4, tableId: 1, partnerUserId: 8, partnerNickname: 'Diana', position: 4, cycleNumber: 12, amountPaid: 9, amountReceived: 0, status: 'PLATFORM_INCOME', createdAt: new Date().toISOString() }
        ]
      },
      {
        id: 2,
        userId: 1,
        tableNumber: 2,
        status: 'ACTIVE',
        cycleNumber: 12,
        createdAt: new Date().toISOString(),
        closedAt: null,
        positions: [
          { id: 5, tableId: 2, partnerUserId: 9, partnerNickname: 'Eve', position: 1, cycleNumber: 12, amountPaid: 18, amountReceived: 18, status: 'PAID_OUT', createdAt: new Date().toISOString() },
          { id: 6, tableId: 2, partnerUserId: 10, partnerNickname: 'Frank', position: 2, cycleNumber: 12, amountPaid: 18, amountReceived: 0, status: 'HELD_FOR_AUTOPURCHASE', createdAt: new Date().toISOString() }
        ]
      },
      {
        id: 3,
        userId: 1,
        tableNumber: 3,
        status: 'ACTIVE',
        cycleNumber: 3,
        createdAt: new Date().toISOString(),
        closedAt: null,
        positions: []
      },
      {
        id: 4,
        userId: 1,
        tableNumber: 4,
        status: 'ACTIVE',
        cycleNumber: 13,
        createdAt: new Date().toISOString(),
        closedAt: null,
        positions: []
      },
      {
        id: 5,
        userId: 1,
        tableNumber: 5,
        status: 'ACTIVE',
        cycleNumber: 3,
        createdAt: new Date().toISOString(),
        closedAt: null,
        positions: []
      },
      {
        id: 6,
        userId: 1,
        tableNumber: 6,
        status: 'ACTIVE',
        cycleNumber: 3,
        createdAt: new Date().toISOString(),
        closedAt: null,
        positions: []
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading tables...</p>
        </div>
      </div>
    );
  }

  const activeTables = tables.filter(t => t.status === 'ACTIVE');
  const activeTableNumbers = activeTables.map(t => t.tableNumber);
  const totalEarned = 156.8;
  const totalReferrals = 47;
  const totalCycles = tables.reduce((sum, t) => sum + t.cycleNumber, 0);

  return (
    <div className="min-h-screen relative">
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/dashboard';
          }}
          className="fixed top-4 left-4 z-[99999] px-4 py-2 bg-red-500 text-white rounded text-sm"
        >
          Reset Registration
        </button>
      )}
      <ScrollButtons />
      
      <div className="container mx-auto p-4 max-w-5xl relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Matrix TON Tables
          </h1>
          <p className="text-gray-300">
            {activeTables.length} of 12 tables active
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          maxWidth: '900px',
          margin: '0 auto 0 calc(50% - 450px - 40px)',
          padding: '0 40px',
          marginBottom: '3rem'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((tableNumber) => {
            const table = tables.find(t => t.tableNumber === tableNumber);
            const isActive = activeTableNumbers.includes(tableNumber);
            const price = TABLE_PRICES[tableNumber];
            const positions = table?.positions || [];
            const cycles = table?.cycleNumber || 0;

            const slots: any[] = [
              positions.find(p => p.position === 1),
              positions.find(p => p.position === 2),
              positions.find(p => p.position === 3),
              positions.find(p => p.position === 4)
            ];

            return (
              <div key={tableNumber} className="w-full">
                <CanvasTableCard
                  tableNumber={tableNumber}
                  price={price}
                  cycles={cycles}
                  slots={slots}
                  isActive={isActive}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
