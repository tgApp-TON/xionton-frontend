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
    function tryInit(attempt: number = 0) {
      const tg: any = (window as any).Telegram?.WebApp;
      if (!tg) return false;

      let u = tg.initDataUnsafe?.user;
      if (!u && tg.initData) {
        try {
          const params = new URLSearchParams(tg.initData);
          const userStr = params.get('user');
          if (userStr) {
            u = JSON.parse(userStr);
          }
        } catch (e) {}
      }

      if (!u) return false;

      tg.ready();
      tg.expand();
      if (typeof tg.lockOrientation === 'function') tg.lockOrientation();
      if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes();
      tg.enableClosingConfirmation();
      if (typeof tg.requestFullscreen === 'function') {
        tg.requestFullscreen();
      }
      tg.setHeaderColor('#000000');
      tg.setBackgroundColor('#000000');

      setUser({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        username: u.username,
        language_code: u.language_code,
        is_premium: u.is_premium
      });

      const startParam = tg.initDataUnsafe?.start_param;
      if (startParam) setReferralCode(startParam);

      setIsReady(true);
      return true;
    }

    if (tryInit(0)) return;

    // Retry every 100ms up to 30 times (3s total)
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryInit(attempts) || attempts >= 30) {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <TelegramContext.Provider value={{
      user,
      webApp: typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null,
      isReady,
      isPremium: user?.is_premium || false,
      referralCode
    }}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);
