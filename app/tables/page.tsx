'use client';

import { useState, useEffect, useRef } from 'react';
import { CanvasTableCard } from '@/components/tables/CanvasTableCard';
import { ScrollButtons } from '@/components/ScrollButtons';
import { TABLE_PRICES } from '@/lib/types';

export default function TablesPage() {
  const [userTables, setUserTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [userId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('matrix_ton_user_id') || '1';
    }
    return '1';
  });

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      setProgress(0);
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return 95;
          }
          return prev + 2;
        });
      }, 50);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [loading]);

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
        setProgress(100);
        setLoading(false);
      }
    };
    fetchTables();
  }, [userId]);

  const activeTables = userTables.filter(t => t.status === 'ACTIVE');

  return (
    <div className="min-h-screen relative">
      <ScrollButtons />
      <div className="container mx-auto p-4 max-w-5xl relative z-10">
        <div className="grid grid-cols-2 gap-3 max-w-full mx-auto px-4 mb-12" style={{ paddingTop: '90px', marginLeft: '28px' }}>
          {loading ? (
            <div className="col-span-2 fixed inset-0 flex flex-col items-center justify-center z-50 bg-transparent">
              <p style={{ color: 'white', fontSize: '1.5rem', marginBottom: '16px' }}>Loading tables...</p>
              <p style={{ color: 'white', fontSize: '1.25rem', marginBottom: '12px' }}>{progress}%</p>
              <div style={{ width: '200px', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                <div
                  style={{ width: `${progress}%`, height: '100%', backgroundColor: '#a855f7', borderRadius: '4px', transition: 'width 0.1s' }}
                />
              </div>
            </div>
          ) : userTables.length > 0 ? (
            userTables.map((table, index) => {
              const isActive = table.status === 'ACTIVE';
              const price = TABLE_PRICES[table.tableNumber];
              const positions = table.positions || [];
              const slots: [(any | null)?, (any | null)?, (any | null)?, (any | null)?] = [
                positions.find((p: any) => p.position === 1) || null,
                positions.find((p: any) => p.position === 2) || null,
                positions.find((p: any) => p.position === 3) || null,
                positions.find((p: any) => p.position === 4) || null,
              ];

              // Check if previous table is active (or it's table 1)
              const previousTable = userTables.find(t => t.tableNumber === table.tableNumber - 1);
              const isUnlocked = table.tableNumber === 1 || previousTable?.status === 'ACTIVE';

              const handleBuy = async () => {
                try {
                  const response = await fetch('/api/user/tables/buy', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId: parseInt(userId),
                      tableNumber: table.tableNumber,
                    }),
                  });
                  const data = await response.json();
                  if (data.success) {
                    // Refresh tables
                    const refreshResponse = await fetch(`/api/user/tables?userId=${userId}`);
                    const refreshData = await refreshResponse.json();
                    if (refreshData.success) {
                      setUserTables(refreshData.tables);
                    }
                  }
                } catch (error) {
                  console.error('Failed to buy table:', error);
                }
              };

              return (
                <div key={table.id} className="w-full" style={{ paddingLeft: '12px', paddingRight: '12px' }}>
                  <CanvasTableCard
                    tableNumber={table.tableNumber}
                    price={price}
                    cycles={table.cycleNumber - 1}
                    slots={slots}
                    isActive={isActive}
                    isUnlocked={isUnlocked}
                    onBuy={handleBuy}
                  />
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center text-white text-xl py-12">
              No tables found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
