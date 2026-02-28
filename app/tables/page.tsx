'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { CanvasTableCard } from '@/components/tables/CanvasTableCard';
import { TableDetailModal } from '@/components/tables/TableDetailModal';
import { MenuPanel } from '@/components/layout/MenuPanel';
import { TABLE_PRICES } from '@/lib/types';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { beginCell, Address } from '@ton/core';

export default function TablesPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [userTables, setUserTables] = useState<any[]>([]);
  const [matrixTables, setMatrixTables] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string>('');
  const [userWallet, setUserWallet] = useState<string>('');
  const [buyingTable, setBuyingTable] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ tableNumber: number; price: number } | null>(null);
  const [tableDetailModal, setTableDetailModal] = useState<{ tableNumber: number } | null>(null);

  const [tonConnectUI] = useTonConnectUI();
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('matrix_ton_grayscale');
    const value = saved === 'true' || saved === '1';
    setIsGrayscale(value);
    document.documentElement.style.filter = value ? 'grayscale(100%)' : '';
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.filter = isGrayscale ? 'grayscale(100%)' : '';
  }, [isGrayscale]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    (async () => {
      let storedId = localStorage.getItem('matrix_ton_user_id');
      if (!storedId) {
        const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser?.id) {
          const res = await fetch(`/api/auth/me?telegramId=${tgUser.id}`);
          const data = await res.json();
          if (data.exists && data.user?.id) {
            storedId = String(data.user.id);
            localStorage.setItem('matrix_ton_user_id', storedId);
          }
        }
        if (!storedId) {
          router.replace('/register');
          return;
        }
      }
      let telegramUser = null;
      if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
        telegramUser = (window as any).Telegram.WebApp.initDataUnsafe.user;
      }
      let headers: Record<string, string> = {};
      if (telegramUser) {
        try {
          const userStr = JSON.stringify(telegramUser);
          const base64User = btoa(unescape(encodeURIComponent(userStr)));
          headers = { 'x-telegram-user-base64': base64User };
        } catch (e) {
          console.log('Failed to encode telegram user:', e);
        }
      }
      const verifyRes = await fetch(
        `/api/auth/me?userId=${encodeURIComponent(storedId)}`,
        { method: 'GET', headers }
      );
      const verifyData = await verifyRes.json();
      if (cancelled) return;
      if (!verifyData.exists) {
        localStorage.removeItem('matrix_ton_user_id');
        router.replace('/register');
        return;
      }
      setUserId(storedId);
    })();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (loading) {
      console.log('Progress interval started, loading:', loading);
      setProgress(0);
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return prev;
          }
          return prev + 2;
        });
      }, 50);
      console.log('Progress interval set');
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [loading]);

  useEffect(() => {
    const storedId = localStorage.getItem('matrix_ton_user_id');
    if (!storedId) return;
    fetch(`/api/auth/me?userId=${storedId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUserNickname(data.user.nickname || '');
          setUserWallet(data.user.tonWallet || '');
        }
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    console.log('userId:', userId);
    const fetchTables = async () => {
      console.log('Starting fetchTables');
      try {
        const [tablesRes, statusRes] = await Promise.all([
          fetch(`/api/user/tables?userId=${userId}`),
          fetch(`/api/table/status?userId=${userId}`),
        ]);
        console.log('Promises resolved');
        const tablesData = await tablesRes.json();
        const statusData = await statusRes.json();
        console.log('statusData:', statusData);
        if (tablesData.success) setUserTables(tablesData.tables);
        if (statusData.tables) {
          const map: Record<number, any> = {};
          statusData.tables.forEach((t: any) => {
            map[t.tableNumber] = t;
          });
          setMatrixTables(map);
          console.log('Data set, matrixTables:', Object.keys(map).length);
        }
      } catch (error) {
        console.error('Failed to fetch tables:', error);
      } finally {
        setProgress(100);
        console.log('Progress set to 100');
        setLoading(false);
        console.log('Loading set to false');
      }
    };
    fetchTables();
  }, [userId]);

  // Always show tables 1–12
  const allTableNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

  const refreshTables = async () => {
    if (!userId) return;
    try {
      const [tablesRes, statusRes] = await Promise.all([
        fetch(`/api/user/tables?userId=${userId}`),
        fetch(`/api/table/status?userId=${userId}`),
      ]);
      const tablesData = await tablesRes.json();
      const statusData = await statusRes.json();
      if (tablesData.success) setUserTables(tablesData.tables);
      if (statusData.tables) {
        const map: Record<number, any> = {};
        statusData.tables.forEach((t: any) => {
          map[t.tableNumber] = t;
        });
        setMatrixTables(map);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  const handleBuyTable = async (tableNumber: number) => {
    if (!userId) return;
    const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
    if (!CONTRACT) { setToast({ msg: 'Contract not configured', type: 'error' }); return; }
    const prices: Record<number, number> = {
      1:0.0001, 2:0.0002, 3:0.0004, 4:0.0008, 5:0.0016,
      6:0.0032, 7:0.0064, 8:0.0128, 9:0.0256,
      10:0.0512, 11:0.1024, 12:0.2048
    };
    const amount = Math.floor((prices[tableNumber] + 0.05) * 1e9);
    setBuyingTable(tableNumber);
    try {
      let payload: string;
      if (tableNumber === 1) {
        const masterWallet = process.env.NEXT_PUBLIC_MASTER_WALLET || CONTRACT;
        payload = beginCell()
          .storeUint(0x100, 32)
          .storeAddress(Address.parse(masterWallet))
          .endCell()
          .toBoc()
          .toString('base64');
      } else {
        payload = beginCell()
          .storeUint(0x101, 32)
          .storeUint(tableNumber, 8)
          .endCell()
          .toBoc()
          .toString('base64');
      }
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: CONTRACT, amount: amount.toString(), payload }]
      });
      setConfirmModal(null);
      setToast({ msg: `Payment sent! Table ${tableNumber} will activate shortly.`, type: 'success' });
    } catch (e) {
      setToast({ msg: 'Transaction cancelled', type: 'error' });
    } finally {
      setBuyingTable(null);
    }
  };

  const toggleGrayscale = () => {
    const next = !isGrayscale;
    setIsGrayscale(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('matrix_ton_grayscale', next ? 'true' : 'false');
    }
  };

  return (
    <div className="min-h-screen relative" style={{ minHeight: '100vh' }}>
      {!loading && (
        <>
          <button
            type="button"
            onClick={toggleGrayscale}
            style={{
              position: 'fixed',
              top: 'calc(52px + env(safe-area-inset-top, 0px))',
              left: '12px',
              zIndex: 99999,
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(168,85,247,0.2)',
              border: '1px solid rgba(168,85,247,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isGrayscale ? (
              <Moon size={26} style={{ color: 'rgba(168,85,247,0.9)' }} />
            ) : (
              <Sun size={26} style={{ color: 'rgba(168,85,247,0.9)' }} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            style={{
              position: 'fixed',
              top: 'calc(52px + env(safe-area-inset-top, 0px))',
              right: '12px',
              zIndex: 99999,
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(168,85,247,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(168,85,247,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span style={{ width: '28px', height: '3px', background: 'rgba(168,85,247,0.9)', borderRadius: '10px' }} />
            <span style={{ width: '28px', height: '3px', background: 'rgba(168,85,247,0.9)', borderRadius: '10px' }} />
            <span style={{ width: '28px', height: '3px', background: 'rgba(168,85,247,0.9)', borderRadius: '10px' }} />
          </button>
        </>
      )}
      <div
        className="w-full relative z-10"
        style={{
          paddingTop: '70px',
          minHeight: '100vh',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}
      >
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
              <h1 className="xionton-loading-title">XionTon</h1>
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
              const mt = matrixTables[tableNumber];
              const slotFilled = [mt?.slot1, mt?.slot2, mt?.slot3, mt?.slot4].map((s) => s != null);
              // Only pass nickname for display (never telegramUsername/telegramId)
              const toSlot = (p: any) => p ? { nickname: p.partnerNickname ?? p.nickname, filled: true } : null;
              const slots: [(any | null)?, (any | null)?, (any | null)?, (any | null)?] = [
                toSlot(positions.find((p: any) => p.position === 1) ?? null),
                toSlot(positions.find((p: any) => p.position === 2) ?? null),
                toSlot(positions.find((p: any) => p.position === 3) ?? null),
                toSlot(positions.find((p: any) => p.position === 4) ?? null),
              ];
              if (isActive && mt) {
                slots[0] = slotFilled[0] ? { filled: true } : null;
                slots[1] = slotFilled[1] ? { filled: true } : null;
                slots[2] = slotFilled[2] ? { filled: true } : null;
                slots[3] = slotFilled[3] ? { filled: true } : null;
              }
              const cycles = userTable ? (userTable.cycleNumber ?? 1) - 1 : 0;
              const prevTableActive = userTables.some((t: any) => t.tableNumber === tableNumber - 1 && t.status === 'ACTIVE');
              const isUnlocked = tableNumber === 1 || prevTableActive;
              const statusBuy = isUnlocked && !isActive;

              return (
                <div key={tableNumber} style={{ width: '44vw' }}>
                  <CanvasTableCard
                    tableNumber={tableNumber}
                    price={price}
                    cycles={cycles}
                    slots={slots}
                    isActive={isActive}
                    isUnlocked={isUnlocked}
                    onClick={isActive ? () => setTableDetailModal({ tableNumber }) : statusBuy ? () => setConfirmModal({ tableNumber, price }) : undefined}
                    onBuy={statusBuy ? () => setConfirmModal({ tableNumber, price }) : undefined}
                  />
                  {isActive && (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 4, justifyContent: 'center', marginTop: 6 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: slotFilled[i] ? '#a855f7' : 'transparent',
                            border: '1px solid',
                            borderColor: slotFilled[i] ? '#a855f7' : '#6b7280',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <MenuPanel isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {tableDetailModal && userId && (
        <TableDetailModal
          tableNumber={tableDetailModal.tableNumber}
          userId={userId}
          onClose={() => setTableDetailModal(null)}
        />
      )}
      {confirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999998,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => e.target === e.currentTarget && setConfirmModal(null)}
        >
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: 20,
              padding: 24,
              maxWidth: 320,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', textAlign: 'center' }}>
              TABLE {confirmModal.tableNumber}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: 20 }}>
              Activate this table?
            </div>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: 'white' }}>
                <span>Table price:</span>
                <span>{confirmModal.price} TON</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#888', fontSize: '0.8rem' }}>
                <span>Blockchain fee:</span>
                <span>0.5 TON</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#a855f7', fontWeight: 700 }}>
                <span>Total:</span>
                <span>{(confirmModal.price + 0.000005).toFixed(6)} TON</span>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 12, lineHeight: 1.5 }}>
              💡 Payment goes directly to your sponsor&apos;s slot. You will receive payments when others join under you.
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid #333',
                  color: '#888',
                  borderRadius: 10,
                  padding: 12,
                  flex: 1,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBuyTable(confirmModal.tableNumber)}
                disabled={buyingTable === confirmModal.tableNumber}
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: 12,
                  flex: 1,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: buyingTable === confirmModal.tableNumber ? 'not-allowed' : 'pointer',
                }}
              >
                {buyingTable === confirmModal.tableNumber ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            background: toast.type === 'success' ? '#22c55e' : '#ef4444',
            color: 'white',
            borderRadius: 12,
            padding: '12px 24px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
