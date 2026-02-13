'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuPanel({ isOpen, onClose }: MenuPanelProps) {
  const router = useRouter();
  const tonAddress = useTonAddress();
  const hasInitialWalletRun = useRef(false);
  const [stats, setStats] = useState<{ nickname: string; activeTables: number; totalCycles: number } | null>(null);

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
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
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

      <div style={{ position: 'relative', zIndex: 999999, padding: '80px 24px 24px' }}>
        {/* Section 1 - Wallet */}
        <p style={{ color: '#aaaaaa', fontSize: '0.85rem', margin: '0 0 8px 0' }}>Wallet</p>
        {tonAddress ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>
              {tonAddress.slice(0, 6)}...{tonAddress.slice(-4)}
            </span>
            <TonConnectButton />
          </div>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            <TonConnectButton />
          </div>
        )}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

        {/* Section 2 - Stats */}
        <p style={{ color: '#aaaaaa', fontSize: '0.85rem', margin: '0 0 8px 0' }}>Stats</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#aaaaaa', fontSize: '1rem' }}>Active Tables</span>
            <span style={{ color: '#ffffff', fontSize: '1rem' }}>{stats?.activeTables ?? '—'}/12</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#aaaaaa', fontSize: '1rem' }}>Total Cycles</span>
            <span style={{ color: '#ffffff', fontSize: '1rem' }}>{stats?.totalCycles ?? '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#aaaaaa', fontSize: '1rem' }}>Nickname</span>
            <span style={{ color: '#ffffff', fontSize: '1rem' }}>{stats?.nickname || '—'}</span>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

        {/* Section 3 - Navigation */}
        <p style={{ color: '#aaaaaa', fontSize: '0.85rem', margin: '0 0 8px 0' }}>Navigation</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => goTo('/tables')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.1rem',
              textAlign: 'left',
              cursor: 'pointer',
              padding: '12px 0',
            }}
          >
            Tables
          </button>
          <button
            type="button"
            onClick={() => goTo('/referrals')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.1rem',
              textAlign: 'left',
              cursor: 'pointer',
              padding: '12px 0',
            }}
          >
            Referrals
          </button>
        </div>
      </div>
    </div>
  );
}
