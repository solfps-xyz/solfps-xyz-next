'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { wasmBridge } from '@/lib/wasmBridge';
import { useSolanaKit } from '@/hooks/useSolanaKit';
import styles from './RaylibGame.module.css';

interface RaylibGameProps {
  gamePath?: string;
  width?: number;
  height?: number;
}

declare global {
  interface Window {
    Module: any;
  }
}

export default function RaylibGame({ 
  gamePath = '/game',
  width = 800,
  height = 450
}: RaylibGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameKey, setGameKey] = useState(0); // Force remount

  const { user, login, logout, authenticated } = usePrivy();
  const { walletAddressString, rpc, isConnected } = useSolanaKit();

  // Update WASM bridge with current user and wallet state
  useEffect(() => {
    wasmBridge.updateUser(user);
  }, [user]);

  // Custom logout handler that reloads the game
  const handleLogout = useCallback(async () => {
    console.log('� WASM requested wallet disconnection');
    await logout();
    // Force game reload after logout
    setTimeout(() => {
      setGameKey(prev => prev + 1);
      setLoading(true);
      setError(null);
    }, 500);
  }, [logout]);

  // Set up wallet connection handlers for WASM
  useEffect(() => {
    wasmBridge.setConnectWalletHandler(async () => {
      console.log('� WASM requested wallet connection');
      await login();
    });

    wasmBridge.setDisconnectWalletHandler(handleLogout);

    // Set up Solana balance handler
    wasmBridge.setGetBalanceHandler(async () => {
      if (!walletAddressString || !rpc) return null;
      try {
        const { value } = await rpc.getBalance(walletAddressString as any).send();
        return Number(value);
      } catch (error) {
        console.error('Error fetching balance:', error);
        return null;
      }
    });

    // TODO: Implement signing and transaction handlers when needed
    wasmBridge.setSignMessageHandler(async (message: string) => {
      console.log('✍️ WASM requested message signing:', message);
      // Implement Solana message signing here
      throw new Error('Message signing not implemented yet');
    });

    wasmBridge.setSendTransactionHandler(async (recipient: string, amount: number) => {
      console.log('💸 WASM requested transaction:', { recipient, amount });
      // Implement Solana transaction sending here
      throw new Error('Transaction sending not implemented yet');
    });
  }, [login, handleLogout, walletAddressString, rpc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clean up previous instance
    if (scriptRef.current && document.body.contains(scriptRef.current)) {
      document.body.removeChild(scriptRef.current);
      scriptRef.current = null;
    }

    if (window.Module) {
      delete window.Module;
    }

    // Reset state
    setLoading(true);
    setError(null);

    // Raylib/Emscripten Module configuration
    window.Module = {
      canvas: canvas,
      printErr: function(text: string) {
        console.error(text);
        if (text.includes('failed') || text.includes('error')) {
          setError(text);
        }
      },
      print: function(text: string) {
        console.log(text);
      },
      setStatus: function(text: string) {
        if (text) {
          console.log('Status:', text);
          if (text.includes('Running...')) {
            setLoading(false);
          }
        }
      },
      monitorRunDependencies: function(left: number) {
        console.log('Dependencies remaining:', left);
        if (left === 0) {
          setLoading(false);
        }
      },
      onRuntimeInitialized: function() {
        console.log('🎮 Game runtime initialized');
        setLoading(false);
      },
    };

    // Load the Emscripten-compiled WebAssembly game
    const script = document.createElement('script');
    script.src = `${gamePath}/game.js?v=${gameKey}`; // Cache busting
    script.async = true;
    scriptRef.current = script;

    script.onload = () => {
      console.log('✅ Raylib game script loaded');
      console.log('✅ PrivyBridge is available to WASM');
    };

    script.onerror = () => {
      setError('Failed to load game script. Make sure game.js exists in the game folder.');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      if (window.Module) {
        delete window.Module;
      }
    };
  }, [gamePath, gameKey]); // Re-run when gameKey changes

  return (
    <div className={styles.gameContainer} key={gameKey}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <h2>Loading Game...</h2>
            <div className={styles.loader}></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className={styles.errorOverlay}>
          <div className={styles.errorContent}>
            <h2>Error Loading Game</h2>
            <p>{error}</p>
            <p className={styles.errorHint}>
              Make sure your Raylib WebGL build files are in <code>/public/game/</code>
              <br />
              Expected files: <code>game.js</code>, <code>game.wasm</code>, <code>game.data</code> (if using resources)
            </p>
          </div>
        </div>
      )}
      
      <canvas 
        ref={canvasRef}
        className={styles.gameCanvas}
        id="canvas"
        width={width}
        height={height}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
