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
  const [registerAttempt, setRegisterAttempt] = useState(0);
  const [nickname] = useState(() => 'user_' + Math.floor(100000 + Math.random() * 900000));

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
        console.log('telegramId from URL hash:', telegramId);
      }
    }
    console.log('register check - isReady:', isReady, 'telegramId:', telegramId);
    if (!telegramId) return;
    fetch(`/api/auth/me?telegramId=${telegramId}`)
      .then((r) => r.json())
      .then((data) => {
        console.log('me response:', JSON.stringify(data));
        if (data.exists && data.user?.id) {
          localStorage.setItem('matrix_ton_user_id', String(data.user.id));
          router.replace('/tables');
        }
      })
      .catch((e) => { console.log('me error:', e); });
  }, [router, isReady]);

  useEffect(() => {
    if (step !== 2) return;
    if (!tonAddress) return;
    setStep(3);
  }, [step, tonAddress]);

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);

    let effectiveTelegramId: string = user?.id != null ? String(user.id) : String(Date.now());
    let effectiveTelegramUsername: string | undefined = user?.username;

    const tgWebApp = typeof window !== 'undefined' ? (window as any)?.Telegram?.WebApp : null;
    const tgUser = tgWebApp?.initDataUnsafe?.user;

    console.log('WebApp direct user:', tgUser);

    if (tgUser) {
      if (tgUser.id) effectiveTelegramId = String(tgUser.id);
      if (tgUser.username) effectiveTelegramUsername = tgUser.username;
    }

    console.log('After WebApp direct:', { effectiveTelegramId, effectiveTelegramUsername });

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
    console.log('Final register data:', { effectiveTelegramId, effectiveTelegramUsername });

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
          referralCode: 'MASTER',
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

  useEffect(() => {
    if (step !== 3) return;
    if (registering) return;
    handleRegister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, registerAttempt]);

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
            Matrix TON
          </h1>
          <p style={{ color: '#cccccc', fontSize: '1rem', margin: 0, textAlign: 'center' }}>
            Earn on TON blockchain
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
                <p style={{ color: '#ffffff', fontWeight: 600, margin: 0, fontSize: '1rem' }}>270% ROI</p>
                <p style={{ color: '#aaaaaa', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Per cycle earnings</p>
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

          <div
            style={{
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', margin: '0 0 8px 0' }}>
              Your nickname: <span style={{ color: '#a855f7' }}>{nickname}</span>
            </p>
            <p style={{ color: '#aaaaaa', fontSize: '0.85rem', margin: 0 }}>
              You are verified by your unique nickname + wallet. One nickname = one wallet.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <TonConnectButton />
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={containerStyle}>
          {!error ? (
            <div style={{ textAlign: 'center' }}>
              <div style={spinnerStyle} />
              <p style={{ color: '#cccccc', marginTop: '14px', marginBottom: 0 }}>Registering...</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>Error</p>
              <p style={{ color: '#cccccc', marginTop: '10px' }}>{error}</p>
              <button
                onClick={() => setRegisterAttempt((x) => x + 1)}
                disabled={registering}
                style={{ ...buttonStyle, color: '#ffffff', opacity: registering ? 0.7 : 1 }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
