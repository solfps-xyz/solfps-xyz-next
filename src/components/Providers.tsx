"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { ReactNode } from "react";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors({
              // This will automatically detect Phantom, Solflare, etc.
            })
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
