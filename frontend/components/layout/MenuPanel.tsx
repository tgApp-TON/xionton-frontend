'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuPanel({ isOpen, onClose }: MenuPanelProps) {
  const router = useRouter();
  const tonAddress = useTonAddress();
  const hasInitialWalletRun = useRef(false);
  const [stats, setStats] = useState<{ nickname: string; activeTables: number; totalCycles: number; totalEarned?: number } | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('matrix_ton_user_id') : null;
    if (!userId) return;
    if (!hasInitialWalletRun.current) {
      hasInitialWalletRun.current = true;
      return;
    }
    fetch('/api/auth/update-wallet', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tonWallet: tonAddress || '' }),
    }).catch(() => {});
  }, [tonAddress]);

  useEffect(() => {
    if (!isOpen) return;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('matrix_ton_user_id') : null;
    if (!userId) return;
    fetch(`/api/user/stats?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.nickname !== undefined) {
          setStats({
            nickname: data.nickname ?? '',
            activeTables: data.activeTables ?? 0,
            totalCycles: data.totalCycles ?? 0,
          });
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const goTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        background: 'rgba(0,0,0,0.97)',
        color: '#ffffff',
      }}
    >
      <button
        type="button"
        onClick={() => onClose()}
        style={{
          position: 'fixed',
          top: 'calc(24px + env(safe-area-inset-top, 0px))',
          right: '16px',
          zIndex: 9999999,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(168,85,247,0.3)',
          border: '1px solid rgba(168,85,247,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <X size={24} style={{ color: '#fff' }} />
      </button>

      <style>{`
        .menu-panel-row:hover,
        .menu-panel-row:active {
          background: rgba(168,85,247,0.1);
          border-radius: 8px;
        }
      `}</style>
      <div style={{ position: 'relative', zIndex: 999999, padding: '80px 24px 24px' }}>
        {/* Section 1 - Wallet (clickable) */}
        <p style={{ color: '#a855f7', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Wallet
        </p>
        <div
          className="menu-panel-row"
          role="button"
          tabIndex={0}
          onClick={() => setIsWalletModalOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setIsWalletModalOpen(true)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span>Wallet</span>
          <ArrowRight size={20} style={{ color: '#ffffff', flexShrink: 0 }} />
        </div>

        {/* Section 2 - Stats */}
        <p style={{ color: '#a855f7', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', marginTop: '24px' }}>
          Stats
        </p>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <span style={{ color: '#888888', fontSize: '0.85rem' }}>Active Tables</span>
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{stats?.activeTables ?? '—'}/12</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <span style={{ color: '#888888', fontSize: '0.85rem' }}>Total Cycles</span>
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{stats?.totalCycles ?? '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <span style={{ color: '#888888', fontSize: '0.85rem' }}>Total Earned</span>
            <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '1rem' }}>{stats?.totalEarned != null ? `${Number(stats.totalEarned).toFixed(2)} TON` : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <span style={{ color: '#888888', fontSize: '0.85rem' }}>Nickname</span>
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{stats?.nickname || '—'}</span>
          </div>
        </div>

        {/* Section 3 - Navigation */}
        <p style={{ color: '#a855f7', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', marginTop: '24px' }}>
          Navigation
        </p>
        <div>
          <div
            className="menu-panel-row"
            role="button"
            tabIndex={0}
            onClick={() => goTo('/tables')}
            onKeyDown={(e) => e.key === 'Enter' && goTo('/tables')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span>Tables</span>
            <ArrowRight size={20} style={{ color: '#ffffff', flexShrink: 0 }} />
          </div>
          <div
            className="menu-panel-row"
            role="button"
            tabIndex={0}
            onClick={() => goTo('/referrals')}
            onKeyDown={(e) => e.key === 'Enter' && goTo('/referrals')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span>Referrals</span>
            <ArrowRight size={20} style={{ color: '#ffffff', flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* Wallet modal */}
      {isWalletModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: 'rgba(0,0,0,0.98)',
            color: '#ffffff',
          }}
        >
          <button
            type="button"
            onClick={() => setIsWalletModalOpen(false)}
            style={{
              position: 'fixed',
              top: 'calc(24px + env(safe-area-inset-top, 0px))',
              right: '16px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(168,85,247,0.3)',
              border: '1px solid rgba(168,85,247,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={24} style={{ color: '#fff' }} />
          </button>
          <div style={{ padding: '80px 24px 24px', maxWidth: '420px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Wallet</h2>
            {tonAddress ? (
              <>
                <p style={{ color: '#aaaaaa', fontSize: '0.9rem', marginBottom: '8px' }}>Current wallet:</p>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowFullAddress(!showFullAddress)}
                  onKeyDown={(e) => e.key === 'Enter' && setShowFullAddress(!showFullAddress)}
                  style={{
                    color: showFullAddress ? '#ffffff' : '#a855f7',
                    fontSize: '0.85rem',
                    wordBreak: showFullAddress ? 'break-all' : undefined,
                    marginBottom: '4px',
                    lineHeight: 1.5,
                    cursor: 'pointer',
                  }}
                >
                  {showFullAddress ? tonAddress : `${tonAddress.slice(0, 6)}...${tonAddress.slice(-4)}`}
                </div>
                <p style={{ color: '#888888', fontSize: '0.75rem', marginBottom: '20px' }}>
                  {showFullAddress ? 'Tap to hide' : 'Tap to see full address'}
                </p>
                <p style={{ color: '#888888', fontSize: '0.8rem', marginBottom: '20px' }}>
                  Tap the button below to switch or disconnect wallet
                </p>
              </>
            ) : (
              <p style={{ color: '#aaaaaa', fontSize: '0.9rem', marginBottom: '20px' }}>No wallet connected</p>
            )}
            <p style={{ color: '#888888', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Connect your TON wallet to participate in Matrix TON. When you connect a new wallet, it replaces your current one.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <TonConnectButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
