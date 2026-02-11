'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CanvasTableCard } from '@/components/tables/CanvasTableCard';
import { ScrollButtons } from '@/components/ScrollButtons';
import { TABLE_PRICES } from '@/lib/types';

export default function TablesPage() {
  const router = useRouter();
  const [userTables, setUserTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('matrix_ton_user_id');
    }
    return null;
  });

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('matrix_ton_user_id');
      if (!storedId) {
        router.replace('/register');
      } else {
        setUserId(storedId);
      }
    }
  }, [router]);

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
    if (!userId) return;
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

  // Always show tables 1–12
  const allTableNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

  const refreshTables = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/user/tables?userId=${userId}`);
      const data = await response.json();
      if (data.success) setUserTables(data.tables);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  const handleBuy = async (tableNumber: number) => {
    if (!userId) return;
    try {
      const response = await fetch('/api/user/tables/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId, 10),
          tableNumber,
        }),
      });
      const data = await response.json();
      if (data.success) await refreshTables();
    } catch (error) {
      console.error('Failed to buy table:', error);
    }
  };

  return (
    <div className="min-h-screen relative">
      {!loading && <ScrollButtons />}
      <div className="w-full relative z-10" style={{ paddingTop: '70px' }}>
        <div
          className="grid grid-cols-2 pt-[90px] mb-12"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            width: 'fit-content',
            margin: '0 auto',
            gap: '0px',
          }}
        >
          {loading ? (
            <div
              style={{
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                paddingTop: '0',
                backgroundColor: 'transparent',
              }}
            >
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '24px', textAlign: 'center' }}>Loading tables...</p>
              <p style={{ fontSize: '1.5rem', color: 'white', marginBottom: '16px', textAlign: 'center' }}>{progress}%</p>
              <div style={{ width: '250px', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                <div
                  style={{ width: `${progress}%`, height: '100%', backgroundColor: '#a855f7', borderRadius: '4px', transition: 'width 0.1s' }}
                />
              </div>
            </div>
          ) : (
            allTableNumbers.map((tableNumber) => {
              const userTable = userTables.find((t: any) => t.tableNumber === tableNumber);
              const isActive = !!userTable && userTable.status === 'ACTIVE';
              const price = TABLE_PRICES[tableNumber] ?? 0;
              const positions = userTable?.positions ?? [];
              const slots: [(any | null)?, (any | null)?, (any | null)?, (any | null)?] = [
                positions.find((p: any) => p.position === 1) || null,
                positions.find((p: any) => p.position === 2) || null,
                positions.find((p: any) => p.position === 3) || null,
                positions.find((p: any) => p.position === 4) || null,
              ];
              const cycles = userTable ? (userTable.cycleNumber ?? 1) - 1 : 0;
              const prevTableActive = userTables.some((t: any) => t.tableNumber === tableNumber - 1 && t.status === 'ACTIVE');
              const isUnlocked = tableNumber === 1 || prevTableActive;

              return (
                <div key={tableNumber} style={{ width: '44vw' }}>
                  <CanvasTableCard
                    tableNumber={tableNumber}
                    price={price}
                    cycles={cycles}
                    slots={slots}
                    isActive={isActive}
                    isUnlocked={isUnlocked}
                    onBuy={() => handleBuy(tableNumber)}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
