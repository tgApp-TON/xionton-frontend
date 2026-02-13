'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Share2 } from 'lucide-react';

const BOT_LINK = 'https://t.me/MatrixTONTON_Bot';

type FilterTab = 'all' | 'workers' | 'loosers';

type ReferralItem = {
  id: number;
  nickname: string;
  activeTables: number;
  referralsCount: number;
  totalEarned: number;
  createdAt: string;
};

export default function ReferralsPage() {
  const router = useRouter();
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<{
    referralCode: string;
    sponsor: { nickname: string; activeTables: number; referralsCount: number } | null;
    referrals: ReferralItem[];
    totalReferrals: number;
    workers: number;
    loosers: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

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

  const filteredReferrals = useMemo(() => {
    if (!data?.referrals) return [];
    if (activeFilter === 'workers') return data.referrals.filter((r) => r.activeTables >= 1);
    if (activeFilter === 'loosers') return data.referrals.filter((r) => r.activeTables === 0);
    return data.referrals;
  }, [data?.referrals, activeFilter]);

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

  const sectionHeader = {
    color: '#a855f7',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: '8px',
  };

  const statBox = (label: string, value: number | string, valueColor: string) => (
    <div
      key={label}
      style={{
        flex: 1,
        minWidth: 0,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px',
        textAlign: 'center',
      }}
    >
      <div style={{ color: valueColor, fontWeight: 700, fontSize: '1.25rem', marginBottom: '4px' }}>{value}</div>
      <div style={{ color: '#888888', fontSize: '0.8rem' }}>{label}</div>
    </div>
  );

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
            {/* Section 0 - Your Sponsor */}
            {data?.sponsor != null && (
              <>
                <p style={{ ...sectionHeader, marginTop: 0 }}>Your Sponsor</p>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>
                    {data.sponsor.nickname}
                  </div>
                  <div style={{ color: '#888888', fontSize: '0.85rem' }}>Active Tables: {data.sponsor.activeTables}</div>
                  <div style={{ color: '#888888', fontSize: '0.85rem' }}>Referrals: {data.sponsor.referralsCount}</div>
                </div>
              </>
            )}

            {/* Section 1 - Your Referral Link */}
            <p style={{ ...sectionHeader }}>Your Referral Link</p>
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

            {/* Section 2 - Referral Stats (3 boxes) */}
            <p style={{ ...sectionHeader, marginTop: '24px' }}>Referral Stats</p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {statBox('Total', data?.totalReferrals ?? '—', '#ffffff')}
              {statBox('Workers', data?.workers ?? '—', '#22c55e')}
              {statBox('Loosers', data?.loosers ?? '—', '#ef4444')}
            </div>

            {/* Section 3 - Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {(['all', 'workers', 'loosers'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(168,85,247,0.4)',
                    background: activeFilter === tab ? 'rgba(168,85,247,0.4)' : 'transparent',
                    color: activeFilter === tab ? '#ffffff' : '#888888',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tab === 'all' ? 'All' : tab === 'workers' ? 'Workers' : 'Loosers'}
                </button>
              ))}
            </div>

            {/* Section 4 - Referrals list (filtered) */}
            <p style={{ ...sectionHeader, marginTop: '24px' }}>Your Referrals</p>
            {filteredReferrals.length === 0 ? (
              <p style={{ color: '#888888', fontSize: '0.9rem', marginTop: '8px' }}>
                {activeFilter === 'workers' && 'No workers yet.'}
                {activeFilter === 'loosers' && 'No loosers.'}
                {activeFilter === 'all' && 'No referrals yet. Share your link to invite friends!'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {filteredReferrals.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>{r.nickname}</span>
                      <span style={{ color: '#888888', fontSize: '0.8rem' }}>{formatDate(r.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
                      <span style={{ color: r.activeTables > 0 ? '#22c55e' : '#ef4444', fontSize: '0.85rem' }}>
                        Tables: {r.activeTables}
                      </span>
                      <span style={{ color: '#888888', fontSize: '0.85rem' }}>Refs: {r.referralsCount}</span>
                    </div>
                    <div style={{ color: '#a855f7', fontSize: '0.9rem', fontWeight: 600 }}>
                      Earned: {Number(r.totalEarned).toFixed(2)} TON
                    </div>
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
