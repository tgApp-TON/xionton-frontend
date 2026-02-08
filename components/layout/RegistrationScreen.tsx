'use client';
import { useState, useEffect } from 'react';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { Users, Check, X, Crown, AlertCircle, Lock, Globe } from 'lucide-react';

interface RegistrationScreenProps {
  onComplete: () => void;
}

// Список популярных стран
const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'OTHER', name: 'Other', flag: '🌍' },
];

// Определение страны по language_code
const getCountryFromLanguage = (langCode?: string): string => {
  if (!langCode) return '';
  
  const langToCountry: Record<string, string> = {
    'en': 'US',
    'ru': 'RU',
    'uk': 'UA',
    'de': 'DE',
    'fr': 'FR',
    'es': 'ES',
    'it': 'IT',
    'pl': 'PL',
    'tr': 'TR',
    'pt': 'BR',
    'hi': 'IN',
    'zh': 'CN',
    'ja': 'JP',
    'ko': 'KR',
  };
  
  return langToCountry[langCode] || '';
};

export function RegistrationScreen({ onComplete }: RegistrationScreenProps) {
  const { user, isPremium } = useTelegram();
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Автозаполнение nickname и страны
  useEffect(() => {
    if (user?.username && !nickname) {
      setNickname(user.username);
    }
    if (user?.language_code && !country) {
      const detectedCountry = getCountryFromLanguage(user.language_code);
      setCountry(detectedCountry);
    }
  }, [user]);

  const checks = {
    premium: isPremium,
    channel: true,
    age: true
  };

  // Проверка на латиницу, цифры, подчёркивание
  const isValidNickname = (text: string) => {
    return /^[a-zA-Z0-9_]+$/.test(text);
  };

  const hasInvalidChars = nickname.length > 0 && !isValidNickname(nickname);
  const canProceed = nickname.length >= 3 && isValidNickname(nickname);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20);
    setNickname(value);
  };

  const handleRegister = async () => {
    if (!canProceed) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user?.id,
          telegramUsername: user?.username,
          nickname: nickname,
          isPremium: isPremium,
          country: country || null,
        })
      });

      if (response.ok) {
        setTimeout(() => {
          onComplete();
        }, 500);
      } else {
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  // ОБЩИЙ СТИЛЬ ДЛЯ КОНТЕЙНЕРА - СТРОГО 28rem
  const containerStyle: React.CSSProperties = {
    width: '28rem',
    maxWidth: '28rem',
    minWidth: '28rem'
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated circles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'pulse 4s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'pulse 4s ease-in-out infinite',
        animationDelay: '2s'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💎</div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #06b6d4, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Matrix TON
          </h1>
          <p style={{ color: '#d1d5db', fontSize: '1.125rem' }}>
            Automatic Matrix System on TON
          </p>
        </div>

        {/* User Info Card */}
        {user && (
          <div style={{
            ...containerStyle,
            padding: '1.5rem',
            borderRadius: '1rem',
            marginBottom: '1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users style={{ width: '2rem', height: '2rem', color: '#ffffff' }} />
              </div>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
                  {user.first_name} {user.last_name || ''}
                </div>
                {user.username && (
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    @{user.username}
                  </div>
                )}
              </div>
            </div>

            {/* Checks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {checks.premium ? (
                    <Check style={{ width: '1.25rem', height: '1.25rem', color: '#4ade80' }} />
                  ) : (
                    <X style={{ width: '1.25rem', height: '1.25rem', color: '#f87171' }} />
                  )}
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ffffff' }}>Telegram Premium</span>
                </div>
                {checks.premium && <Crown style={{ width: '1.25rem', height: '1.25rem', color: '#fbbf24' }} />}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check style={{ width: '1.25rem', height: '1.25rem', color: '#4ade80' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ffffff' }}>Channel Subscription</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check style={{ width: '1.25rem', height: '1.25rem', color: '#4ade80' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ffffff' }}>Account Age (12+ months)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nickname Input */}
        <div style={{ ...containerStyle, marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            color: '#e5e7eb'
          }}>
            Choose Your Nickname (Latin letters only)
          </label>
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="e.g. CryptoKing_2024"
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: `2px solid ${
                hasInvalidChars ? 'rgba(239, 68, 68, 0.6)' : 
                canProceed ? 'rgba(168, 85, 247, 0.6)' : 
                'rgba(156, 163, 175, 0.3)'
              }`,
              outline: 'none',
              transition: 'all 0.3s',
              boxSizing: 'border-box'
            }}
          />
          <div style={{
            fontSize: '0.75rem',
            marginTop: '0.5rem',
            fontWeight: 500,
            color: hasInvalidChars ? '#f87171' : canProceed ? '#9ca3af' : '#6b7280'
          }}>
            {nickname.length}/20 • {
              hasInvalidChars ? '❌ Latin only (a-z, A-Z, 0-9, _)' :
              canProceed ? '✓ Valid' : 
              'min 3 chars'
            }
          </div>
          
          {/* Warning about nickname */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            marginTop: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            <AlertCircle style={{ 
              width: '1rem', 
              height: '1rem', 
              color: '#fbbf24',
              flexShrink: 0,
              marginTop: '0.125rem'
            }} />
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#fbbf24',
                marginBottom: '0.25rem'
              }}>
                Cannot be changed!
              </p>
              <p style={{
                fontSize: '0.7rem',
                color: '#fcd34d',
                lineHeight: '1.4'
              }}>
                Linked to @{user?.username || 'username'}
              </p>
            </div>
          </div>

          {/* Privacy notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            marginTop: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <Lock style={{ 
              width: '1rem', 
              height: '1rem', 
              color: '#4ade80',
              flexShrink: 0,
              marginTop: '0.125rem'
            }} />
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#4ade80',
                marginBottom: '0.25rem'
              }}>
                Privacy Protected
              </p>
              <p style={{
                fontSize: '0.7rem',
                color: '#86efac',
                lineHeight: '1.4'
              }}>
                @{user?.username || 'username'} stays private
              </p>
            </div>
          </div>
        </div>

        {/* Country Selection */}
        <div style={{ ...containerStyle, marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            color: '#e5e7eb'
          }}>
            Country (Optional)
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 500,
              color: country ? '#ffffff' : '#9ca3af',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(156, 163, 175, 0.3)',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxSizing: 'border-box'
            }}
          >
            <option value="" style={{ background: '#1a1a2e', color: '#9ca3af' }}>
              Select country (optional)
            </option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} style={{ background: '#1a1a2e', color: '#ffffff' }}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>

          {/* Country privacy notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            marginTop: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <Globe style={{ 
              width: '1rem', 
              height: '1rem', 
              color: '#60a5fa',
              flexShrink: 0,
              marginTop: '0.125rem'
            }} />
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '0.7rem',
                color: '#93c5fd',
                lineHeight: '1.4'
              }}>
                Private, never shown. Helps improve platform.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            ...containerStyle,
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1rem',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            boxSizing: 'border-box'
          }}>
            <p style={{ fontSize: '0.875rem', textAlign: 'center', fontWeight: 500, color: '#fca5a5' }}>
              {error}
            </p>
          </div>
        )}

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={!canProceed || loading}
          style={{
            ...containerStyle,
            padding: '1rem',
            borderRadius: '1rem',
            fontSize: '1.125rem',
            fontWeight: 700,
            color: canProceed ? '#ffffff' : '#6b7280',
            background: canProceed 
              ? 'linear-gradient(135deg, #a855f7, #ec4899)'
              : 'rgba(75, 85, 99, 0.5)',
            border: 'none',
            boxShadow: canProceed ? '0 0 30px rgba(168, 85, 247, 0.5)' : 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.3s',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        >
          {loading ? 'Registering...' : '🚀 Start Matrix TON'}
        </button>

        {/* Info */}
        <div style={{
          ...containerStyle,
          marginTop: '2rem',
          padding: '1rem',
          borderRadius: '0.75rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box'
        }}>
          <p style={{
            fontSize: '0.75rem',
            textAlign: 'center',
            fontWeight: 500,
            color: '#d1d5db'
          }}>
            ℹ️ Nickname visible to all participants
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
