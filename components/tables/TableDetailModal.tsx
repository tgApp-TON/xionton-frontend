'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { TABLE_PRICES } from '@/lib/types';

const SLOT_LABELS: Record<number, string> = {
  1: 'Direct payout',
  2: 'Upline payout',
  3: 'Auto-upgrade',
  4: 'Spillover',
};

interface TableDetailModalProps {
  tableNumber: number;
  userId: string;
  onClose: () => void;
}

interface DetailData {
  tableData: {
    slot1: number | null;
    slot2: number | null;
    slot3: number | null;
    slot4: number | null;
    cycleCount: number;
    frozen2Amount: number | null;
  } | null;
  slotUsers: {
    slot1: { nickname: string } | null;
    slot2: { nickname: string } | null;
    slot3: { nickname: string } | null;
    slot4: { nickname: string } | null;
  };
  totalEarned: number;
  payoutCount: number;
  payoutHistory: { amount: number; slotNumber: number; createdAt: string }[];
}

export function TableDetailModal({ tableNumber, userId, onClose }: TableDetailModalProps) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/table/detail?userId=${encodeURIComponent(userId)}&tableNumber=${tableNumber}`
        );
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error ?? 'Failed to load');
          return;
        }
        setData(json);
      } catch (e) {
        if (!cancelled) setError('Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, tableNumber]);

  const price = TABLE_PRICES[tableNumber] ?? 0;
  const slots = data
    ? [
        { key: 'slot1' as const, filled: data.tableData?.slot1 != null, nickname: data.slotUsers.slot1?.nickname ?? null },
        { key: 'slot2' as const, filled: data.tableData?.slot2 != null, nickname: data.slotUsers.slot2?.nickname ?? null },
        { key: 'slot3' as const, filled: data.tableData?.slot3 != null, nickname: data.slotUsers.slot3?.nickname ?? null },
        { key: 'slot4' as const, filled: data.tableData?.slot4 != null, nickname: data.slotUsers.slot4?.nickname ?? null },
      ]
    : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999997,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: 20,
          padding: 24,
          maxWidth: 360,
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', margin: 0 }}>
              TABLE {tableNumber}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#888', margin: '4px 0 0 0' }}>{price} TON</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {data?.tableData != null && (
          <p style={{ fontSize: '0.8rem', color: '#a855f7', marginBottom: 20 }}>
            Cycle #{data.tableData.cycleCount}
          </p>
        )}

        {loading && (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Loading...</p>
        )}
        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>
        )}

        {!loading && !error && data && (
          <>
            <p style={{ color: '#a855f7', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              RECEIVED
            </p>
            <div style={{ marginBottom: 20, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                {data.totalEarned.toFixed(2)} TON
              </p>
              <p style={{ color: '#888', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                {data.payoutCount} payout{(data.payoutCount ?? 0) !== 1 ? 's' : ''} received
              </p>
            </div>

            <p style={{ color: '#a855f7', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              CURRENT SLOTS
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[1, 2, 3, 4].map((i) => {
                const s = slots[i - 1];
                return (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(168,85,247,0.2)',
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <p style={{ fontSize: '0.7rem', color: '#a855f7', margin: '0 0 4px 0' }}>
                      Slot {i} · {SLOT_LABELS[i]}
                    </p>
                    <p style={{ fontSize: '0.9rem', margin: 0, color: s?.filled ? '#22c55e' : '#666' }}>
                      {s?.filled ? s.nickname ?? `#${i}` : 'Empty'}
                    </p>
                  </div>
                );
              })}
            </div>

            <p style={{ color: '#a855f7', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              SLOT HISTORY
            </p>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>
              {data.payoutHistory.length === 0 ? (
                <p style={{ margin: 0 }}>No payouts yet</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {data.payoutHistory.map((p, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>
                      Slot {p.slotNumber} · +{p.amount.toFixed(2)} TON ·{' '}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
