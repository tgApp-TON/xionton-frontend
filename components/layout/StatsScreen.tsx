'use client';
import { TrendingUp, Users, Repeat, Wallet, GitBranch } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ReferralTree } from './ReferralTree';

interface StatsScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatsScreen({ isOpen, onClose }: StatsScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTree, setShowTree] = useState(false);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUserData = async () => {
      if (typeof window === 'undefined') return;
      const userId = localStorage.getItem('matrix_ton_user_id');
      if (!userId) return;
      try {
        const res = await fetch(`/api/auth/me?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (data.exists && data.user) {
          setUserNickname(data.user.nickname || null);
          setUserWallet(data.user.tonWallet || null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
    
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
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.strokeStyle = `rgba(150, 150, 150, ${0.2 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const stats = {
    totalEarned: 1456.8,
    activePartners: 47,
    totalCycles: 156,
    pendingPayout: 54.2
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black" style={{ color: '#ffffff' }}>
        <canvas ref={canvasRef} className="absolute inset-0" />

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
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: 0
          }}
        >
          <div style={{ width: '28px', height: '3px', background: 'white', borderRadius: '9999px' }} />
          <div style={{ width: '28px', height: '3px', background: 'white', borderRadius: '9999px' }} />
          <div style={{ width: '28px', height: '3px', background: 'white', borderRadius: '9999px' }} />
        </button>

        <div className="relative z-10 h-full overflow-y-auto">
          <div className="flex items-center justify-center p-6 border-b border-gray-700">
            <h1 className="text-3xl font-bold" style={{ color: '#ffffff' }}>Statistics</h1>
          </div>

          <div className="p-6 space-y-6">
            {(userNickname || userWallet) && (
              <div
                style={{
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '16px',
                }}
              >
                <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 16px 0' }}>Your Account</h3>
                {userNickname && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ color: '#aaaaaa', fontSize: '0.9rem', margin: '0 0 4px 0' }}>Nickname</p>
                    <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{userNickname}</p>
                  </div>
                )}
                {userWallet && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ color: '#aaaaaa', fontSize: '0.9rem', margin: '0 0 4px 0' }}>Wallet</p>
                    <p style={{ color: '#aaaaaa', fontSize: '0.9rem', margin: 0 }}>
                      {userWallet.slice(0, 6)}...{userWallet.slice(-4)}
                    </p>
                  </div>
                )}
                <p style={{ color: '#aaaaaa', fontSize: '0.85rem', margin: '12px 0 0 0' }}>One nickname = one wallet</p>
              </div>
            )}
            <div className="relative overflow-hidden rounded-3xl p-6 border-2"
                 style={{
                   background: 'linear-gradient(135deg, rgba(80, 80, 80, 0.3), rgba(40, 40, 40, 0.3))',
                   borderImage: 'linear-gradient(135deg, rgba(200,200,200,0.8), rgba(150,150,150,0.8), rgba(100,100,100,0.8)) 1',
                   boxShadow: '0 0 40px rgba(150,150,150,0.3), inset 0 0 20px rgba(200,200,200,0.1)'
                 }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm mb-1 font-medium" style={{ color: '#ffffff' }}>Total Earned</p>
                  <p className="text-5xl font-black" style={{ color: '#ffffff' }}>{stats.totalEarned} TON</p>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(150, 150, 150, 0.3)' }}>
                  <TrendingUp className="w-8 h-8" style={{ color: '#e5e5e5' }} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span style={{ color: '#b0b0b0' }}>↑ 12.5%</span>
                <span style={{ color: '#ffffff' }}>vs last week</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl p-5 border"
                   style={{ 
                     background: 'linear-gradient(135deg, rgba(100, 100, 100, 0.2), rgba(60, 60, 60, 0.2))',
                     borderColor: 'rgba(150, 150, 150, 0.3)',
                     boxShadow: '0 0 20px rgba(150,150,150,0.2)' 
                   }}>
                <div className="flex items-center justify-between mb-3">
                  <Users className="w-6 h-6" style={{ color: '#c0c0c0' }} />
                  <span className="text-2xl font-bold" style={{ color: '#ffffff' }}>{stats.activePartners}</span>
                </div>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>Active Partners</p>
              </div>

              <div className="rounded-2xl p-5 border"
                   style={{ 
                     background: 'linear-gradient(135deg, rgba(110, 110, 110, 0.2), rgba(70, 70, 70, 0.2))',
                     borderColor: 'rgba(160, 160, 160, 0.3)',
                     boxShadow: '0 0 20px rgba(160,160,160,0.2)' 
                   }}>
                <div className="flex items-center justify-between mb-3">
                  <Repeat className="w-6 h-6" style={{ color: '#d0d0d0' }} />
                  <span className="text-2xl font-bold" style={{ color: '#ffffff' }}>{stats.totalCycles}</span>
                </div>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>Cycles Closed</p>
              </div>

              <div className="rounded-2xl p-5 border"
                   style={{ 
                     background: 'linear-gradient(135deg, rgba(90, 90, 90, 0.2), rgba(50, 50, 50, 0.2))',
                     borderColor: 'rgba(140, 140, 140, 0.3)',
                     boxShadow: '0 0 20px rgba(140,140,140,0.2)' 
                   }}>
                <div className="flex items-center justify-between mb-3">
                  <Wallet className="w-6 h-6" style={{ color: '#b5b5b5' }} />
                  <span className="text-2xl font-bold" style={{ color: '#ffffff' }}>{stats.pendingPayout}</span>
                </div>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>Pending (TON)</p>
              </div>
            </div>

            <button
              onClick={() => setShowTree(true)}
              className="w-full rounded-2xl p-6 border-2 transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(120, 120, 120, 0.3), rgba(70, 70, 70, 0.3))',
                borderColor: 'rgba(200, 200, 200, 0.5)',
                boxShadow: '0 0 25px rgba(180,180,180,0.3)'
              }}
            >
              <div className="flex items-center justify-center gap-4">
                <GitBranch className="w-8 h-8" style={{ color: '#e5e5e5' }} />
                <div>
                  <div className="text-xl font-bold" style={{ color: '#ffffff' }}>View Referral Tree</div>
                  <div className="text-sm" style={{ color: '#aaa' }}>See your network structure</div>
                </div>
              </div>
            </button>

            <div className="rounded-3xl p-6 border"
                 style={{ 
                   background: 'linear-gradient(135deg, rgba(70, 70, 70, 0.3), rgba(40, 40, 40, 0.3))',
                   borderColor: 'rgba(130, 130, 130, 0.2)',
                   boxShadow: '0 0 30px rgba(130,130,130,0.2)' 
                 }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Tables Status</h2>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <div key={num} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: '#d0d0d0', boxShadow: '0 0 10px rgba(200,200,200,0.5)' }} />
                      <span className="font-semibold" style={{ color: '#ffffff' }}>Table {num}</span>
                    </div>
                    <span className="text-sm" style={{ color: '#ffffff' }}>Active • Cycle #{Math.floor(Math.random() * 20) + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl p-6 border"
                 style={{ 
                   background: 'linear-gradient(135deg, rgba(60, 60, 60, 0.3), rgba(30, 30, 30, 0.3))',
                   borderColor: 'rgba(120, 120, 120, 0.2)',
                   boxShadow: '0 0 30px rgba(120,120,120,0.2)' 
                 }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Recent Activity</h2>
              <div className="space-y-3">
                {['New partner joined Table 2', 'Cycle closed on Table 4', 'Payout received: 18 TON', 'Table 3 activated'].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: '#c5c5c5' }} />
                    <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{activity}</span>
                    <span className="ml-auto text-xs" style={{ color: '#ffffff' }}>{i + 2}m ago</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReferralTree isOpen={showTree} onClose={() => setShowTree(false)} />
    </>
  );
}
