import { useEffect, useState, useCallback, useRef } from "react";
import { Connection, Transaction, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import BN from "bn.js";
import {
  SolanaGameBridge,
  initializeSolanaGameBridge,
  GameState,
} from "../lib/solanaGameBridge";
import { NETWORK_CONFIG } from "../lib/contractAddresses";

// ============================================================================
// TYPES
// ============================================================================

export interface UseSolanaGameBridgeReturn {
  // Bridge instance
  bridge: SolanaGameBridge | null;

  // Connection state
  isConnected: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Game state
  gameState: GameState;

  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;

  // Game methods
  initPlayer: () => Promise<void>;
  initGame: () => Promise<void>;
  joinGame: (gameAddress: string) => Promise<void>;
  leaveGame: () => Promise<void>;
  setReady: (isReady: boolean) => Promise<void>;
  startGame: () => Promise<void>;
  endGame: () => Promise<void>;

  // Combat methods
  shoot: (weaponSlot: number) => Promise<void>;
  reload: (weaponSlot: number) => Promise<void>;
  applyDamage: (
    victimAddress: string,
    weaponType: number,
    isHeadshot: boolean,
    distance: number
  ) => Promise<void>;
  switchWeapon: (weaponSlot: number) => Promise<void>;
  respawn: () => Promise<void>;

  // Movement methods
  updateMovement: (
    x: number,
    y: number,
    z: number,
    rotation: number,
    velocityX: number,
    velocityY: number,
    velocityZ: number
  ) => Promise<void>;

  // Delegation for gasless transactions
  delegateForGaslessTransactions: (
    validatorAddress?: PublicKey
  ) => Promise<void>;
  undelegateFromGaslessTransactions: (
    validatorAddress: PublicKey
  ) => Promise<void>;

  // Diagnostics
  debugWallet: () => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useSolanaGameBridge(): UseSolanaGameBridgeReturn {
  // Generate a random wallet for testing
  const [randomWallet] = useState(() => Keypair.generate());

  // Use refs to store latest values and prevent infinite loops
  const walletRef = useRef(randomWallet);
  walletRef.current = randomWallet;

  // State
  const [bridge, setBridge] = useState<SolanaGameBridge | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    isInGame: false,
    isReady: false,
    health: 100,
    maxHealth: 100,
    currentWeapon: 1,
    ammo: 30,
    maxAmmo: 30,
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const cleanup = useCallback(() => {
    setBridge(null);
    setIsInitialized(false);
    setError(null);
    setGameState({
      isInGame: false,
      isReady: false,
      health: 100,
      maxHealth: 100,
      currentWeapon: 1,
      ammo: 30,
      maxAmmo: 30,
    });
  }, []);

  const initializeConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create wallet adapter using random wallet
      const walletAdapter = {
        publicKey: walletRef.current.publicKey,
        signTransaction: async (
          transaction: Transaction
        ): Promise<Transaction> => {
          // Sign with the random wallet
          transaction.sign(walletRef.current);
          return transaction;
        },
      };

      console.log(
        "[Wallet] Random wallet connected:",
        walletAdapter.publicKey.toString()
      );

      // Create wallet adapter for Anchor
      const anchorWallet: Wallet = {
        publicKey: walletAdapter.publicKey,
        signTransaction: async <T extends Transaction | any>(
          tx: T
        ): Promise<T> => {
          if ("sign" in tx) {
            tx.sign(walletRef.current);
          }
          return tx;
        },
        signAllTransactions: async <T extends Transaction | any>(
          txs: T[]
        ): Promise<T[]> => {
          return txs.map((tx) => {
            if ("sign" in tx) {
              tx.sign(walletRef.current);
            }
            return tx;
          });
        },
      };

      // Create base layer connection (localhost:8899) for initialization
      const baseConnection = new Connection(
        "http://localhost:8899",
        "confirmed"
      );
      const baseProvider = new AnchorProvider(baseConnection, anchorWallet, {
        commitment: "confirmed",
      });

      // Create ER connection (localhost:7799) for system calls
      const erConnection = new Connection(
        NETWORK_CONFIG.EPHEMERAL_ROLLUP_LOCAL.RPC_URL,
        "confirmed"
      );

      console.log("ER Connection:", erConnection.rpcEndpoint);
      const erProvider = new AnchorProvider(erConnection, anchorWallet, {
        commitment: "confirmed",
      });

      console.log(
        "[Provider] Base layer for initialization:",
        baseProvider.connection.rpcEndpoint
      );
      console.log(
        "[Provider] ER layer for systems:",
        erProvider.connection.rpcEndpoint
      );

      // Initialize SolanaGameBridge
      const newBridge = initializeSolanaGameBridge({
        wallet: walletAdapter,
        baseProvider,
        erProvider,
        worldId: new BN(1),
        entityId: new BN(1),
      });

      setBridge(newBridge);
      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize SolanaGameBridge:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auto-initialize with random wallet
    initializeConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initialize once on mount

  // ============================================================================
  // CONNECTION METHODS
  // ============================================================================

  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Generate new random wallet
      const newWallet = Keypair.generate();
      walletRef.current = newWallet;
      await initializeConnection();
    } catch (err) {
      console.error("Failed to connect:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setIsLoading(false);
    }
  }, [initializeConnection]);

  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      cleanup();
    } catch (err) {
      console.error("Failed to disconnect:", err);
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setIsLoading(false);
    }
  }, [cleanup]);

  // ============================================================================
  // GAME METHODS
  // ============================================================================

  const initPlayer = useCallback(async () => {
    if (!bridge) throw new Error("Bridge not initialized");
    try {
      setIsLoading(true);
      setError(null);
      await bridge.initPlayer();
      setGameState(bridge.getGameState());
    } catch (err) {
      console.error("Failed to initialize player:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize player"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [bridge]);

  const initGame = useCallback(async () => {
    if (!bridge) throw new Error("Bridge not initialized");
    try {
      setIsLoading(true);
      setError(null);
      await bridge.initGame();
      setGameState(bridge.getGameState());
    } catch (err) {
      console.error("Failed to initialize game:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize game"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [bridge]);

  const joinGame = useCallback(
    async (gameAddress: string) => {
      if (!bridge) throw new Error("Bridge not initialized");
      try {
        setIsLoading(true);
        setError(null);
        await bridge.joinGame(gameAddress);
        setGameState(bridge.getGameState());
      } catch (err) {
        console.error("Failed to join game:", err);
        setError(err instanceof Error ? err.message : "Failed to join game");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [bridge]
  );

  const leaveGame = useCallback(async () => {
    if (!bridge) throw new Error("Bridge not initialized");
    try {
      setIsLoading(true);
      setError(null);
      await bridge.leaveGame();
      setGameState(bridge.getGameState());
    } catch (err) {
      console.error("Failed to leave game:", err);
      setError(err instanceof Error ? err.message : "Failed to leave game");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [bridge]);

  const setReady = useCallback(
    async (isReady: boolean) => {
      if (!bridge) throw new Error("Bridge not initialized");
      try {
        setIsLoading(true);
        setError(null);
        await bridge.setReady(isReady);
        setGameState(bridge.getGameState());
      } catch (err) {
        console.error("Failed to set ready status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to set ready status"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [bridge]
  );

  const startGame = useCallback(async () => {
    if (!bridge) throw new Error("Bridge not initialized");
    try {
      setIsLoading(true);
      setError(null);
      await bridge.startGame();
      setGameState(bridge.getGameState());
    } catch (err) {
      console.error("Failed to start game:", err);
      setError(err instanceof Error ? err.message : "Failed to start game");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [bridge]);

  const endGame = useCallback(async () => {
    if (!bridge) throw new Error("Bridge not initialized");
    try {
      setIsLoading(true);
      setError(null);
      await bridge.endGame();
      setGameState(bridge.getGameState());
    } catch (err) {
      console.error("Failed to end game:", err);
      setError(err instanceof Error ? err.message : "Failed to end game");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [bridge]);

  // ============================================================================
  // COMBAT METHODS
  // ============================================================================

  const shoot = useCallback(
    async (weaponSlot: number) => {
      if (!bridge) throw new Error("Bridge not initialized");
      try {
        await bridge.shoot(weaponSlot);
        setGameState(bridge.getGameState());
      } catch (err) {
        console.error("Failed to shoot:", err);
        setError(err instanceof Error ? err.message : "Failed to shoot");
        throw err;
      }
    },
    [bridge]
  );

  const reload = useCallback(
    async (weaponSlot: number) => {
      if (!bridge) throw new Error("Bridge not initialized");
      try {
        await bridge.reload(weaponSlot);
        setGameState(bridge.getGameState());
      } catch (err) {
        console.error("Failed to reload:", err);
        setError(err instanceof Error ? err.message : "Failed to reload");
        throw err;
      }
    },
    [bridge]
  );

  const applyDamage = useCallback(
    async (
      victimAddress: string,
      weaponType: number,
      isHeadshot: boolean,
      distance: number
    ) => {
      if (!bridge) throw new Error("Bridge not initialized");
      try {
        await bridge.applyDamage(
          victimAddress,
          weaponType,
          isHeadshot,
          distance
        );
        setGameState(bridge.getGameState());
      } catch (err) {
        console.error("Failed to apply damage:", err);
        setError(err instanceof Error ? err.message : "Failed to apply damage");
        throw err;
      }
    },
    [bridge]
  );

  const switchWeapon = useCallback(
    async (weaponSlot: number) => {
      if (!bridge) throw new Error("Bridge not initialized");
      try {
        await bridge.switchWeapon(weaponSlot);
        setGameState(bridge.getGameState());
      } catch (err) {
        console.error("Failed to switch weapon:", err);
        setError(
          err instanceof Error ? err.message : "Failed to switch weapon"
        );
        throw err;
      }
    },
    [bridge]
  );

  const respawn = useCallback(async () => {
    if (!bridge) throw new Error("Bridge not initialized");
    try {
      await bridge.respawn();
      setGameState(bridge.getGameState());
    } catch (err) {
      console.error("Failed to respawn:", err);
      setError(err instanceof Error ? err.message : "Failed to respawn");
      throw err;
    }
  }, [bridge]);

  // ============================================================================
  // MOVEMENT METHODS
  // ============================================================================

  const updateMovement = useCallback(
    async (
      x: number,
      y: number,
      z: number,
      rotation: number,
      velocityX: number,
      velocityY: number,
      velocityZ: number
    ) => {
      if (!bridge) throw new Error("Bridge not initialized");
      try {
        await bridge.updateMovement(
          x,
          y,
          z,
          rotation,
          velocityX,
          velocityY,
          velocityZ
        );
      } catch (err) {
        console.error("Failed to update movement:", err);
        // Don't set error for movement failures as they're frequent
      }
    },
    [bridge]
  );

  // ============================================================================
  // DELEGATION METHODS FOR GASLESS TRANSACTIONS
  // ============================================================================

  const delegateForGaslessTransactions = useCallback(
    async (validatorAddress?: PublicKey) => {
      if (!bridge) {
        throw new Error("Bridge not initialized");
      }
      await bridge.delegateForGaslessTransactions(validatorAddress);
    },
    [bridge]
  );

  const undelegateFromGaslessTransactions = useCallback(
    async (validatorAddress: PublicKey) => {
      if (!bridge) {
        throw new Error("Bridge not initialized");
      }
      await bridge.undelegateFromGaslessTransactions(validatorAddress);
    },
    [bridge]
  );

  // Diagnostics
  const debugWallet = useCallback(() => {
    console.log("=== Random Wallet Debug Info ===");
    console.log("Wallet Address:", walletRef.current.publicKey.toString());
    console.log("Bridge Initialized:", isInitialized);

    if (bridge) {
      console.log("Game State:", bridge.getGameState());
    }
  }, [bridge, isInitialized]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Bridge instance
    bridge,

    // Connection state
    isConnected: isInitialized,
    isInitialized,
    isLoading,
    error,

    // Game state
    gameState,

    // Connection methods
    connect,
    disconnect,

    // Game methods
    initPlayer,
    initGame,
    joinGame,
    leaveGame,
    setReady,
    startGame,
    endGame,

    // Combat methods
    shoot,
    reload,
    applyDamage,
    switchWeapon,
    respawn,

    // Movement methods
    updateMovement,

    // Delegation for gasless transactions
    delegateForGaslessTransactions,
    undelegateFromGaslessTransactions,

    // Diagnostics
    debugWallet,
  };
}
