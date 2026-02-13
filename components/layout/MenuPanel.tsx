'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuPanel({ isOpen, onClose }: MenuPanelProps) {
  const router = useRouter();
  const tonAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const hasInitialWalletRun = useRef(false);
  const [stats, setStats] = useState<{ nickname: string; activeTables: number; totalCycles: number } | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

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

  const handleWalletAction = async () => {
    if (!tonConnectUI) return;
    if (tonAddress) {
      await tonConnectUI.disconnect();
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    try {
      await tonConnectUI.openModal();
    } catch (e) {
      console.error('openModal error:', e);
    }
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
          top: '16px',
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

      <div style={{ position: 'relative', zIndex: 999999, padding: '80px 24px 24px' }}>
        {/* Section 1 - Wallet (clickable) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsWalletModalOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setIsWalletModalOpen(true)}
          style={{
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          <p style={{ color: '#aaaaaa', fontSize: '0.85rem', margin: '0 0 4px 0' }}>Wallet</p>
          {tonAddress ? (
            <p style={{ color: '#888888', fontSize: '0.75rem', margin: '0 0 0 0', wordBreak: 'break-all' }}>
              {tonAddress}
            </p>
          ) : (
            <p style={{ color: '#aaaaaa', fontSize: '0.85rem', margin: '12px 0 0 0' }}>
              No wallet connected
            </p>
          )}
        </div>

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
          <div style={{ padding: '80px 24px 24px', maxWidth: '420px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Wallet</h2>
            {tonAddress ? (
              <>
                <p style={{ color: '#aaaaaa', fontSize: '0.9rem', marginBottom: '8px' }}>Current wallet:</p>
                <p style={{ color: '#ffffff', fontSize: '0.85rem', wordBreak: 'break-all', marginBottom: '12px', lineHeight: 1.5 }}>
                  {tonAddress}
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
            <button
              type="button"
              onClick={handleWalletAction}
              style={{
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '14px 24px',
                borderRadius: '12px',
                width: '100%',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🔄 Switch / Connect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
