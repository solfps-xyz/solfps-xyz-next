"use client";

import React, { useState } from "react";
import { useSolanaGameBridge } from "../hooks/useSolanaGameBridge";
import {
  testMagicBlockIntegration,
  verifyDeployedContracts,
} from "../lib/testIntegration";
import { testFullGameFlow } from "../lib/fullGameFlowTest";

export function SolanaGameBridgeTest() {
  const {
    bridge,
    isConnected,
    isInitialized,
    isLoading,
    error,
    gameState,
    connect,
    disconnect,
    initPlayer,
    initGame,
    joinGame,
    leaveGame,
    setReady,
    startGame,
    endGame,
    shoot,
    reload,
    switchWeapon,
    respawn,
    debugWallet,
  } = useSolanaGameBridge();

  const [gameAddress, setGameAddress] = useState("");
  const [weaponSlot, setWeaponSlot] = useState(1);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runIntegrationTest = async () => {
    setTestResults([]);
    const results: string[] = [];

    try {
      results.push("🧪 Running MagicBlock SDK Integration Test...");
      const integrationTest = await testMagicBlockIntegration();
      results.push(
        integrationTest
          ? "✅ Integration test passed!"
          : "❌ Integration test failed!"
      );

      results.push("🔍 Verifying deployed contracts...");
      const contractTest = await verifyDeployedContracts();
      results.push(
        contractTest
          ? "✅ Contract verification passed!"
          : "❌ Contract verification failed!"
      );
    } catch (error) {
      results.push(`❌ Test error: ${error}`);
    }

    setTestResults(results);
  };

  const runFullGameFlow = async () => {
    if (!bridge) {
      setTestResults(["❌ Bridge not initialized"]);
      return;
    }

    setTestResults([]);
    const results: string[] = [];

    try {
      results.push("🎮 Running Full Game Flow Test...");
      setTestResults([...results]);

      const success = await testFullGameFlow(bridge);
      results.push(
        success ? "🎉 Full game flow completed!" : "❌ Full game flow failed"
      );
    } catch (error) {
      results.push(`❌ Test error: ${error}`);
    }

    setTestResults(results);
  };

  if (!isConnected) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          SolFPS Game Bridge
        </h2>
        <p className="text-gray-600 mb-4">
          Connect your wallet to start playing
        </p>
        <button
          onClick={connect}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">SolFPS Game Bridge</h2>
        <button
          onClick={disconnect}
          disabled={isLoading}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Disconnect
        </button>
      </div>

      {/* Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Connected:</span>{" "}
            {isConnected ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">Initialized:</span>{" "}
            {isInitialized ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">In Game:</span>{" "}
            {gameState.isInGame ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">Ready:</span>{" "}
            {gameState.isReady ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">Health:</span> {gameState.health}/
            {gameState.maxHealth}
          </div>
          <div>
            <span className="font-medium">Ammo:</span> {gameState.ammo}/
            {gameState.maxAmmo}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Game Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Initialization */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Initialization</h3>
          <div className="space-y-2">
            <button
              onClick={runIntegrationTest}
              className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              🧪 Test Integration
            </button>
            <button
              onClick={() => {
                setTestResults([
                  "🔧 Running wallet diagnostics... Check browser console for details.",
                ]);
                try {
                  debugWallet();
                } catch {}
              }}
              className="w-full bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
            >
              🔧 Debug Wallet
            </button>
            <button
              onClick={runFullGameFlow}
              disabled={isLoading || !isConnected}
              className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              🎮 Test Full Game Flow
            </button>
            <button
              onClick={initPlayer}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Initialize Player"}
            </button>
            <button
              onClick={initGame}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Initialize Game"}
            </button>
          </div>
        </div>

        {/* Lobby Management */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Lobby Management</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Game Address"
                value={gameAddress}
                onChange={(e) => setGameAddress(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={() => joinGame(gameAddress)}
                disabled={isLoading || !gameAddress}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Join
              </button>
            </div>
            <button
              onClick={leaveGame}
              disabled={isLoading || !gameState.isInGame}
              className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Leave Game
            </button>
            <button
              onClick={() => setReady(!gameState.isReady)}
              disabled={isLoading || !gameState.isInGame}
              className="w-full bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {gameState.isReady ? "Unready" : "Ready Up"}
            </button>
            <button
              onClick={startGame}
              disabled={isLoading || !gameState.isInGame}
              className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Start Game
            </button>
            <button
              onClick={endGame}
              disabled={isLoading || !gameState.isInGame}
              className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              End Game
            </button>
          </div>
        </div>

        {/* Combat */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Combat</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={weaponSlot}
                onChange={(e) => setWeaponSlot(Number(e.target.value))}
                className="px-3 py-2 border rounded"
              >
                <option value={1}>Primary Weapon</option>
                <option value={2}>Secondary Weapon</option>
              </select>
              <button
                onClick={() => shoot(weaponSlot)}
                disabled={isLoading || !gameState.isInGame}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Shoot
              </button>
            </div>
            <button
              onClick={() => reload(weaponSlot)}
              disabled={isLoading || !gameState.isInGame}
              className="w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Reload
            </button>
            <button
              onClick={() => switchWeapon(weaponSlot)}
              disabled={isLoading || !gameState.isInGame}
              className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Switch Weapon
            </button>
            <button
              onClick={respawn}
              disabled={isLoading || !gameState.isInGame}
              className="w-full bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Respawn
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Test Results</h3>
            <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Debug Info</h3>
          <div className="text-xs space-y-1">
            <div>
              <strong>Bridge:</strong>{" "}
              {bridge ? "Initialized" : "Not initialized"}
            </div>
            <div>
              <strong>Player Address:</strong>{" "}
              {gameState.playerAddress || "Not set"}
            </div>
            <div>
              <strong>Game Address:</strong>{" "}
              {gameState.gameAddress || "Not set"}
            </div>
            <div>
              <strong>World ID:</strong>{" "}
              {gameState.worldId?.toString() || "Not set"}
            </div>
            <div>
              <strong>Entity ID:</strong>{" "}
              {gameState.entityId?.toString() || "Not set"}
            </div>
            <div>
              <strong>Current Weapon:</strong> {gameState.currentWeapon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
