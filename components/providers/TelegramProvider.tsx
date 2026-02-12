'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramContextType {
  user: TelegramUser | null;
  webApp: any;
  isReady: boolean;
  isPremium: boolean;
  referralCode: string | null;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  webApp: null,
  isReady: false,
  isPremium: false,
  referralCode: null
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    const initDataUnsafe = tg?.initDataUnsafe;
    let userFromUnsafe = initDataUnsafe?.user;


    // telegramId for consumers = user?.id ?? null (no fallback id)
    if (typeof window !== 'undefined' && tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#000000');
      tg.setBackgroundColor('#000000');

      if (userFromUnsafe) {
        setUser({
          id: userFromUnsafe.id,
          first_name: userFromUnsafe.first_name,
          last_name: userFromUnsafe.last_name,
          username: userFromUnsafe.username,
          language_code: userFromUnsafe.language_code,
          is_premium: userFromUnsafe.is_premium
        });
      } else {
        setUser(null);
      }

      const startParam = initDataUnsafe?.start_param ?? null;
      if (startParam) {
        setReferralCode(startParam);
        console.log('Referral code from URL:', startParam);
      }
    } else {
      setUser(null);
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const refParam = urlParams?.get('ref');
      if (refParam) {
        setReferralCode(refParam);
        console.log('Referral code from browser URL:', refParam);
      }
    }

    setIsReady(true);
  }, []);

  const value = {
    user,
    webApp: typeof window !== 'undefined' ? window.Telegram?.WebApp : null,
    isReady,
    isPremium: user?.is_premium || false,
    referralCode
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);
