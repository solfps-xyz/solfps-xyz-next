'use client';

import { usePrivy } from '@privy-io/react-auth';
import styles from './UserProfile.module.css';

export default function UserProfile() {
  const { user, logout, authenticated, linkWallet } = usePrivy();

  if (!authenticated || !user) return null;

  // Check for Solana wallet in linked accounts
  const solanaWallet = user.linkedAccounts?.find((account: any) => 
    account.type === 'wallet' && (
      account.walletClientType?.includes('phantom') ||
      account.walletClientType?.includes('solflare') ||
      account.chainType === 'solana'
    )
  );
  
  const solanaAddress = solanaWallet ? (solanaWallet as any).address : null;

  const displayName = user.email?.address || 
                      (solanaAddress 
                        ? `${solanaAddress.slice(0, 4)}...${solanaAddress.slice(-4)}`
                        : user.wallet?.address 
                          ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                          : 'User');

  return (
    <div className={styles.profileContainer}>
      <div className={styles.userInfo}>
        {solanaAddress && <span className={styles.badge}>SOL</span>}
        <span className={styles.userName}>{displayName}</span>
      </div>
      <div className={styles.actions}>
        <button onClick={linkWallet} className={styles.actionButton}>
          {solanaWallet ? 'Switch Wallet' : 'Connect Wallet'}
        </button>
        <button onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </div>
  );
}
