'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './UnityGame.module.css';

interface UnityGameProps {
  buildPath?: string;
  width?: string;
  height?: string;
}

declare global {
  interface Window {
    createUnityInstance: any;
  }
}

export default function UnityGame({ 
  buildPath = '/unity/Build',
  width = '100%',
  height = '100vh'
}: UnityGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const unityInstanceRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Unity banner function for warnings/errors
    function unityShowBanner(msg: string, type: string) {
      console.log(`Unity ${type}: ${msg}`);
      if (type === 'error') {
        setError(msg);
      }
    }

    const loaderUrl = `${buildPath}/unity.loader.js`;
    const config = {
      arguments: [],
      dataUrl: `${buildPath}/unity.data`,
      frameworkUrl: `${buildPath}/unity.framework.js`,
      codeUrl: `${buildPath}/unity.wasm`,
      streamingAssetsUrl: "StreamingAssets",
      companyName: "DefaultCompany",
      productName: "solfps_xyz",
      productVersion: "0.1.0",
      showBanner: unityShowBanner,
    };

    // Dynamically load Unity loader script
    const script = document.createElement('script');
    script.src = loaderUrl;
    script.async = true;

    script.onload = () => {
      if (typeof window.createUnityInstance === 'function') {
        window.createUnityInstance(canvas, config, (progress: number) => {
          setProgress(progress * 100);
        })
          .then((unityInstance: any) => {
            unityInstanceRef.current = unityInstance;
            setLoading(false);
            console.log('Unity game loaded successfully');
          })
          .catch((message: string) => {
            setError(`Failed to load Unity game: ${message}`);
            setLoading(false);
            console.error('Unity load error:', message);
          });
      } else {
        setError('createUnityInstance function not found');
        setLoading(false);
      }
    };

    script.onerror = () => {
      setError('Failed to load Unity loader script');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (unityInstanceRef.current) {
        unityInstanceRef.current.Quit?.().catch(() => {});
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [buildPath]);

  return (
    <div className={styles.unityContainer} style={{ width, height }}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <h2>Loading Game...</h2>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p>{Math.round(progress)}%</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className={styles.errorOverlay}>
          <div className={styles.errorContent}>
            <h2>Error Loading Game</h2>
            <p>{error}</p>
            <p className={styles.errorHint}>
              Make sure your Unity WebGL build files are placed in the <code>/public/unity/Build</code> directory.
            </p>
          </div>
        </div>
      )}
      
      <canvas 
        ref={canvasRef} 
        className={styles.unityCanvas}
        id="unity-canvas"
        tabIndex={-1}
      />
    </div>
  );
}
