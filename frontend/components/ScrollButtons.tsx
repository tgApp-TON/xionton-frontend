'use client';

import { useState } from 'react';
import { X, Table, Users, TrendingUp, Settings, Sun, Moon } from 'lucide-react';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export function ScrollButtons() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light-theme');
  };

  return (
    <>
      {/* Theme Button - TOP LEFT */}
      <div style={{ 
        position: 'fixed', 
        top: '24px', 
        left: '24px',
        zIndex: 99999,
        width: '128px',
        height: '128px'
      }}>
        <button
          onClick={toggleTheme}
          style={{
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {isDark ? <Sun size={48} className="text-purple-300" /> : <Moon size={48} className="text-purple-300" />}
        </button>
      </div>

      {/* Menu Button - TOP RIGHT */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '24px', 
          right: '24px', 
          zIndex: 99999,
          width: '128px',
          height: '128px'
        }}
      >
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'rgba(30, 30, 50, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {isMenuOpen ? (
            <X size={48} className="text-purple-300" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: '56px',
                  height: '6px',
                  background: 'rgba(168, 85, 247, 0.9)',
                  borderRadius: '10px'
                }}
              />
              <div 
                style={{ 
                  width: '56px',
                  height: '6px',
                  background: 'rgba(168, 85, 247, 0.9)',
                  borderRadius: '10px'
                }}
              />
              <div 
                style={{ 
                  width: '56px',
                  height: '6px',
                  background: 'rgba(168, 85, 247, 0.9)',
                  borderRadius: '10px'
                }}
              />
            </div>
          )}
        </button>
      </div>

      {/* Side Menu Panel */}
      {isMenuOpen && (
        <>
          <div 
            style={{ 
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 99998
            }}
          />
          <div 
            style={{ 
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100%',
              width: '100%',
              zIndex: 99999,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              overflowY: 'auto',
              color: '#ffffff',
              paddingTop: '120px',
              lineHeight: '1.8'
            }}
            className="p-12 menu-text"
          >
            <AnimatedBackground />
            <div className="flex flex-col h-full relative z-10">
              {/* Header */}
              <div className="relative mb-20">
                <div>
                  <p className="text-purple-300" style={{ fontSize: '4.5rem' }}>@CryptoKing</p>
                </div>
                
                {/* Close button - matches menu button style exactly */}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    width: '128px',
                    height: '128px',
                    borderRadius: '50%',
                    background: 'rgba(139, 92, 246, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    zIndex: 100000
                  }}
                >
                  <X size={48} className="text-purple-300" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="flex flex-col gap-12 mb-20">
                <div className="p-10 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 min-h-[200px]">
                  <div className="flex items-center justify-between">
                    <div className="text-white" style={{ fontSize: '3.75rem' }}>Total Earned</div>
                    <div className="text-white font-bold" style={{ fontSize: '6rem' }}>156.8 TON</div>
                  </div>
                </div>
                
                <div className="p-10 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 min-h-[200px]">
                  <div className="flex items-center justify-between">
                    <div className="text-white" style={{ fontSize: '3.75rem' }}>Active Tables</div>
                    <div className="text-white font-bold" style={{ fontSize: '6rem' }}>6/12</div>
                  </div>
                </div>
                
                <div className="p-10 rounded-2xl bg-gradient-to-br from-pink-600/20 to-red-600/20 min-h-[200px]">
                  <div className="flex items-center justify-between">
                    <div className="text-white" style={{ fontSize: '3.75rem' }}>Referrals</div>
                    <div className="text-white font-bold" style={{ fontSize: '6rem' }}>47</div>
                  </div>
                </div>
                
                <div className="p-10 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 min-h-[200px]">
                  <div className="flex items-center justify-between">
                    <div className="text-white" style={{ fontSize: '3.75rem' }}>Total Cycles</div>
                    <div className="text-white font-bold" style={{ fontSize: '6rem' }}>46</div>
                  </div>
                </div>
              </div>

              {/* Referral Tree */}
              <div className="flex-1 overflow-y-auto" style={{ marginTop: '80px' }}>
                <h3 className="font-bold text-white mb-4" style={{ fontSize: '6rem' }}>My Referral Tree</h3>
                
                {/* Upline (who referred you) */}
                <div className="mb-16">
                  <div className="text-purple-300 mb-2" style={{ fontSize: '2.25rem' }}>↑ Referred by</div>
                  <div className="p-10 rounded-xl bg-purple-600/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white" style={{ fontSize: '6rem' }}>@DiamondMaster</div>
                        <div className="text-gray-400" style={{ fontSize: '3.75rem' }}>12 tables • 156 referrals</div>
                      </div>
                      <div className="text-purple-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Your direct referrals */}
                <div>
                  <div className="text-cyan-300 mb-10" style={{ fontSize: '2.25rem' }}>↓ My Direct Referrals (47)</div>
                  <div className="space-y-8">
                    {/* Referral 1 */}
                    <div className="p-10 rounded-xl bg-cyan-600/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white" style={{ fontSize: '6rem' }}>@Alice</div>
                          <div className="text-gray-400" style={{ fontSize: '3.75rem' }}>6 tables • 23 referrals</div>
                        </div>
                        <div className="text-green-400" style={{ fontSize: '3.75rem' }}>Active</div>
                      </div>
                    </div>

                    {/* Referral 2 */}
                    <div className="p-10 rounded-xl bg-cyan-600/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white" style={{ fontSize: '6rem' }}>@Bob</div>
                          <div className="text-gray-400" style={{ fontSize: '3.75rem' }}>3 tables • 12 referrals</div>
                        </div>
                        <div className="text-green-400" style={{ fontSize: '3.75rem' }}>Active</div>
                      </div>
                    </div>

                    {/* Referral 3 */}
                    <div className="p-10 rounded-xl bg-cyan-600/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white" style={{ fontSize: '6rem' }}>@Charlie</div>
                          <div className="text-gray-400" style={{ fontSize: '3.75rem' }}>8 tables • 34 referrals</div>
                        </div>
                        <div className="text-green-400" style={{ fontSize: '3.75rem' }}>Active</div>
                      </div>
                    </div>

                    {/* More indicator */}
                    <div className="p-10 rounded-xl bg-white/5 text-center">
                      <div className="text-gray-400" style={{ fontSize: '3.75rem' }}>+ 44 more referrals</div>
                      <a href="/referrals" className="text-purple-400 hover:underline" style={{ fontSize: '2.25rem' }}>View All</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
