'use client';
import { useState } from 'react';
import { TableCard } from '@/components/tables/TableCard';
import { ScrollButtons } from '@/components/layout/ScrollButtons';
import { StatsScreen } from '@/components/layout/StatsScreen';
import { RegistrationScreen } from '@/components/layout/RegistrationScreen';
import { useTelegram } from '@/components/providers/TelegramProvider';

export default function TablesPage() {
  const { user, isReady } = useTelegram();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // ДЛЯ ТЕСТА: всегда показываем регистрацию если не зарегистрирован
  if (!isRegistered) {
    return <RegistrationScreen onComplete={() => setIsRegistered(true)} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050519]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <ScrollButtons isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <StatsScreen isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="relative container mx-auto px-4 py-8">
        <div className="text-center mb-12 pt-16">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Matrix TON
          </h1>
          <p className="text-gray-400 text-lg">12 Tables • Automatic Matrix System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-20">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <TableCard key={num} tableNumber={num} />
          ))}
        </div>
      </div>
    </div>
  );
}
