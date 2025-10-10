'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    };

    // Load the Emscripten-compiled WebAssembly game
    const script = document.createElement('script');
    script.src = `${gamePath}/game.js`; // Typical Raylib output name
    script.async = true;

    script.onload = () => {
      console.log('Raylib game script loaded');
    };

    script.onerror = () => {
      setError('Failed to load game script. Make sure game.js exists in the game folder.');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (window.Module) {
        delete window.Module;
      }
    };
  }, [gamePath]);

  return (
    <div className={styles.gameContainer}>
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
