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
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  webApp: null,
  isReady: false,
  isPremium: false
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Проверяем, запущены ли мы в Telegram
    const isInTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp;
    
    if (isInTelegram) {
      // Реальный Telegram
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
      
      WebApp.setHeaderColor('#000000');
      WebApp.setBackgroundColor('#000000');
    } else {
      // Тестовый режим в браузере
      setUser({
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'en',
        is_premium: true
      });
    }
    
    setIsReady(true);
  }, []);

  const value = {
    user,
    webApp: typeof window !== 'undefined' ? window.Telegram?.WebApp : null,
    isReady,
    isPremium: user?.is_premium || false
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);
