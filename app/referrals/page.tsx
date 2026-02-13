'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Share2 } from 'lucide-react';

const BOT_LINK = 'https://t.me/MatrixTONTON_Bot';

export default function ReferralsPage() {
  const router = useRouter();
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<{
    referralCode: string;
    referrals: { id: number; nickname: string; activeTables: number; createdAt: string }[];
    totalReferrals: number;
    activeReferrals: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('matrix_ton_grayscale');
    const value = saved === 'true' || saved === '1';
    setIsGrayscale(value);
    document.documentElement.style.filter = value ? 'grayscale(100%)' : '';
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.filter = isGrayscale ? 'grayscale(100%)' : '';
  }, [isGrayscale]);

  useEffect(() => {
    const uid = typeof window !== 'undefined' ? localStorage.getItem('matrix_ton_user_id') : null;
    if (!uid) return;
    setUserId(uid);
    fetch(`/api/user/referrals?userId=${encodeURIComponent(uid)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.referralCode !== undefined) setData(d);
      })
      .catch(() => {});
  }, []);

  const referralLink = data?.referralCode ? `${BOT_LINK}?start=${encodeURIComponent(data.referralCode)}` : '';

  const handleCopy = () => {
    if (!referralLink) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralLink).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleShare = () => {
    if (!referralLink) return;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join Matrix TON!')}`;
    const tg = (window as any)?.Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return s;
    }
  };

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
        }}
      >
        {!userId ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : (
          <>
            {/* Section 1 - Your Referral Link */}
            <p
              style={{
                color: '#a855f7',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px',
              }}
            >
              Your Referral Link
            </p>
            <div
              style={{
                background: 'rgba(168,85,247,0.1)',
                border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all',
                  margin: '0 0 12px 0',
                  lineHeight: 1.4,
                }}
              >
                {referralLink || '—'}
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!referralLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: copied ? '#22c55e' : 'rgba(168,85,247,0.3)',
                    border: '1px solid rgba(168,85,247,0.5)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: referralLink ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Copy size={18} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={!referralLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: 'rgba(168,85,247,0.3)',
                    border: '1px solid rgba(168,85,247,0.5)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: referralLink ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>

            {/* Section 2 - Stats */}
            <p
              style={{
                color: '#a855f7',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              Referral Stats
            </p>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ color: '#888888', fontSize: '0.85rem' }}>Total Referrals</span>
                <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{data?.totalReferrals ?? '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ color: '#888888', fontSize: '0.85rem' }}>Active Referrals</span>
                <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{data?.activeReferrals ?? '—'}</span>
              </div>
            </div>

            {/* Section 3 - Referrals List */}
            <p
              style={{
                color: '#a855f7',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              Your Referrals
            </p>
            {!data?.referrals?.length ? (
              <p style={{ color: '#888888', fontSize: '0.9rem', marginTop: '8px' }}>
                No referrals yet. Share your link to invite friends!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {data.referrals.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>{r.nickname}</span>
                      <span style={{ color: '#a855f7', fontSize: '0.85rem' }}>{r.activeTables} active table{r.activeTables !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ color: '#888888', fontSize: '0.8rem' }}>Joined {formatDate(r.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
