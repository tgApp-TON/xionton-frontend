'use client';
import { useEffect, useRef } from 'react';

interface ReferralTreeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralTree({ isOpen, onClose }: ReferralTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const referralTree = {
    sponsor: {
      nickname: 'CryptoMaster',
      level: 'Your Sponsor'
    },
    you: {
      nickname: 'YOU',
      totalReferrals: 12
    },
    directReferrals: [
      { nickname: 'Alice2024', partners: 3 },
      { nickname: 'BobCrypto', partners: 5 },
      { nickname: 'Charlie99', partners: 0 },
      { nickname: 'DianaW', partners: 2 }
    ],
    level2: [
      { nickname: 'Eve_TON', sponsor: 'Alice2024' },
      { nickname: 'Frank123', sponsor: 'Alice2024' },
      { nickname: 'Grace_X', sponsor: 'Alice2024' },
      { nickname: 'Henry_Z', sponsor: 'BobCrypto' },
      { nickname: 'Ivy_TON', sponsor: 'BobCrypto' },
      { nickname: 'Jack_W', sponsor: 'DianaW' },
      { nickname: 'Kate_M', sponsor: 'DianaW' },
      { nickname: 'Leo_P', sponsor: 'BobCrypto' }
    ]
  };

  return (
    <div 
      className="fixed inset-0" 
      style={{ 
        backgroundColor: '#000000', 
        color: '#ffffff',
        zIndex: 100
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '32px',
          right: '32px',
          width: '48px',
          height: '48px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: 0
        }}
        aria-label="Close"
      >
        <div style={{ width: '28px', height: '3px', background: 'white', borderRadius: '9999px' }} />
        <div style={{ width: '28px', height: '3px', background: 'white', borderRadius: '9999px' }} />
        <div style={{ width: '28px', height: '3px', background: 'white', borderRadius: '9999px' }} />
      </button>

      <div className="relative z-10 h-full overflow-y-auto">
        <div className="flex items-center justify-center p-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold" style={{ color: '#ffffff' }}>Referral Tree</h1>
        </div>

        <div className="p-6 max-w-4xl mx-auto">
          {/* Sponsor */}
          <div className="flex flex-col items-center mb-8">
            <div className="text-xs mb-2" style={{ color: '#999' }}>↑ YOUR SPONSOR</div>
            <div 
              className="px-6 py-3 rounded-xl border-2"
              style={{
                background: 'linear-gradient(135deg, rgba(100, 100, 100, 0.3), rgba(60, 60, 60, 0.3))',
                borderColor: 'rgba(180, 180, 180, 0.5)',
                boxShadow: '0 0 20px rgba(150,150,150,0.3)'
              }}
            >
              <div className="text-lg font-bold" style={{ color: '#fff' }}>{referralTree.sponsor.nickname}</div>
              <div className="text-xs" style={{ color: '#aaa' }}>{referralTree.sponsor.level}</div>
            </div>
            <div style={{ width: '2px', height: '40px', background: 'linear-gradient(to bottom, rgba(200,200,200,0.5), rgba(200,200,200,0.2))' }} />
          </div>

          {/* YOU */}
          <div className="flex flex-col items-center mb-8">
            <div 
              className="px-8 py-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(150, 150, 150, 0.4), rgba(80, 80, 80, 0.4))',
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: '3px',
                borderStyle: 'solid',
                boxShadow: '0 0 30px rgba(200,200,200,0.5), inset 0 0 20px rgba(255,255,255,0.1)'
              }}
            >
              <div className="text-2xl font-black text-center" style={{ color: '#fff' }}>{referralTree.you.nickname}</div>
              <div className="text-sm text-center mt-1" style={{ color: '#ccc' }}>Total Referrals: {referralTree.you.totalReferrals}</div>
            </div>
            <div style={{ width: '2px', height: '40px', background: 'linear-gradient(to bottom, rgba(200,200,200,0.5), rgba(200,200,200,0.2))' }} />
          </div>

          {/* Direct Referrals */}
          <div className="mb-8">
            <div className="text-center text-sm mb-4" style={{ color: '#aaa' }}>↓ DIRECT REFERRALS (Level 1)</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {referralTree.directReferrals.map((ref, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="w-full px-4 py-3 rounded-xl border"
                    style={{
                      background: 'linear-gradient(135deg, rgba(90, 90, 90, 0.3), rgba(50, 50, 50, 0.3))',
                      borderColor: 'rgba(160, 160, 160, 0.4)',
                      boxShadow: '0 0 15px rgba(140,140,140,0.2)'
                    }}
                  >
                    <div className="text-sm font-bold text-center" style={{ color: '#fff' }}>{ref.nickname}</div>
                    <div className="text-xs text-center mt-1" style={{ color: '#888' }}>Partners: {ref.partners}</div>
                  </div>
                  {ref.partners > 0 && (
                    <div style={{ width: '2px', height: '30px', background: 'linear-gradient(to bottom, rgba(180,180,180,0.4), rgba(180,180,180,0.1))' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Level 2 */}
          <div>
            <div className="text-center text-sm mb-4" style={{ color: '#aaa' }}>↓ LEVEL 2 REFERRALS</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {referralTree.level2.map((ref, i) => (
                <div 
                  key={i}
                  className="px-3 py-2 rounded-lg border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(70, 70, 70, 0.25), rgba(40, 40, 40, 0.25))',
                    borderColor: 'rgba(130, 130, 130, 0.3)',
                    boxShadow: '0 0 10px rgba(120,120,120,0.15)'
                  }}
                >
                  <div className="text-xs font-semibold text-center" style={{ color: '#ddd' }}>{ref.nickname}</div>
                  <div className="text-xs text-center mt-1" style={{ color: '#666' }}>via {ref.sponsor}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div 
            className="mt-8 p-6 rounded-2xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(80, 80, 80, 0.3), rgba(40, 40, 40, 0.3))',
              borderColor: 'rgba(150, 150, 150, 0.3)',
              boxShadow: '0 0 25px rgba(140,140,140,0.2)'
            }}
          >
            <h3 className="text-lg font-bold mb-3" style={{ color: '#fff' }}>Structure Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold" style={{ color: '#fff' }}>4</div>
                <div className="text-xs" style={{ color: '#aaa' }}>Level 1</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#fff' }}>8</div>
                <div className="text-xs" style={{ color: '#aaa' }}>Level 2</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#fff' }}>12</div>
                <div className="text-xs" style={{ color: '#aaa' }}>Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
