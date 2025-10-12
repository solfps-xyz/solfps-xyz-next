'use client';

import { useEffect, useState } from 'react';
import { wasmBridge } from '@/lib/wasmBridge';

export default function BridgeTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setTestResults([]);
    addResult('🧪 Starting bridge tests...');

    try {
      // Test 1: Check if bridge is initialized
      if (window.PrivyBridge) {
        addResult('✅ PrivyBridge is initialized');
      } else {
        addResult('❌ PrivyBridge not found');
        return;
      }

      // Test 2: Check connection status
      const isConnected = await window.PrivyBridge.isWalletConnected();
      addResult(`🔗 Wallet connected: ${isConnected}`);

      // Test 3: Get user ID
      const userId = await window.PrivyBridge.getUserId();
      addResult(`👤 User ID: ${userId || 'Not logged in'}`);

      // Test 4: Get email
      const email = await window.PrivyBridge.getUserEmail();
      addResult(`📧 Email: ${email || 'Not available'}`);

      // Test 5: Get Solana address
      const solanaAddress = await window.PrivyBridge.getSolanaAddress();
      addResult(`🔑 Solana Address: ${solanaAddress || 'Not connected'}`);

      // Test 6: Get balance (if connected)
      if (solanaAddress) {
        const balance = await window.PrivyBridge.getSolanaBalance();
        addResult(`💰 Balance: ${balance !== null ? `${balance / 1e9} SOL` : 'Error fetching'}`);
      }

      addResult('✅ All tests completed!');
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
  };

  const testConnect = async () => {
    try {
      addResult('🔗 Calling connectWallet...');
      await window.PrivyBridge.connectWallet();
      addResult('✅ Connect wallet called');
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
  };

  const testDisconnect = async () => {
    try {
      addResult('🔌 Calling disconnectWallet...');
      await window.PrivyBridge.disconnectWallet();
      addResult('✅ Disconnect wallet called');
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '1px solid #00ff88',
      borderRadius: '8px',
      padding: '1rem',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 1000,
      color: '#fff',
      fontSize: '12px',
      fontFamily: 'monospace',
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#00ff88' }}>🧪 WASM Bridge Tester</h3>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={runTests} style={buttonStyle}>Run Tests</button>
        <button onClick={testConnect} style={buttonStyle}>Connect</button>
        <button onClick={testDisconnect} style={buttonStyle}>Disconnect</button>
      </div>

      <div style={{
        background: '#000',
        padding: '0.5rem',
        borderRadius: '4px',
        maxHeight: '150px',
        overflow: 'auto',
      }}>
        {testResults.length === 0 ? (
          <p style={{ margin: 0, color: '#666' }}>Click "Run Tests" to start</p>
        ) : (
          testResults.map((result, i) => (
            <div key={i} style={{ marginBottom: '0.25rem' }}>{result}</div>
          ))
        )}
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: 'rgba(0, 255, 136, 0.2)',
  border: '1px solid #00ff88',
  borderRadius: '4px',
  color: '#00ff88',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
};
