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
    const isInTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp;
    
    if (isInTelegram && window.Telegram) {
      const WebApp = window.Telegram.WebApp;
      WebApp.ready();
      WebApp.expand();
      
      const tgUser = WebApp.initDataUnsafe.user;
      
      if (tgUser) {
        setUser({
          id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          language_code: tgUser.language_code,
          is_premium: tgUser.is_premium
        });
      }

      const startParam = WebApp.initDataUnsafe?.start_param;
      if (startParam) {
        setReferralCode(startParam);
        console.log('Referral code from URL:', startParam);
      }
      
      WebApp.setHeaderColor('#000000');
      WebApp.setBackgroundColor('#000000');
    } else {
      setUser({
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'en',
        is_premium: true
      });

      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref');
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
