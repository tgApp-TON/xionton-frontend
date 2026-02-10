'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export function ScrollButtons() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userTables, setUserTables] = useState<any[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('matrix_ton_user_id') || '1';
    
    // Fetch tables
    fetch(`/api/user/tables?userId=${userId}`)
      .then(r => r.json())
      .then(data => { if (data.success) setUserTables(data.tables); });
  }, []);

  const activeTables = userTables.filter(t => t.status === 'ACTIVE').length;
  const totalCycles = userTables.reduce((sum, t) => sum + (t.cycleNumber || 0), 0);

  return (
    <>
      {/* Menu Button - TOP RIGHT */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 99999, width: '128px', height: '128px' }}>
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
            <X size={48} className="text-purple-300" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '56px', height: '6px', background: 'rgba(168, 85, 247, 0.9)', borderRadius: '10px' }} />
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
          }} className="p-12 menu-text">
            <AnimatedBackground />
            <div className="flex flex-col h-full relative z-10">
              {/* Close button */}
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  position: 'fixed', top: '24px', right: '24px',
                  width: '128px', height: '128px', borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.2)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 100000
                }}
              >
                <X size={48} className="text-purple-300" />
              </button>

              {/* Stats Grid */}
              <div className="flex flex-col gap-12 mb-20" style={{ marginTop: '60px' }}>
                <div className="p-10 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 min-h-[200px]">
                  <div className="flex items-center justify-between">
                    <div className="text-white" style={{ fontSize: '3.75rem' }}>Active Tables</div>
                    <div className="text-white font-bold" style={{ fontSize: '6rem' }}>{activeTables}/12</div>
                  </div>
                </div>

                <div className="p-10 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 min-h-[200px]">
                  <div className="flex items-center justify-between">
                    <div className="text-white" style={{ fontSize: '3.75rem' }}>Total Cycles</div>
                    <div className="text-white font-bold" style={{ fontSize: '6rem' }}>{totalCycles}</div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex flex-col gap-8">
                {[
                  { label: 'Tables', href: '/tables' },
                  { label: 'Referrals', href: '/referrals' },
                ].map(item => (
                  <a key={item.href} href={item.href}
                    className="p-10 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                    style={{ fontSize: '4.5rem', color: 'white', textDecoration: 'none' }}
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
