'use client';
import { useState, useEffect } from 'react';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { Users, Check, X, Crown, AlertCircle, Lock, Globe, Link } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

interface RegistrationScreenProps {
  onComplete: () => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
];

export function RegistrationScreen({ onComplete }: RegistrationScreenProps) {
  const { user, webApp } = useTelegram();
  const [step, setStep] = useState<'check' | 'nickname' | 'country' | 'referral'>('check');
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState(false);
  const [referralStatus, setReferralStatus] = useState<{
    valid: boolean;
    username?: string;
    error?: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  
  const [checks, setChecks] = useState({
    premium: false,
    accountAge: false,
    channelSubscribed: false
  });

  const isNicknameValid = nickname.length >= 3 && nickname.length <= 20 && /^[a-zA-Z0-9_]+$/.test(nickname) && !nicknameError;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setReferralCodeFromUrl(true);
      validateReferralCode(refCode);
    }
  }, []);

  const validateReferralCode = async (code: string) => {
    if (!code || code.length === 0) {
      setReferralStatus(null);
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch(`/api/referral/validate?code=${code}`);
      const data = await response.json();
      
      if (data.valid) {
        setReferralStatus({
          valid: true,
          username: data.username
        });
      } else {
        setReferralStatus({
          valid: false,
          error: 'Invalid referral code'
        });
      }
    } catch (error) {
      setReferralStatus({
        valid: false,
        error: 'Failed to validate code'
      });
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setChecks({
        premium: user?.is_premium || false,
        accountAge: true,
        channelSubscribed: true
      });
      
      if (user?.is_premium) {
        setTimeout(() => setStep('nickname'), 3000);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user]);

  const checkNickname = async (nick: string) => {
    if (nick.toLowerCase() === 'master') {
      setNicknameError('This nickname is reserved');
      return false;
    }
    setIsCheckingNickname(true);
    try {
      const res = await fetch(`/api/user/check-nickname?nickname=${nick}`);
      const data = await res.json();
      if (data.taken) {
        setNicknameError('This nickname is already taken');
        return false;
      }
      setNicknameError(null);
      return true;
    } catch {
      setNicknameError('Failed to check nickname');
      return false;
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const registerUser = async (data: {
    telegramId: string;
    username: string;
    nickname: string;
    referralCode: string;
    country: string;
  }) => {
    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Registration failed');
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const handleNicknameSubmit = async () => {
    if (isNicknameValid && nickname.length >= 3) {
      const isValid = await checkNickname(nickname);
      if (isValid) {
        setStep('country');
      }
    }
  };

  const handleCountrySubmit = () => {
    if (country) {
      setStep('referral');
    }
  };

  const handleReferralSubmit = async (overrideCode?: string) => {
    const finalReferralCode = overrideCode !== undefined ? overrideCode : (referralCode || 'MASTER');
    console.log('Registration:', { nickname, country, referralCode: finalReferralCode });
    
    try {
      // Get Telegram user data
      const tg = window.Telegram?.WebApp;
      const telegramId = tg?.initDataUnsafe?.user?.id?.toString() || '123456789';
      const username = tg?.initDataUnsafe?.user?.username || nickname;
      
      // Register user in database
      const result = await registerUser({
        telegramId,
        username,
        nickname,
        referralCode: finalReferralCode,
        country: country || 'US'
      });
      
      // Save userId to localStorage after successful registration
      if (result.success && result.user) {
        localStorage.setItem('matrix_ton_user_id', result.user.id.toString());
      }
      
      // Continue with existing flow
      onComplete();
    } catch (error) {
      console.error('Registration failed:', error);
      // Show error to user
      setNicknameError('Registration failed. Please try again.');
    }
  };

  const handleSkipReferral = () => {
    // Silently assign MASTER in background - don't set state to avoid showing it in UI
    handleReferralSubmit('MASTER');
  };

  const containerStyle = {
    position: 'relative' as const,
    zIndex: 10,
    maxWidth: '400px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    background: 'rgba(26, 26, 46, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '1rem 1.25rem',
    background: 'rgba(15, 15, 35, 0.6)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '0.75rem',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease'
  };

  const buttonStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '0.75rem',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Theme Toggle Button - available during onboarding */}
      <button
        onClick={() => document.documentElement.classList.toggle('light-theme')}
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          zIndex: 99999,
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-300">
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>
      <AnimatedBackground />
      
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'pulse 4s ease-in-out infinite',
        zIndex: 1
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'pulse 4s ease-in-out infinite 1s',
        zIndex: 1
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>

        {step === 'check' && (
          <div style={containerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Crown size={48} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Checking Requirements
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Verifying your Telegram account...
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                background: checks.premium ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${checks.premium ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '0.75rem',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: checks.premium ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem'
                }}>
                  {checks.premium ? (
                    <Check size={20} style={{ color: '#22c55e' }} />
                  ) : (
                    <X size={20} style={{ color: '#ef4444' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Crown size={16} style={{ color: '#8b5cf6' }} />
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>Telegram Premium</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                    {checks.premium ? 'Premium subscription active' : 'Premium subscription required'}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                background: checks.accountAge ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${checks.accountAge ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '0.75rem',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: checks.accountAge ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem'
                }}>
                  {checks.accountAge ? (
                    <Check size={20} style={{ color: '#22c55e' }} />
                  ) : (
                    <X size={20} style={{ color: '#ef4444' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>
                    Account Age
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                    {checks.accountAge ? 'Account is older than 12 months' : 'Account must be 12+ months old'}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                background: checks.channelSubscribed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${checks.channelSubscribed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '0.75rem',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: checks.channelSubscribed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem'
                }}>
                  {checks.channelSubscribed ? (
                    <Check size={20} style={{ color: '#22c55e' }} />
                  ) : (
                    <X size={20} style={{ color: '#ef4444' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>
                    Channel Subscription
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                    {checks.channelSubscribed ? 'Subscribed to @MatrixTON_Official' : 'Subscribe to @MatrixTON_Official'}
                  </p>
                </div>
              </div>
            </div>

            {!checks.premium && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <AlertCircle size={20} style={{ color: '#ef4444', marginTop: '0.125rem' }} />
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Premium Required
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                      Telegram Premium is required to join Matrix TON. Please upgrade your account and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'nickname' && (
          <div style={containerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Users size={48} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Choose Your Nickname
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                This will be your unique identifier in Matrix TON
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={async (e) => {
                  const newNick = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                  setNickname(newNick);
                  setNicknameError(null);
                  if (newNick.length >= 3 && newNick.length <= 20 && /^[a-zA-Z0-9_]+$/.test(newNick)) {
                    await checkNickname(newNick);
                  }
                }}
                placeholder="Enter nickname (3-20 chars)"
                style={{
                  ...inputStyle,
                  border: nicknameError 
                    ? '1px solid rgba(239, 68, 68, 0.3)' 
                    : inputStyle.border
                }}
                maxLength={20}
              />
              {isCheckingNickname && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Checking availability...
                </div>
              )}
              {nicknameError && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#ef4444' }}>
                  {nicknameError}
                </div>
              )}
              {!nicknameError && !isCheckingNickname && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  {nickname.length}/20 characters • Letters, numbers, underscore only
                </div>
              )}
            </div>

            <button
              onClick={handleNicknameSubmit}
              disabled={!isNicknameValid || isCheckingNickname}
              style={{
                ...buttonStyle,
                opacity: (isNicknameValid && !isCheckingNickname) ? 1 : 0.5,
                cursor: (isNicknameValid && !isCheckingNickname) ? 'pointer' : 'not-allowed'
              }}
            >
              {isCheckingNickname ? 'Checking...' : 'Continue'}
            </button>
          </div>
        )}

        {step === 'country' && (
          <div style={containerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Globe size={48} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Select Your Country
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                This helps us provide better service
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{
                  ...inputStyle,
                  cursor: 'pointer'
                }}
              >
                <option value="" style={{ backgroundColor: '#1a1a2e' }}>Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} style={{ backgroundColor: '#1a1a2e' }}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCountrySubmit}
              disabled={!country}
              style={{
                ...buttonStyle,
                opacity: country ? 1 : 0.5,
                cursor: country ? 'pointer' : 'not-allowed'
              }}
            >
              Continue
            </button>
          </div>
        )}

        {step === 'referral' && (
          <div style={containerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Link size={48} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Referral Code
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {referralCodeFromUrl 
                  ? 'You were referred to join this team'
                  : 'Enter a referral code to join someone\'s team (optional)'
                }
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Referral Code {referralCodeFromUrl ? '' : '(Optional)'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => {
                    if (!referralCodeFromUrl) {
                      const code = e.target.value.toUpperCase();
                      setReferralCode(code);
                      if (code.length >= 3) {
                        validateReferralCode(code);
                      } else {
                        setReferralStatus(null);
                      }
                    }
                  }}
                  placeholder="Enter referral code"
                  disabled={referralCodeFromUrl}
                  style={{
                    ...inputStyle,
                    paddingRight: '3rem',
                    border: referralStatus 
                      ? `1px solid ${referralStatus.valid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      : '1px solid rgba(139, 92, 246, 0.3)',
                    opacity: referralCodeFromUrl ? 0.7 : 1,
                    cursor: referralCodeFromUrl ? 'not-allowed' : 'text'
                  }}
                  maxLength={20}
                />
                {referralStatus && (
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    {referralStatus.valid ? (
                      <Check size={20} style={{ color: '#22c55e' }} />
                    ) : (
                      <X size={20} style={{ color: '#ef4444' }} />
                    )}
                  </div>
                )}
              </div>

              {isValidating && (
                <div style={{ 
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  Validating code...
                </div>
              )}

              {referralStatus && !isValidating && (
                <div style={{ 
                  marginTop: '0.5rem',
                  fontSize: referralCodeFromUrl && referralStatus.valid ? '0.875rem' : '0.75rem',
                  fontWeight: referralCodeFromUrl && referralStatus.valid ? 600 : 400,
                  color: referralStatus.valid ? '#22c55e' : '#ef4444',
                  padding: referralCodeFromUrl && referralStatus.valid ? '0.75rem' : '0',
                  background: referralCodeFromUrl && referralStatus.valid ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                  borderRadius: referralCodeFromUrl && referralStatus.valid ? '0.5rem' : '0',
                  border: referralCodeFromUrl && referralStatus.valid ? '1px solid rgba(34, 197, 94, 0.3)' : 'none'
                }}>
                  {referralStatus.valid 
                    ? (referralCodeFromUrl 
                        ? `Referred by: @${referralStatus.username}`
                        : `Valid! You'll join @${referralStatus.username}'s team`
                      )
                    : referralStatus.error
                  }
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {!referralCodeFromUrl && (
                <button
                  onClick={handleSkipReferral}
                  style={{
                    flex: 1,
                    padding: '1rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Skip
                </button>
              )}
              <button
                onClick={() => handleReferralSubmit()}
                disabled={referralCode.length > 0 && (!referralStatus || !referralStatus.valid)}
                style={{
                  ...buttonStyle,
                  flex: referralCodeFromUrl ? 1 : 1,
                  width: referralCodeFromUrl ? '100%' : buttonStyle.width,
                  opacity: (referralCode.length === 0 || (referralStatus && referralStatus.valid)) ? 1 : 0.5,
                  cursor: (referralCode.length === 0 || (referralStatus && referralStatus.valid)) ? 'pointer' : 'not-allowed'
                }}
              >
                Complete
              </button>
            </div>
          </div>
        )}

      </div>

      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        animation: 'bounce 2s infinite'
      }}>
        <div 
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: 'rgba(102, 126, 234, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(102, 126, 234, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => window.scrollBy({ top: 300, behavior: 'smooth' })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="3">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
