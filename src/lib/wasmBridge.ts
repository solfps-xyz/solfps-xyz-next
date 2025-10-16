import type { User } from '@privy-io/react-auth';
import { isMobileDevice, isTabletDevice, getDeviceInfo } from './deviceDetection';

/**
 * Global bridge object that exposes wallet functions to WASM
 */
declare global {
  interface Window {
    PrivyBridge: {
      // Wallet information
      getWalletAddress: () => Promise<string | null>;
      isWalletConnected: () => Promise<boolean>;
      
      // User information
      getUserId: () => Promise<string | null>;
      getUserEmail: () => Promise<string | null>;
      
      // Wallet actions
      connectWallet: () => Promise<void>;
      disconnectWallet: () => Promise<void>;
      
      // Solana specific
      getSolanaAddress: () => Promise<string | null>;
      getSolanaBalance: () => Promise<number | null>;
      signSolanaMessage: (message: string) => Promise<string>;
      sendSolanaTransaction: (recipientAddress: string, amountLamports: number) => Promise<string>;
      
      // Device detection
      isMobile: () => boolean;
      isTablet: () => boolean;
      isDesktop: () => boolean;
      getScreenWidth: () => number;
      getScreenHeight: () => number;
      getOrientation: () => 'portrait' | 'landscape';
      hasTouch: () => boolean;
    };
  }
}

export class WasmBridge {
  private user: User | null = null;
  private solanaAddress: string | null = null;
  private connectHandler: (() => Promise<void>) | null = null;
  private disconnectHandler: (() => Promise<void>) | null = null;
  private signMessageHandler: ((message: string) => Promise<string>) | null = null;
  private sendTransactionHandler: ((recipient: string, amount: number) => Promise<string>) | null = null;
  private getBalanceHandler: (() => Promise<number | null>) | null = null;

  constructor() {
    this.setupBridge();
  }

  private setupBridge() {
    window.PrivyBridge = {
      getWalletAddress: async () => {
        return this.solanaAddress;
      },

      isWalletConnected: async () => {
        return !!this.solanaAddress;
      },

      getUserId: async () => {
        return this.user?.id || null;
      },

      getUserEmail: async () => {
        return this.user?.email?.address || null;
      },

      connectWallet: async () => {
        if (!this.connectHandler) {
          throw new Error('Connect wallet handler not initialized');
        }
        await this.connectHandler();
      },

      disconnectWallet: async () => {
        if (!this.disconnectHandler) {
          throw new Error('Disconnect wallet handler not initialized');
        }
        await this.disconnectHandler();
      },

      getSolanaAddress: async () => {
        return this.solanaAddress;
      },

      getSolanaBalance: async () => {
        if (!this.getBalanceHandler) {
          console.warn('Balance handler not initialized');
          return null;
        }
        return await this.getBalanceHandler();
      },

      signSolanaMessage: async (message: string) => {
        if (!this.signMessageHandler) {
          throw new Error('Sign message handler not initialized');
        }
        return await this.signMessageHandler(message);
      },

      sendSolanaTransaction: async (recipientAddress: string, amountLamports: number) => {
        if (!this.sendTransactionHandler) {
          throw new Error('Send transaction handler not initialized');
        }
        return await this.sendTransactionHandler(recipientAddress, amountLamports);
      },

      // Device detection functions
      isMobile: () => {
        return isMobileDevice();
      },

      isTablet: () => {
        return isTabletDevice();
      },

      isDesktop: () => {
        const deviceInfo = getDeviceInfo();
        return deviceInfo.isDesktop;
      },

      getScreenWidth: () => {
        return typeof window !== 'undefined' ? window.innerWidth : 0;
      },

      getScreenHeight: () => {
        return typeof window !== 'undefined' ? window.innerHeight : 0;
      },

      getOrientation: () => {
        if (typeof window === 'undefined') return 'landscape';
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      },

      hasTouch: () => {
        return typeof window !== 'undefined' && 
               ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      },
    };

    console.log('✅ PrivyBridge initialized and ready for WASM');
  }

  updateUser(user: User | null) {
    this.user = user;
    
    // Update Solana address
    if (user) {
      const solanaWallet = user.linkedAccounts?.find((account: any) => 
        account.type === 'wallet' && (
          account.walletClientType?.includes('phantom') ||
          account.walletClientType?.includes('solflare') ||
          account.chainType === 'solana'
        )
      );
      this.solanaAddress = solanaWallet ? (solanaWallet as any).address : null;
    } else {
      this.solanaAddress = null;
    }

    console.log('🔄 PrivyBridge updated:', {
      userId: this.user?.id,
      solanaAddress: this.solanaAddress,
    });
  }

  setConnectWalletHandler(handler: () => Promise<void>) {
    this.connectHandler = handler;
  }

  setDisconnectWalletHandler(handler: () => Promise<void>) {
    this.disconnectHandler = handler;
  }

  setSignMessageHandler(handler: (message: string) => Promise<string>) {
    this.signMessageHandler = handler;
  }

  setSendTransactionHandler(handler: (recipient: string, amount: number) => Promise<string>) {
    this.sendTransactionHandler = handler;
  }

  setGetBalanceHandler(handler: () => Promise<number | null>) {
    this.getBalanceHandler = handler;
  }
}

export const wasmBridge = new WasmBridge();
