'use client';

import { usePrivy } from '@privy-io/react-auth';
import { isMobileDevice } from '@/lib/deviceDetection';
import styles from './AuthGuard.module.css';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { ready, authenticated, login } = usePrivy();
  
  // Skip authentication on mobile for testing
  const isMobile = isMobileDevice();
  if (isMobile) {
    console.log('🔓 Mobile detected - skipping authentication for testing');
    return <>{children}</>;
  }

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <h2>Initializing...</h2>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!authenticated) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <h1>🎮 Sol FPS - Cyberpunk</h1>
          <p>Connect your wallet to start playing</p>
          <button onClick={login} className={styles.loginButton}>
            Connect Wallet
          </button>
          <p className={styles.subtitle}>
            Login with email, Google, Discord, or your crypto wallet
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated, show the game
  return <>{children}</>;
}
