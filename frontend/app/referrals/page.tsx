'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function ReferralsPage() {
  const router = useRouter();
  const [isGrayscale, setIsGrayscale] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('matrix_ton_grayscale');
    setIsGrayscale(saved === 'true' || saved === '1');
  }, []);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <button
        type="button"
        onClick={() => router.push('/tables')}
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 99999,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(168,85,247,0.2)',
          border: '1px solid rgba(168,85,247,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={24} style={{ color: '#fff' }} />
      </button>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#000000',
          color: '#ffffff',
          paddingTop: '80px',
          padding: '80px 24px 24px',
          filter: isGrayscale ? 'grayscale(100%)' : undefined,
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Referrals</h1>
        <p style={{ color: '#aaaaaa', fontSize: '0.95rem' }}>Your referral program and stats will appear here.</p>
      </div>
    </div>
  );
}
