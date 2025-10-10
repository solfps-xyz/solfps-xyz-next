'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useMemo } from 'react';
import { 
  createSolanaRpc, 
  address, 
  type Address 
} from '@solana/kit';

export function useSolanaKit() {
  const { user, authenticated } = usePrivy();

  const solanaWallet = useMemo(() => {
    if (!authenticated || !user) return null;

    const wallet = user.linkedAccounts?.find((account: any) => 
      account.type === 'wallet' && (
        account.walletClientType?.includes('phantom') ||
        account.walletClientType?.includes('solflare') ||
        account.chainType === 'solana'
      )
    );

    return wallet ? (wallet as any).address : null;
  }, [authenticated, user]);

  const walletAddress = useMemo(() => {
    if (!solanaWallet) return null;
    try {
      return address(solanaWallet) as Address;
    } catch {
      return null;
    }
  }, [solanaWallet]);

  // Create RPC client for devnet (change to mainnet-beta for production)
  const rpc = useMemo(() => {
    return createSolanaRpc(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
    );
  }, []);

  return {
    walletAddress,
    walletAddressString: solanaWallet,
    rpc,
    isConnected: !!walletAddress,
    user,
  };
}
