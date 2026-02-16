'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ReferralTree } from '@/components/referrals/ReferralTree';

export default function ReferralTreePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uid = localStorage.getItem('matrix_ton_user_id');
    if (!uid) {
      router.replace('/register');
      return;
    }
    setUserId(uid);
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#000000' }}>
      <button
        type="button"
        onClick={() => router.push('/referrals')}
        style={{
          position: 'fixed',
          top: 'calc(52px + env(safe-area-inset-top, 0px))',
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
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#a855f7',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.1em',
            fontSize: '1.25rem',
            marginBottom: '24px',
          }}
        >
          Referral Tree
        </h1>
        {!userId ? (
          <p style={{ color: '#888', textAlign: 'center' }}>Loading...</p>
        ) : (
          <ReferralTree userId={userId} />
        )}
      </div>
    </div>
  );
}
