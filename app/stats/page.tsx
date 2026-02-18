'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface StatsData {
  user: {
    nickname: string;
    registeredAt: string;
  };
  allTime: {
    invested: number;
    earned: number;
    referrals: number;
    activeTables: number;
  };
  last30Days: {
    invested: number;
    earned: number;
    referrals: number;
  };
}

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const userId = localStorage.getItem('matrix_ton_user_id');
        if (!userId) {
          router.push('/register');
          return;
        }

        const response = await fetch(`/api/stats?userId=${userId}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [router]);

  const allTimeProfit = stats ? stats.allTime.earned - stats.allTime.invested : 0;
  const last30Profit = stats ? stats.last30Days.earned - stats.last30Days.invested : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        overflowY: 'auto',
        color: '#ffffff',
      }}
    >
      <button
        type="button"
        onClick={() => router.back()}
        style={{
          position: 'fixed',
          top: 'calc(52px + env(safe-area-inset-top, 0px))',
          right: '16px',
          zIndex: 100001,
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

      <div
        style={{
          position: 'relative',
          zIndex: 100000,
          padding: 'calc(80px + env(safe-area-inset-top, 0px)) 24px 24px',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p style={{ color: '#ffffff', fontSize: '1rem' }}>Загрузка...</p>
          </div>
        ) : !stats ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p style={{ color: '#ffffff', fontSize: '1rem' }}>Ошибка загрузки статистики</p>
          </div>
        ) : (
          <>
            <h1 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
              Статистика
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', marginBottom: '2px' }}>
              {stats.user.nickname}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '24px' }}>
              Регистрация: {new Date(stats.user.registeredAt).toLocaleDateString('ru-RU')}
            </p>

            {/* За всё время */}
            <div style={{ marginBottom: '24px' }}>
              <p
                style={{
                  color: '#a855f7',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '8px',
                }}
              >
                За всё время
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginBottom: '4px' }}>
                    Потрачено
                  </div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>
                    {stats.allTime.invested.toFixed(2)} <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>TON</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginBottom: '4px' }}>
                    Заработано
                  </div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>
                    {stats.allTime.earned.toFixed(2)} <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>TON</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginBottom: '4px' }}>
                    Рефералов
                  </div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{stats.allTime.referrals}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginBottom: '4px' }}>
                    Столов
                  </div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{stats.allTime.activeTables}/12</div>
                </div>
              </div>
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginBottom: '4px' }}>
                  Чистая прибыль
                </div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: allTimeProfit >= 0 ? '#4ade80' : '#f87171',
                  }}
                >
                  {(allTimeProfit >= 0 ? '+' : '') + allTimeProfit.toFixed(2)} TON
                </div>
              </div>
            </div>

            {/* За 30 дней */}
            <div>
              <p
                style={{
                  color: '#a855f7',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '8px',
                }}
              >
                За последние 30 дней
              </p>
              <div className="space-y-2">
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>Потрачено</span>
                    <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{stats.last30Days.invested.toFixed(2)} TON</span>
                  </div>
                  <div style={{ marginTop: '6px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: 'rgba(248,113,113,0.8)',
                        borderRadius: '9999px',
                        width: `${Math.min(100, (stats.last30Days.invested / Math.max(stats.allTime.invested, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>Заработано</span>
                    <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{stats.last30Days.earned.toFixed(2)} TON</span>
                  </div>
                  <div style={{ marginTop: '6px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: 'rgba(74,222,128,0.8)',
                        borderRadius: '9999px',
                        width: `${Math.min(100, (stats.last30Days.earned / Math.max(stats.allTime.earned, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>Новых рефералов</span>
                    <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{stats.last30Days.referrals}</span>
                  </div>
                  <div style={{ marginTop: '6px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: 'rgba(96,165,250,0.8)',
                        borderRadius: '9999px',
                        width: `${Math.min(100, (stats.last30Days.referrals / Math.max(stats.allTime.referrals, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginBottom: '4px' }}>
                  Чистая прибыль за месяц
                </div>
                <div
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: last30Profit >= 0 ? '#4ade80' : '#f87171',
                  }}
                >
                  {(last30Profit >= 0 ? '+' : '') + last30Profit.toFixed(2)} TON
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
