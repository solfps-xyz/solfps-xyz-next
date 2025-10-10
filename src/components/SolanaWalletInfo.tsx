'use client';

import { useSolanaKit } from '@/hooks/useSolanaKit';
import { useEffect, useState } from 'react';

export function SolanaWalletInfo() {
  const { walletAddress, walletAddressString, rpc, isConnected } = useSolanaKit();
  const [balance, setBalance] = useState<bigint | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      if (!walletAddress) return;
      
      try {
        const accountInfo = await rpc.getBalance(walletAddress).send();
        setBalance(accountInfo.value);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }

    if (isConnected) {
      fetchBalance();
    }
  }, [walletAddress, rpc, isConnected]);

  if (!isConnected) return null;

  return (
    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px' }}>
      <h3>Solana Wallet Info</h3>
      <p><strong>Address:</strong> {walletAddressString}</p>
      <p><strong>Balance:</strong> {balance ? `${Number(balance) / 1e9} SOL` : 'Loading...'}</p>
    </div>
  );
}
