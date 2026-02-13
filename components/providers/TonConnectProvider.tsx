'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode } from 'react';

const manifestUrl = 'https://matrix-ton-app.vercel.app/tonconnect-manifest.json';

export function TonConnectProvider({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/MatrixTONTON_Bot',
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
