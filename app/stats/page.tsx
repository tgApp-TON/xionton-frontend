'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0a0a', minHeight: '100vh', position: 'relative', zIndex: 9999 }}
      >
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0a0a', minHeight: '100vh', position: 'relative', zIndex: 9999 }}
      >
        <div className="text-white text-lg">Ошибка загрузки статистики</div>
      </div>
    );
  }

  const allTimeProfit = stats.allTime.earned - stats.allTime.invested;
  const last30Profit = stats.last30Days.earned - stats.last30Days.invested;

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ background: '#0a0a0a', minHeight: '100vh', position: 'relative', zIndex: 9999 }}
    >
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center gap-2 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </button>

        <h1 className="text-2xl font-bold text-white mb-1">Статистика</h1>
        <p className="text-white/80 text-sm">{stats.user.nickname}</p>
        <p className="text-white/50 text-xs mb-6">
          Регистрация: {new Date(stats.user.registeredAt).toLocaleDateString('ru-RU')}
        </p>

        {/* За всё время */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
          <h2 className="text-lg font-semibold text-white mb-3">За всё время</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
              <div className="text-white/60 text-xs mb-0.5">Потрачено</div>
              <div className="text-white font-semibold text-base">
                {stats.allTime.invested.toFixed(2)} <span className="text-white/80 text-sm">TON</span>
              </div>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
              <div className="text-white/60 text-xs mb-0.5">Заработано</div>
              <div className="text-white font-semibold text-base">
                {stats.allTime.earned.toFixed(2)} <span className="text-white/80 text-sm">TON</span>
              </div>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
              <div className="text-white/60 text-xs mb-0.5">Рефералов</div>
              <div className="text-white font-semibold text-base">{stats.allTime.referrals}</div>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
              <div className="text-white/60 text-xs mb-0.5">Столов</div>
              <div className="text-white font-semibold text-base">{stats.allTime.activeTables}/12</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="text-white/60 text-xs mb-0.5">Чистая прибыль</div>
            <div
              className={`text-xl font-bold ${allTimeProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {(allTimeProfit >= 0 ? '+' : '') + allTimeProfit.toFixed(2)} TON
            </div>
          </div>
        </div>

        {/* За 30 дней */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-3">За последние 30 дней</h2>
          <div className="space-y-2">
            <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Потрачено</span>
                <span className="text-white font-semibold">{stats.last30Days.invested.toFixed(2)} TON</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500/80 rounded-full"
                  style={{
                    width: `${Math.min(100, (stats.last30Days.invested / Math.max(stats.allTime.invested, 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Заработано</span>
                <span className="text-white font-semibold">{stats.last30Days.earned.toFixed(2)} TON</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500/80 rounded-full"
                  style={{
                    width: `${Math.min(100, (stats.last30Days.earned / Math.max(stats.allTime.earned, 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Новых рефералов</span>
                <span className="text-white font-semibold">{stats.last30Days.referrals}</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500/80 rounded-full"
                  style={{
                    width: `${Math.min(100, (stats.last30Days.referrals / Math.max(stats.allTime.referrals, 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="text-white/60 text-xs mb-0.5">Чистая прибыль за месяц</div>
            <div
              className={`text-lg font-bold ${last30Profit >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {(last30Profit >= 0 ? '+' : '') + last30Profit.toFixed(2)} TON
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
