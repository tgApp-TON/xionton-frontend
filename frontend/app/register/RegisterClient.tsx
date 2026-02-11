'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WebApp from '@twa-dev/sdk';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { Crown, Check, X, Users, Wallet } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Premium', icon: Crown },
  { id: 2, label: 'Channel', icon: Check },
  { id: 3, label: 'Nickname', icon: Users },
  { id: 4, label: 'Wallet', icon: Wallet },
];

export function RegisterClient() {
  const router = useRouter();
  const { user, isPremium, referralCode } = useTelegram();
  const tonAddress = useTonAddress();
  const [step, setStep] = useState(1);
  const [premiumChecked, setPremiumChecked] = useState<boolean | null>(null);
  const [channelSubscribed, setChannelSubscribed] = useState<boolean | null>(null);
  const [checkingChannel, setCheckingChannel] = useState(false);
  const [nickname, setNickname] = useState('');
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const telegramId = (typeof window !== 'undefined' ? WebApp?.initDataUnsafe?.user?.id ?? user?.id : user?.id) ?? 777777777;

  console.log('[RegisterClient] mounted, telegramId:', telegramId);
  const telegramUsername = typeof window !== 'undefined' ? WebApp?.initDataUnsafe?.user?.username ?? user?.username : user?.username;
  const isPremiumUser = typeof window !== 'undefined' ? WebApp?.initDataUnsafe?.user?.is_premium ?? isPremium : isPremium;

  useEffect(() => {
    WebApp?.ready?.();
    WebApp?.expand?.();
  }, []);

  useEffect(() => {
    if (premiumChecked === null) {
      const premium = Boolean(isPremiumUser);
      setPremiumChecked(premium);
    }
  }, [isPremiumUser, premiumChecked]);

  useEffect(() => {
    console.log('tonAddress changed:', tonAddress);
  }, [tonAddress]);

  const handleCheckChannel = async () => {
    if (!telegramId) return;
    setCheckingChannel(true);
    try {
      const res = await fetch(`/api/auth/check-channel?telegramId=${telegramId}`);
      const data = await res.json();
      setChannelSubscribed(data.subscribed);
    } catch {
      setChannelSubscribed(false);
    } finally {
      setCheckingChannel(false);
    }
  };

  const checkNicknameAvailability = async () => {
    if (!nickname || nickname.length < 3 || nickname.length > 20 || !/^[a-zA-Z0-9_]+$/.test(nickname)) {
      setNicknameError('3-20 characters, letters, numbers, underscore only');
      setNicknameAvailable(false);
      return;
    }
    if (nickname.toLowerCase() === 'master') {
      setNicknameError('This nickname is reserved');
      setNicknameAvailable(false);
      return;
    }
    setCheckingNickname(true);
    setNicknameError(null);
    try {
      const res = await fetch(`/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      const data = await res.json();
      setNicknameAvailable(data.available);
      if (!data.available) {
        setNicknameError('This nickname is already taken');
      }
    } catch {
      setNicknameAvailable(false);
      setNicknameError('Failed to check nickname');
    } finally {
      setCheckingNickname(false);
    }
  };

  useEffect(() => {
    if (!nickname) {
      setNicknameAvailable(null);
      setNicknameError(null);
      return;
    }
    const t = setTimeout(() => {
      if (nickname.length >= 3 && nickname.length <= 20 && /^[a-zA-Z0-9_]+$/.test(nickname) && nickname.toLowerCase() !== 'master') {
        checkNicknameAvailability();
      } else {
        setNicknameAvailable(null);
        if (nickname.length > 0) {
          setNicknameError(nickname.length < 3 ? 'Min 3 characters' : nickname.length > 20 ? 'Max 20 characters' : 'Letters, numbers, underscore only');
        } else {
          setNicknameError(null);
        }
      }
    }, 400);
    return () => clearTimeout(t);
  }, [nickname]);

  const handleNicknameContinue = () => {
    if (nicknameAvailable) {
      setStep(4);
    }
  };

  const handleRegister = async () => {
    if (!telegramId || !nickname || !tonAddress) return;
    setRegistering(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: String(telegramId),
          telegramUsername: telegramUsername || undefined,
          isPremium: isPremiumUser,
          nickname,
          tonWallet: tonAddress,
          referralCode: referralCode || 'MASTER',
        }),
      });
      const data = await res.json();
      console.log('Register response status:', res.status);
      console.log('Register response data:', data);
      if (data.success && (data.userId != null || data.user?.id != null)) {
        localStorage.setItem('matrix_ton_user_id', (data.userId ?? data.user.id).toString());
        router.replace('/tables');
      } else {
        setNicknameError(data.error || 'Registration failed');
      }
    } catch (e) {
      setNicknameError('Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  useEffect(() => {
    if (step === 4 && tonAddress && nickname && nicknameAvailable && !registering) {
      handleRegister();
    }
  }, [step, tonAddress, nickname, nicknameAvailable]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    maxWidth: '420px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    background: 'rgba(26, 26, 46, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '1rem 1.25rem',
    background: 'rgba(15, 15, 35, 0.6)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '0.75rem',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '0.75rem',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const continueButtonStyle: React.CSSProperties = {
    background: '#a855f7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.75rem',
    padding: '12px 32px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '1rem',
  };

  return (
    <div className="min-h-screen relative" style={{ paddingTop: '70px' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: done ? 'rgba(34, 197, 94, 0.2)' : active ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.1)',
                    border: `2px solid ${done ? '#22c55e' : active ? '#8b5cf6' : 'rgba(255,255,255,0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {done ? <Check size={18} style={{ color: '#22c55e' }} /> : <Icon size={18} style={{ color: active ? '#8b5cf6' : '#fff' }} />}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 1rem' }}>
        {step === 1 && (
          <div style={containerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Crown size={48} style={{ color: '#8b5cf6', marginBottom: '0.75rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Telegram Premium
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Verifying your account...</p>
            </div>
            {premiumChecked !== null && (
              <div
                style={{
                  padding: '1rem',
                  background: premiumChecked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${premiumChecked ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {premiumChecked ? <Check size={24} style={{ color: '#22c55e' }} /> : <X size={24} style={{ color: '#ef4444' }} />}
                <div>
                  <p style={{ fontWeight: 600, color: '#fff', margin: 0 }}>
                    {premiumChecked ? 'Premium verified' : 'Premium required'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 0 0' }}>
                    {premiumChecked ? 'You can continue' : 'Telegram Premium is required to join Matrix TON.'}
                  </p>
                </div>
              </div>
            )}
            {premiumChecked !== null && (
              <button onClick={() => setStep(2)} style={continueButtonStyle}>
                Continue →
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div style={containerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Channel Subscription
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Subscribe to @MatrixTON_Official</p>
            </div>
            {channelSubscribed !== null && (
              <div
                style={{
                  padding: '1rem',
                  background: channelSubscribed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${channelSubscribed ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  borderRadius: '0.75rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {channelSubscribed ? <Check size={24} style={{ color: '#22c55e' }} /> : <X size={24} style={{ color: '#ef4444' }} />}
                <p style={{ margin: 0, color: '#fff', fontWeight: 600 }}>
                  {channelSubscribed ? 'Subscribed ✓' : 'Not subscribed yet'}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={handleCheckChannel} disabled={checkingChannel} style={buttonStyle}>
                {checkingChannel ? 'Checking...' : 'Check'}
              </button>
              {channelSubscribed === true && (
                <button onClick={() => setStep(3)} style={continueButtonStyle}>
                  Continue →
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={containerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Users size={48} style={{ color: '#8b5cf6', marginBottom: '0.75rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Choose Nickname
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>3-20 chars, letters, numbers, underscore</p>
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
              placeholder="nickname"
              style={{
                ...inputStyle,
                marginBottom: '0.5rem',
                border: nicknameError ? '1px solid rgba(239, 68, 68, 0.5)' : nicknameAvailable ? '1px solid rgba(34, 197, 94, 0.5)' : inputStyle.border,
              }}
              maxLength={20}
            />
            {checkingNickname && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 1rem 0' }}>Checking...</p>}
            {nicknameError && !checkingNickname && <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0 0 1rem 0' }}>{nicknameError}</p>}
            {nicknameAvailable && !checkingNickname && <p style={{ fontSize: '0.75rem', color: '#22c55e', margin: '0 0 1rem 0' }}>Available</p>}
            <button onClick={handleNicknameContinue} disabled={!nicknameAvailable} style={{ ...buttonStyle, opacity: nicknameAvailable ? 1 : 0.5 }}>
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div style={containerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Wallet size={48} style={{ color: '#8b5cf6', marginBottom: '0.75rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Connect Wallet
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Connect your TON wallet to complete registration</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <TonConnectButton />
            </div>
            {registering && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Registering...</p>}
            {tonAddress && !registering && (
              <button
                onClick={() => handleRegister()}
                style={{
                  background: '#a855f7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '12px 32px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '1rem',
                }}
              >
                Complete Registration
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
