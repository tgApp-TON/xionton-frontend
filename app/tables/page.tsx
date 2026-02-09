'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CanvasTableCard } from '@/components/tables/CanvasTableCard';
import { ScrollButtons } from '@/components/ScrollButtons';
import { Table, TABLE_PRICES } from '@/lib/types';
import { Wallet, Users, TrendingUp, Table as TableIcon } from 'lucide-react';

export default function TablesPage() {
  const [userTables, setUserTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('matrix_ton_user_id') || '1';
    }
    return '1';
  });

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(`/api/user/tables?userId=${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setUserTables(data.tables);
        }
      } catch (error) {
        console.error('Failed to fetch tables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [userId]);

  const activeTables = userTables.filter(t => t.status === 'ACTIVE');
  const activeTableNumbers = activeTables.map(t => t.tableNumber);
  const totalEarned = 156.8;
  const totalReferrals = 47;
  const totalCycles = userTables.reduce((sum, t) => sum + t.cycleNumber, 0);

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
          {loading ? (
            <div className="col-span-2 text-center text-white text-xl py-12">
              Loading tables...
            </div>
          ) : (
            userTables.length > 0 ? (
              userTables.map((table) => {
                const isActive = table.status === 'ACTIVE';
                const price = TABLE_PRICES[table.tableNumber - 1];
                const slots: [(any | null)?, (any | null)?, (any | null)?, (any | null)?] = [
                  table.positions.find((p: any) => p.position === 1) || null,
                  table.positions.find((p: any) => p.position === 2) || null,
                  table.positions.find((p: any) => p.position === 3) || null,
                  table.positions.find((p: any) => p.position === 4) || null
                ];

                return (
                  <div key={table.id} className="w-full">
                    <CanvasTableCard
                      tableNumber={table.tableNumber}
                      price={price}
                      cycles={table.cycleNumber}
                      slots={slots}
                      isActive={isActive}
                    />
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center text-white text-xl py-12">
                No tables found
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
