'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Ошибка загрузки статистики</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-white/70 hover:text-white mb-4"
        >
          ← Назад
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">📊 Статистика</h1>
        <p className="text-white/70">{stats.user.nickname}</p>
        <p className="text-white/50 text-sm">
          Регистрация: {new Date(stats.user.registeredAt).toLocaleDateString('ru-RU')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* За всё время */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">💎 За всё время</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-4 border border-red-500/30">
              <div className="text-red-300 text-sm mb-1">Потрачено</div>
              <div className="text-2xl font-bold text-white">
                {stats.allTime.invested.toFixed(2)} <span className="text-lg">TON</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
              <div className="text-green-300 text-sm mb-1">Заработано</div>
              <div className="text-2xl font-bold text-white">
                {stats.allTime.earned.toFixed(2)} <span className="text-lg">TON</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
              <div className="text-blue-300 text-sm mb-1">Рефералов</div>
              <div className="text-2xl font-bold text-white">{stats.allTime.referrals}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
              <div className="text-purple-300 text-sm mb-1">Столов</div>
              <div className="text-2xl font-bold text-white">
                {stats.allTime.activeTables}/12
              </div>
            </div>
          </div>

          {/* Прибыль */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-white/70 text-sm mb-2">Чистая прибыль</div>
            <div className={`text-3xl font-bold ${
              stats.allTime.earned - stats.allTime.invested >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {(stats.allTime.earned - stats.allTime.invested >= 0 ? '+' : '')}
              {(stats.allTime.earned - stats.allTime.invested).toFixed(2)} TON
            </div>
          </div>
        </div>

        {/* За 30 дней */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">📅 За последние 30 дней</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Потрачено</span>
                <span className="text-xl font-bold text-white">
                  {stats.last30Days.invested.toFixed(2)} TON
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(100, (stats.last30Days.invested / Math.max(stats.allTime.invested, 1)) * 100)}%` 
                  }}
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Заработано</span>
                <span className="text-xl font-bold text-white">
                  {stats.last30Days.earned.toFixed(2)} TON
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(100, (stats.last30Days.earned / Math.max(stats.allTime.earned, 1)) * 100)}%` 
                  }}
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Новых рефералов</span>
                <span className="text-xl font-bold text-white">
                  {stats.last30Days.referrals}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(100, (stats.last30Days.referrals / Math.max(stats.allTime.referrals, 1)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Прибыль за 30 дней */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-white/70 text-sm mb-2">Чистая прибыль за месяц</div>
            <div className={`text-2xl font-bold ${
              stats.last30Days.earned - stats.last30Days.invested >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {(stats.last30Days.earned - stats.last30Days.invested >= 0 ? '+' : '')}
              {(stats.last30Days.earned - stats.last30Days.invested).toFixed(2)} TON
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
