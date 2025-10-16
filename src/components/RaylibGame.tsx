'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { wasmBridge } from '@/lib/wasmBridge';
import { useSolanaKit } from '@/hooks/useSolanaKit';
import { isMobileDevice } from '@/lib/deviceDetection';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameKey, setGameKey] = useState(0); // Force remount
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { user, login, logout, authenticated } = usePrivy();
  const { walletAddressString, rpc, isConnected } = useSolanaKit();
  const isMobile = isMobileDevice();

  // Update WASM bridge with current user and wallet state
  useEffect(() => {
    wasmBridge.updateUser(user);
  }, [user]);

  // Fullscreen functionality for mobile
  const enterFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    try {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        await (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).mozRequestFullScreen) {
        await (containerRef.current as any).mozRequestFullScreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        await (containerRef.current as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
      
      // Resize canvas to fit fullscreen
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const aspectRatio = width / height;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const screenAspectRatio = screenWidth / screenHeight;
        
        if (screenAspectRatio > aspectRatio) {
          // Screen is wider - fit to height
          canvas.style.width = `${screenHeight * aspectRatio}px`;
          canvas.style.height = `${screenHeight}px`;
        } else {
          // Screen is taller - fit to width
          canvas.style.width = `${screenWidth}px`;
          canvas.style.height = `${screenWidth / aspectRatio}px`;
        }
      }
      
      console.log('📱 Entered fullscreen mode');
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
    }
  }, [width, height]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
      
      // Reset canvas size to default
      if (canvasRef.current) {
        canvasRef.current.style.width = '';
        canvasRef.current.style.height = '';
      }
      
      console.log('📱 Exited fullscreen mode');
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
    }
  }, []);

  // Auto-enter fullscreen on mobile when game loads
  useEffect(() => {
    if (isMobile && !loading && !error && canvasRef.current) {
      // Small delay to ensure game is ready
      const timer = setTimeout(() => {
        enterFullscreen();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isMobile, loading, error, enterFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Reset canvas size when exiting fullscreen
      if (!isCurrentlyFullscreen && canvasRef.current) {
        canvasRef.current.style.width = '';
        canvasRef.current.style.height = '';
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Handle orientation/resize changes in fullscreen
  useEffect(() => {
    if (!isFullscreen || !canvasRef.current) return;
    
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const aspectRatio = width / height;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const screenAspectRatio = screenWidth / screenHeight;
        
        if (screenAspectRatio > aspectRatio) {
          // Screen is wider - fit to height
          canvas.style.width = `${screenHeight * aspectRatio}px`;
          canvas.style.height = `${screenHeight}px`;
        } else {
          // Screen is taller - fit to width
          canvas.style.width = `${screenWidth}px`;
          canvas.style.height = `${screenWidth / aspectRatio}px`;
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Initial resize
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isFullscreen, width, height]);

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
      locateFile: function(path: string, prefix: string) {
        // Handle data file and wasm file paths
        console.log('🔍 Locating file:', path, 'with prefix:', prefix);
        if (path.endsWith('.data') || path.endsWith('.wasm')) {
          const fullPath = `${gamePath}/${path}`;
          console.log('📦 Loading asset file from:', fullPath);
          return fullPath;
        }
        return prefix + path;
      },
      preRun: [],
      postRun: [],
      printErr: function(text: string) {
        console.error('❌ Game Error:', text);
        // Only show critical errors that prevent loading
        if (text.includes('failed to asynchronously prepare wasm') || 
            text.includes('both async and sync fetching') ||
            text.includes('unreachable')) {
          setError(text);
        }
        // Log runtime errors but don't stop the game
        if (text.includes('RuntimeError') || text.includes('index out of bounds')) {
          console.warn('⚠️ Game runtime warning:', text);
        }
      },
      print: function(text: string) {
        console.log('🎮 Game:', text);
      },
      setStatus: function(text: string) {
        if (text) {
          console.log('📊 Status:', text);
          if (text.includes('Running...') || text === '') {
            setLoading(false);
          }
        }
      },
      monitorRunDependencies: function(left: number) {
        console.log('⏳ Dependencies remaining:', left);
        if (left === 0) {
          console.log('✅ All dependencies loaded');
          setLoading(false);
        }
      },
      onRuntimeInitialized: function() {
        console.log('🎮 Game runtime initialized successfully');
        setLoading(false);
      },
      totalDependencies: 0,
      // Add error handler for uncaught exceptions
      onAbort: function(what: any) {
        console.error('💥 Game aborted:', what);
        setError(`Game crashed: ${what}`);
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
    <div 
      ref={containerRef}
      className={`${styles.gameContainer} ${isFullscreen ? styles.fullscreen : ''}`} 
      key={gameKey}
    >
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <h2>Loading Game...</h2>
            <div className={styles.loader}></div>
            {isMobile && <p className={styles.mobileHint}>Tap to enter fullscreen</p>}
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
      
      {/* Fullscreen button for mobile */}
      {isMobile && !loading && !error && (
        <button
          className={styles.fullscreenButton}
          onClick={isFullscreen ? exitFullscreen : enterFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '⬇️' : '⬆️'}
        </button>
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
