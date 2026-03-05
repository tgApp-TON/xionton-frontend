'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { useTelegram } from '@/components/providers/TelegramProvider';

export function RegisterClient() {
  const router = useRouter();
  const { user, webApp, isReady } = useTelegram();
  const tonAddress = useTonAddress();
  const containerStyle: React.CSSProperties = {
    maxWidth: '420px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    background: '#000000',
    borderRadius: '1.5rem',
    zIndex: 10,
    position: 'relative',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    margin: '0 auto',
    display: 'block',
    boxSizing: 'border-box',
    padding: '14px',
    background: '#a855f7',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#cccccc',
    margin: 0,
  };

  const spinnerStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '9999px',
    border: '4px solid rgba(255,255,255,0.15)',
    borderTopColor: '#a855f7',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  };

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState(() => 'user_' + Math.floor(100000 + Math.random() * 900000));
  const [walletCheckDone, setWalletCheckDone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('matrix_ton_grayscale');
    const grayscale = saved === 'true' || saved === '1';
    document.documentElement.style.filter = grayscale ? 'grayscale(100%)' : '';
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let refCode: string | null = null;
    const tg = (window as any)?.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.start_param) refCode = tg.initDataUnsafe.start_param;
    if (!refCode && typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        refCode = params.get('tgWebAppStartParam') || params.get('start_param') || null;
      }
    }
    if (!refCode && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      refCode = params.get('ref') || null;
    }
    if (refCode) localStorage.setItem('matrix_ton_referral_code', refCode);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('matrix_ton_user_id')) {
      router.replace('/tables');
      return;
    }
    if (!isReady) return;
    const tg: any = (window as any)?.Telegram?.WebApp;
    // Try to get telegramId from URL hash (mobile Telegram passes it there)
    let telegramId = tg?.initDataUnsafe?.user?.id;
    if (!telegramId && typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/%22id%22%3A(\d+)/);
      if (match) {
        telegramId = parseInt(match[1], 10);
      }
    }
    if (!telegramId) return;
    fetch(`/api/auth/me?telegramId=${telegramId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.exists && data.user?.id) {
          localStorage.setItem('matrix_ton_user_id', String(data.user.id));
          router.replace('/tables');
        }
      })
      .catch(() => {});
  }, [router, isReady]);

  // After wallet connect: check user by wallet → auth or show nickname form
  useEffect(() => {
    if (step !== 2 || !tonAddress || walletCheckDone) return;

    let cancelled = false;
    setRegistering(true);
    setError(null);

    const checkByWallet = async () => {
      let effectiveTelegramId: string = user?.id != null ? String(user.id) : String(Date.now());
      let effectiveTelegramUsername: string | undefined = user?.username;
      const tgWebApp = typeof window !== 'undefined' ? (window as any)?.Telegram?.WebApp : null;
      const tgUser = tgWebApp?.initDataUnsafe?.user;
      if (tgUser) {
        if (tgUser.id) effectiveTelegramId = String(tgUser.id);
        if (tgUser.username) effectiveTelegramUsername = tgUser.username;
      }
      if (webApp?.initData) {
        try {
          const initRes = await fetch('/api/auth/telegram-init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: webApp.initData }),
          });
          const initData = await initRes.json();
          if (initData.valid === true && initData.user) {
            effectiveTelegramId = String(initData.user.id);
            effectiveTelegramUsername = initData.user.username;
          }
        } catch {
          // keep
        }
      }

      const referralCodeToSend =
        (typeof window !== 'undefined' ? localStorage.getItem('matrix_ton_referral_code') : null) || 'MASTER';

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramId: effectiveTelegramId,
            telegramUsername: effectiveTelegramUsername || undefined,
            isPremium: true,
            tonWallet: tonAddress,
            referralCode: referralCodeToSend,
          }),
        });
        const data = await res.json();

        if (cancelled) return;

        if (data?.success && (data.userId != null || data.user?.id != null)) {
          localStorage.setItem('matrix_ton_user_id', String(data.userId ?? data.user.id));
          router.replace('/tables');
          return;
        }

        if (res.status === 400 && data?.requiresNickname === true) {
          setWalletCheckDone(true);
          setStep(3);
          return;
        }

        setError(data?.error || 'Something went wrong');
      } catch {
        if (!cancelled) setError('Connection failed');
      } finally {
        if (!cancelled) setRegistering(false);
      }
    };

    checkByWallet();
    return () => {
      cancelled = true;
    };
  }, [step, tonAddress, walletCheckDone, router, user, webApp?.initData]);

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);

    let effectiveTelegramId: string = user?.id != null ? String(user.id) : String(Date.now());
    let effectiveTelegramUsername: string | undefined = user?.username;

    const tgWebApp = typeof window !== 'undefined' ? (window as any)?.Telegram?.WebApp : null;
    const tgUser = tgWebApp?.initDataUnsafe?.user;

    if (tgUser) {
      if (tgUser.id) effectiveTelegramId = String(tgUser.id);
      if (tgUser.username) effectiveTelegramUsername = tgUser.username;
    }

    if (webApp?.initData) {
      try {
        const initRes = await fetch('/api/auth/telegram-init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: webApp.initData }),
        });
        const initData = await initRes.json();
        if (initData.valid === true && initData.user) {
          effectiveTelegramId = String(initData.user.id);
          effectiveTelegramUsername = initData.user.username;
        }
      } catch {
        // keep effectiveTelegramId / effectiveTelegramUsername from initial values
      }
    }

    const walletToSend = tonAddress || '';
    const referralCodeToSend =
      (typeof window !== 'undefined' ? localStorage.getItem('matrix_ton_referral_code') : null) || 'MASTER';

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: effectiveTelegramId,
          telegramUsername: effectiveTelegramUsername || undefined,
          isPremium: true,
          nickname,
          tonWallet: walletToSend,
          referralCode: referralCodeToSend,
        }),
      });

      const data = await res.json();
      if (data?.success && (data.userId != null || data.user?.id != null)) {
        localStorage.setItem('matrix_ton_user_id', String(data.userId ?? data.user.id));
        router.replace('/tables');
        return;
      }

      const isDuplicateWallet =
        res.status === 409 ||
        (data?.error && /duplicate key|unique constraint|duplicate/i.test(String(data.error)));
      if (isDuplicateWallet) {
        const meRes = await fetch(`/api/auth/me?telegramId=${encodeURIComponent(effectiveTelegramId)}`);
        const meData = await meRes.json();
        if (meData?.user?.id) {
          localStorage.setItem('matrix_ton_user_id', String(meData.user.id));
        }
        router.replace('/tables');
        return;
      }

      setError(data?.error || 'Registration failed');
    } catch {
      setError('Registration failed');
    } finally {
      setRegistering(false);
    }
  };


  return (
    <div
      className="min-h-screen"
      style={{
        background: '#000000',
        minHeight: '100vh',
        zIndex: 10,
        position: 'relative',
        padding: '48px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {step === 1 && (
        <div
          style={{
            minHeight: '100vh',
            width: '100%',
            background: '#000000',
            zIndex: 10,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '24px 16px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              lineHeight: 1,
              filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))',
              textAlign: 'center',
            }}
          >
            💎
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: 700, margin: 0, textAlign: 'center' }}>
            XionTon
          </h1>
          <p style={{ color: '#cccccc', fontSize: '1rem', margin: 0, textAlign: 'center' }}>
            Receive on TON blockchain
          </p>
          <div
            style={{
              background: '#000000',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '20px',
              maxWidth: '320px',
              width: '100%',
              margin: '20px auto',
              boxSizing: 'border-box',
              zIndex: 10,
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                }}
              >
                🔄
              </div>
              <div>
                <p style={{ color: '#ffffff', fontWeight: 600, margin: 0, fontSize: '1rem' }}>12 Tables</p>
                <p style={{ color: '#aaaaaa', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Progressive ×2 pricing</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                }}
              >
                💰
              </div>
              <div>
                <p style={{ color: '#ffffff', fontWeight: 600, margin: 0, fontSize: '1rem' }}>Decentralized Matrix</p>
                <p style={{ color: '#aaaaaa', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Per cycle distribution</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                }}
              >
                ⚡
              </div>
              <div>
                <p style={{ color: '#ffffff', fontWeight: 600, margin: 0, fontSize: '1rem' }}>Auto Payouts</p>
                <p style={{ color: '#aaaaaa', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Every 10 minutes</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setStep(2)}
            style={{
              width: '100%',
              maxWidth: '320px',
              margin: '0 auto',
              display: 'block',
              padding: '16px',
              borderRadius: '12px',
              background: '#a855f7',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            Get Started →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Connect Wallet</h2>
            <p style={{ color: '#cccccc', margin: '10px 0 0 0' }}>TON wallet required to participate</p>
          </div>

          {!tonAddress ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <TonConnectButton />
            </div>
          ) : registering ? (
            <div style={{ textAlign: 'center' }}>
              <div style={spinnerStyle} />
              <p style={{ color: '#cccccc', marginTop: '14px', marginBottom: 0 }}>Checking account...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#ff6b6b', marginBottom: '12px' }}>{error}</p>
              <button
                onClick={() => { setError(null); setWalletCheckDone(false); }}
                style={{ ...buttonStyle }}
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
      )}

      {step === 3 && (
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Choose nickname</h2>
            <p style={{ color: '#cccccc', margin: '10px 0 0 0' }}>One nickname = one wallet</p>
          </div>

          <div
            style={{
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <label style={{ color: '#aaaaaa', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.trim() || e.target.value)}
              placeholder="user_123456"
              disabled={registering}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: '#111',
                color: '#fff',
                fontSize: '1rem',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#ff6b6b', marginBottom: '12px', textAlign: 'center' }}>{error}</p>
          )}

          <button
            onClick={() => { setError(null); handleRegister(); }}
            disabled={registering}
            style={{ ...buttonStyle, opacity: registering ? 0.7 : 1 }}
          >
            {registering ? 'Registering...' : 'Create account'}
          </button>
        </div>
      )}
    </div>
  );
}
