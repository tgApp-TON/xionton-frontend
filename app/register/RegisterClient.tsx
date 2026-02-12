'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { useTelegram } from '@/components/providers/TelegramProvider';

export function RegisterClient() {
  const router = useRouter();
  const { user } = useTelegram();
  const tonAddress = useTonAddress();
  const containerStyle: React.CSSProperties = {
    maxWidth: '420px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    background: '#000000',
    borderRadius: '1.5rem',
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
    color: 'rgba(255, 255, 255, 0.6)',
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

  useEffect(() => {
    if (step !== 2) return;
    if (!tonAddress) return;
    setStep(3);
  }, [step, tonAddress]);

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);

    const telegramIdRaw = user?.id;
    const telegramId = telegramIdRaw != null ? String(telegramIdRaw) : String(Date.now());
    const telegramUsername = user?.username;
    const nickname = `user_${Math.floor(Math.random() * 900000) + 100000}`;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          telegramUsername: telegramUsername || undefined,
          isPremium: true,
          nickname,
          tonWallet: tonAddress || '',
          referralCode: 'MASTER',
        }),
      });

      const data = await res.json();
      if (data?.success && (data.userId != null || data.user?.id != null)) {
        localStorage.setItem('matrix_ton_user_id', String(data.userId ?? data.user.id));
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
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700, margin: 0 }}>Matrix TON</h1>
            <p style={{ ...subtitleStyle, marginTop: '10px' }}>Автоматическая матричная система на блокчейне TON</p>
          </div>

          <div style={{ maxWidth: '320px', margin: '0 auto 28px auto' }}>
            <p style={{ color: '#ffffff', fontSize: '0.9rem', margin: '0 0 10px 0' }}>• 12 столов с прогрессией ×2</p>
            <p style={{ color: '#ffffff', fontSize: '0.9rem', margin: '0 0 10px 0' }}>• 270% ROI за цикл</p>
            <p style={{ color: '#ffffff', fontSize: '0.9rem', margin: 0 }}>• Автоматические выплаты</p>
          </div>

          <button onClick={() => setStep(2)} style={buttonStyle}>
            Начать →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Подключи кошелёк</h2>
            <p style={{ ...subtitleStyle, marginTop: '10px' }}>Для участия необходим TON кошелёк</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <TonConnectButton />
          </div>

          <button
            onClick={() => setStep(3)}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              border: 'none',
              padding: 0,
              fontSize: '0.9rem',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '320px',
              margin: '0 auto',
              display: 'block',
              textAlign: 'center',
            }}
          >
            Пропустить →
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={containerStyle}>
          {!error ? (
            <div style={{ textAlign: 'center' }}>
              <div style={spinnerStyle} />
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '14px', marginBottom: 0 }}>Регистрация...</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>Ошибка</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '10px' }}>{error}</p>
              <button
                onClick={() => setRegisterAttempt((x) => x + 1)}
                disabled={registering}
                style={{ ...buttonStyle, opacity: registering ? 0.7 : 1 }}
              >
                Повторить
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
