'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

export default function Providers({ children }: { children: ReactNode }) {
  const solanaConnectors = toSolanaWalletConnectors({
    shouldAutoConnect: true,
  });

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#00ff88',
          walletList: ['phantom', 'detected_solana_wallets', 'metamask'],
          landingHeader: 'Connect to Sol FPS',
          loginMessage: 'Sign in to start playing',
        },
        externalWallets: {
          solana: { 
            connectors: solanaConnectors
          }
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
