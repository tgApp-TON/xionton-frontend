'use client';

import { useState, useEffect } from 'react';
import { X, Sun, Moon } from 'lucide-react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export function ScrollButtons() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [userTables, setUserTables] = useState<any[]>([]);
  const tonAddress = useTonAddress();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light-theme');
  };

  useEffect(() => {
    const userId = localStorage.getItem('matrix_ton_user_id') || '1';
    fetch(`/api/user/tables?userId=${userId}`)
      .then(r => r.json())
      .then(data => { if (data.success) setUserTables(data.tables); });
  }, []);

  const activeTables = userTables.filter(t => t.status === 'ACTIVE').length;
  const totalCycles = userTables.reduce((sum, t) => sum + (t.cycleNumber || 0), 0);

  return (
    <>
      {/* Theme Button - TOP LEFT */}
      <div style={{ position: 'fixed', top: '12px', left: '12px', zIndex: 99999, width: '56px', height: '56px' }}>
        <button
          onClick={toggleTheme}
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.2)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.3s'
          }}
        >
          {isDark ? <Sun size={24} className="text-purple-300" /> : <Moon size={24} className="text-purple-300" />}
        </button>
      </div>

      {/* Menu Button - TOP RIGHT */}
      <div style={{ position: 'fixed', top: '12px', right: '12px', zIndex: 99999, width: '56px', height: '56px' }}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: 'rgba(30, 30, 50, 0.3)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.3s'
          }}
        >
          {isMenuOpen ? (
            <X size={24} className="text-purple-300" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '28px', height: '3px', background: 'rgba(168, 85, 247, 0.9)', borderRadius: '10px' }} />
              ))}
            </div>
          )}
        </button>
      </div>

      {/* Side Menu Panel */}
      {isMenuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 99998 }} onClick={() => setIsMenuOpen(false)} />
          <div style={{
            position: 'fixed', top: 0, right: 0, height: '100%', width: '100%',
            zIndex: 99999, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            overflowY: 'auto', color: '#ffffff', paddingTop: '120px', lineHeight: '1.8'
          }} className="p-6 menu-text">
            <AnimatedBackground />
            <div className="flex flex-col h-full relative z-10" style={{ paddingTop: '80px' }}>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  position: 'fixed', top: '12px', right: '12px',
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.2)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 100000
                }}
              >
                <X size={24} className="text-purple-300" />
              </button>

              {/* Stats */}
              <div className="flex flex-col mb-8">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', color: 'white', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>Active Tables</span>
                  <span>{activeTables}/12</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', color: 'white', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>Total Cycles</span>
                  <span>{totalCycles}</span>
                </div>
              </div>

              {/* Wallet: always show TonConnectButton (connect / switch / disconnect via TonConnect UI) */}
              <div className="flex flex-col mb-8">
                <div style={{ fontSize: '1.2rem', color: 'white', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  Wallet
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                  {tonAddress && (
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>
                      {tonAddress.slice(0, 6)}...{tonAddress.slice(-4)}
                    </span>
                  )}
                  <TonConnectButton />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Tables', href: '/tables' },
                  { label: 'Referrals', href: '/referrals' },
                ].map(item => (
                  <a key={item.href} href={item.href}
                    className="p-5 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                    style={{ fontSize: '1.2rem', color: 'white', textDecoration: 'none' }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
