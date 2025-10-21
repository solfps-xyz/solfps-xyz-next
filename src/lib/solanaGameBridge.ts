"use client";
import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import BN from "bn.js";
import { COMPONENTS, SYSTEMS } from "./contractAddresses";
import {
  initializeWorld,
  addEntityToWorld,
  initializeComponent,
  delegateComponent,
  createJoinGameInstruction,
  createLeaveGameInstruction,
  createSetReadyInstruction,
  createStartGameInstruction,
  createEndGameInstruction,
  createShootInstruction,
  createReloadInstruction,
  createApplyDamageInstruction,
  createSwitchWeaponInstruction,
  createRespawnInstruction,
  createMovementInstruction,
  findWorldPda,
  findEntityPda,
  delegatePlayerForGaslessTransactions,
  undelegatePlayerFromGaslessTransactions,
} from "./magicBlockIntegration";

// ============================================================================
// TYPES
// ============================================================================

export interface GameBridgeConfig {
  wallet: {
    publicKey: PublicKey;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
  };
  baseProvider: AnchorProvider; // localhost:8899 for initialization
  erProvider: AnchorProvider; // localhost:7799 for systems
  worldId?: BN; // World ID for ECS
  entityId?: BN; // Entity ID for player
}

export interface GameState {
  playerAddress?: PublicKey;
  gameAddress?: PublicKey;
  worldId?: BN;
  entityId?: BN;
  isInGame: boolean;
  isReady: boolean;
  health: number;
  maxHealth: number;
  currentWeapon: number;
  ammo: number;
  maxAmmo: number;
}

// ============================================================================
// SOLANA GAME BRIDGE CLASS
// ============================================================================

export class SolanaGameBridge {
  private config: GameBridgeConfig;
  private gameState: GameState;

  constructor(config: GameBridgeConfig) {
    this.config = config;
    this.gameState = {
      worldId: config.worldId || new BN(1), // Default world ID
      entityId: config.entityId || new BN(1), // Default entity ID
      isInGame: false,
      isReady: false,
      health: 100,
      maxHealth: 100,
      currentWeapon: 1,
      ammo: 30,
      maxAmmo: 30,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  // ============================================================================
  // INITIALIZATION METHODS
  // ============================================================================

  /**
   * Initialize player - creates player account and components
   */
  async initPlayer(): Promise<void> {
    try {
      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      console.log("🎮 [InitPlayer] Starting player initialization...");
      console.log("Player Address:", playerAddress.toString());
      console.log("World ID:", worldId.toString());
      console.log("Entity ID:", entityId.toString());
      console.log(
        "Using base layer for initialization:",
        this.config.baseProvider.connection.rpcEndpoint
      );

      // Step 1: Initialize world on base layer
      console.log("🌍 [InitPlayer] Step 1: Initializing world...");
      const worldResult = await initializeWorld(
        playerAddress,
        this.config.baseProvider.connection,
        worldId
      );
      await this.config.baseProvider.sendAndConfirm(worldResult.transaction);
      console.log("✅ World initialized successfully");
      console.log("World PDA:", worldResult.worldPda.toString());

      // Step 2: Add entity on base layer
      console.log("👤 [InitPlayer] Step 2: Adding entity to world...");
      const entityResult = await addEntityToWorld(
        worldId,
        entityId,
        playerAddress,
        this.config.baseProvider.connection
      );
      await this.config.baseProvider.sendAndConfirm(entityResult.transaction);
      console.log("✅ Entity added to world successfully");
      console.log("Entity PDA:", entityResult.entityPda.toString());

      // Step 3: Initialize components on base layer
      console.log("🔧 [InitPlayer] Step 3: Initializing components...");
      const componentTypes = [
        COMPONENTS.PLAYER,
        COMPONENTS.HEALTH,
        COMPONENTS.WEAPON,
        COMPONENTS.POSITION,
        COMPONENTS.PLAYER_STATS,
      ];

      for (const componentId of componentTypes) {
        console.log(`🔧 [InitPlayer] Initializing component: ${componentId}`);
        // Initialize component
        const componentResult = await initializeComponent(
          componentId,
          entityResult.entityPda,
          playerAddress
        );
        await this.config.baseProvider.sendAndConfirm(
          componentResult.transaction
        );
        console.log(`✅ Component ${componentId} initialized successfully`);
        console.log(
          `Component PDA: ${componentResult.componentPda.toString()}`
        );

        // Immediately delegate component
        console.log(`🔗 [InitPlayer] Delegating component: ${componentId}`);
        const delegateTx = await delegateComponent(
          componentId,
          entityResult.entityPda,
          playerAddress
        );
        await this.config.baseProvider.sendAndConfirm(delegateTx);
        console.log(`✅ Component ${componentId} delegated successfully`);
      }

      this.gameState.playerAddress = playerAddress;
      this.gameState.worldId = worldId;
      this.gameState.entityId = entityId;
      console.log("🎉 [InitPlayer] Player initialized successfully!");
    } catch (error) {
      console.error("❌ [InitPlayer] Failed to initialize player:", error);
      throw error;
    }
  }

  /**
   * Initialize game - creates game/lobby
   */
  async initGame(): Promise<void> {
    try {
      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      // Initialize game component on ER validator (gasless)
      const entityPda = findEntityPda(worldId, entityId);
      const gameComponentResult = await initializeComponent(
        COMPONENTS.GAME,
        entityPda,
        playerAddress
      );
      await this.config.baseProvider.sendAndConfirm(
        gameComponentResult.transaction
      );

      this.gameState.gameAddress = findWorldPda(worldId);
      console.log("Game initialized successfully");
    } catch (error) {
      console.error("Failed to initialize game:", error);
      throw error;
    }
  }

  // ============================================================================
  // LOBBY METHODS
  // ============================================================================

  /**
   * Join an existing game
   */
  async joinGame(gameAddress: string): Promise<void> {
    try {
      const gamePubkey = new PublicKey(gameAddress);
      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createJoinGameInstruction(
        worldPda,
        entityPda,
        [COMPONENTS.PLAYER, COMPONENTS.GAME],
        SYSTEMS.JOIN_GAME,
        playerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider
      this.gameState.gameAddress = gamePubkey;
      this.gameState.isInGame = true;
      this.gameState.isReady = false;
      console.log("Joined game successfully");
    } catch (error) {
      console.error("Failed to join game:", error);
      throw error;
    }
  }

  /**
   * Leave current game
   */
  async leaveGame(): Promise<void> {
    try {
      if (!this.gameState.isInGame) {
        throw new Error("Not in a game");
      }

      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createLeaveGameInstruction(
        worldPda,
        entityPda,
        [COMPONENTS.PLAYER, COMPONENTS.GAME],
        SYSTEMS.LEAVE_GAME,
        playerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider

      this.gameState.isInGame = false;
      this.gameState.isReady = false;
      this.gameState.gameAddress = undefined;
      console.log("Left game successfully");
    } catch (error) {
      console.error("Failed to leave game:", error);
      throw error;
    }
  }

  /**
   * Set ready status
   */
  async setReady(isReady: boolean): Promise<void> {
    try {
      if (!this.gameState.isInGame) {
        throw new Error("Not in a game");
      }

      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createSetReadyInstruction(
        worldPda,
        entityPda,
        [COMPONENTS.PLAYER, COMPONENTS.GAME],
        SYSTEMS.SET_READY,
        playerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider

      this.gameState.isReady = isReady;
      console.log(`Ready status set to: ${isReady}`);
    } catch (error) {
      console.error("Failed to set ready status:", error);
      throw error;
    }
  }

  /**
   * Start game (lobby owner only)
   */
  async startGame(): Promise<void> {
    try {
      if (!this.gameState.isInGame) {
        throw new Error("Not in a game");
      }

      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createStartGameInstruction(
        worldPda,
        entityPda,
        [COMPONENTS.PLAYER, COMPONENTS.GAME],
        SYSTEMS.START_GAME,
        playerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider
      console.log("Game started successfully");
    } catch (error) {
      console.error("Failed to start game:", error);
      throw error;
    }
  }

  /**
   * End game
   */
  async endGame(): Promise<void> {
    try {
      if (!this.gameState.isInGame) {
        throw new Error("Not in a game");
      }

      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createEndGameInstruction(
        worldPda,
        entityPda,
        [COMPONENTS.PLAYER, COMPONENTS.GAME],
        SYSTEMS.END_GAME,
        playerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider

      this.gameState.isInGame = false;
      this.gameState.isReady = false;
      console.log("Game ended successfully");
    } catch (error) {
      console.error("Failed to end game:", error);
      throw error;
    }
  }

  // ============================================================================
  // COMBAT METHODS
  // ============================================================================

  /**
   * Shoot weapon
   */
  async shoot(weaponSlot: number): Promise<void> {
    try {
      if (!this.gameState.isInGame) {
        throw new Error("Not in a game");
      }

      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createShootInstruction(
        worldPda,
        entityPda,
        [COMPONENTS.PLAYER, COMPONENTS.WEAPON, COMPONENTS.POSITION],
        SYSTEMS.SHOOT,
        playerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider

      // Update local ammo count
      if (weaponSlot === this.gameState.currentWeapon) {
        this.gameState.ammo = Math.max(0, this.gameState.ammo - 1);
      }
      console.log(`Shot weapon ${weaponSlot}`);
    } catch (error) {
      console.error("Failed to shoot:", error);
      throw error;
    }
  }

  /**
   * Reload weapon
   */
  async reload(weaponSlot: number): Promise<void> {
    try {
      if (!this.gameState.isInGame) {
        throw new Error("Not in a game");
      }

      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createReloadInstruction(
        worldPda,
        entityPda,
        [COMPONENTS.PLAYER, COMPONENTS.WEAPON],
        SYSTEMS.RELOAD,
        playerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider

      // Update local ammo count
      if (weaponSlot === this.gameState.currentWeapon) {
        this.gameState.ammo = this.gameState.maxAmmo;
      }
      console.log(`Reloaded weapon ${weaponSlot}`);
    } catch (error) {
      console.error("Failed to reload:", error);
      throw error;
    }
  }

  /**
   * Apply damage to victim
   */
  async applyDamage(
    victimAddress: string,
    weaponType: number,
    isHeadshot: boolean,
    distance: number
  ): Promise<void> {
    try {
      if (!this.gameState.isInGame) {
        throw new Error("Not in a game");
      }

      const attackerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createApplyDamageInstruction(
        worldPda,
        entityPda,
        [
          COMPONENTS.PLAYER,
          COMPONENTS.WEAPON,
          COMPONENTS.HEALTH,
          COMPONENTS.PLAYER_STATS,
          COMPONENTS.POSITION,
          COMPONENTS.GAME,
        ],
        SYSTEMS.APPLY_DAMAGE,
        attackerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider
      console.log(`Applied damage to ${victimAddress}`);
    } catch (error) {
      console.error("Failed to apply damage:", error);
      throw error;
    }
  }

  /**
   * Switch weapon
   */
  async switchWeapon(weaponSlot: number): Promise<void> {
    try {
      if (!this.gameState.isInGame) {
        throw new Error("Not in a game");
      }

      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createSwitchWeaponInstruction(
        worldPda,
        entityPda,
        [COMPONENTS.WEAPON],
        SYSTEMS.SWITCH_WEAPON,
        playerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider

      this.gameState.currentWeapon = weaponSlot;
      console.log(`Switched to weapon ${weaponSlot}`);
    } catch (error) {
      console.error("Failed to switch weapon:", error);
      throw error;
    }
  }

  /**
   * Respawn player
   */
  async respawn(): Promise<void> {
    try {
      if (!this.gameState.isInGame) {
        throw new Error("Not in a game");
      }

      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createRespawnInstruction(
        worldPda,
        entityPda,
        [COMPONENTS.PLAYER, COMPONENTS.HEALTH, COMPONENTS.POSITION],
        SYSTEMS.RESPAWN,
        playerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider

      this.gameState.health = this.gameState.maxHealth;
      console.log("Player respawned");
    } catch (error) {
      console.error("Failed to respawn:", error);
      throw error;
    }
  }

  // ============================================================================
  // MOVEMENT METHODS
  // ============================================================================

  /**
   * Update player movement
   */
  async updateMovement(
    x: number,
    y: number,
    z: number,
    rotation: number,
    velocityX: number,
    velocityY: number,
    velocityZ: number
  ): Promise<void> {
    try {
      if (!this.gameState.isInGame) {
        throw new Error("Not in a game");
      }

      const playerAddress = this.getPlayerAddress();
      const worldId = this.gameState.worldId!;
      const entityId = this.gameState.entityId!;

      const worldPda = findWorldPda(worldId);
      const entityPda = findEntityPda(worldId, entityId);

      const tx = await createMovementInstruction(
        worldPda,
        entityPda,
        [COMPONENTS.PLAYER, COMPONENTS.POSITION],
        SYSTEMS.MOVEMENT,
        playerAddress
      );

      await this.config.erProvider.sendAndConfirm(tx); // Use ER provider
    } catch (error) {
      console.error("Failed to update movement:", error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get current player address
   */
  private getPlayerAddress(): PublicKey {
    return this.config.wallet.publicKey;
  }

  /**
   * Get world address (derived from world ID)
   */
  private getWorldAddress(): PublicKey {
    return findWorldPda(this.gameState.worldId!);
  }

  // ============================================================================
  // STATE GETTERS
  // ============================================================================

  getGameState(): GameState {
    return { ...this.gameState };
  }

  isConnected(): boolean {
    return !!this.config.wallet?.publicKey;
  }

  isInGame(): boolean {
    return this.gameState.isInGame;
  }

  // ============================================================================
  // DELEGATION METHODS FOR GASLESS TRANSACTIONS
  // ============================================================================

  /**
   * Delegate player account to ER validator for gasless transactions
   * This must be called before any gasless transactions can be executed
   */
  async delegateForGaslessTransactions(
    validatorAddress?: PublicKey
  ): Promise<void> {
    try {
      const playerAddress = this.getPlayerAddress();
      const transaction = new Transaction();

      // Create delegation instruction
      const delegationResult = await delegatePlayerForGaslessTransactions(
        playerAddress,
        this.config.baseProvider.connection,
        validatorAddress
      );

      transaction.add(delegationResult.instruction);

      // Send delegation transaction on ER validator (gasless)
      await this.config.baseProvider.sendAndConfirm(transaction);

      console.log("✅ Player delegated for gasless transactions");
      console.log("Validator:", delegationResult.validator.toString());
    } catch (error) {
      console.error("Failed to delegate for gasless transactions:", error);
      throw error;
    }
  }

  /**
   * Undelegate player account from ER validator
   * This removes gasless transaction capability
   */
  async undelegateFromGaslessTransactions(
    validatorAddress: PublicKey
  ): Promise<void> {
    try {
      const playerAddress = this.getPlayerAddress();
      const transaction = new Transaction();

      // Create undelegation instruction
      const undelegationInstruction =
        await undelegatePlayerFromGaslessTransactions(
          playerAddress,
          validatorAddress
        );

      transaction.add(undelegationInstruction);

      // Send undelegation transaction on ER validator (gasless)
      await this.config.baseProvider.sendAndConfirm(transaction);

      console.log("✅ Player undelegated from gasless transactions");
    } catch (error) {
      console.error("Failed to undelegate from gasless transactions:", error);
      throw error;
    }
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

// Global instance that will be initialized by the frontend
export let solanaGameBridge: SolanaGameBridge | null = null;

/**
 * Initialize the global SolanaGameBridge instance
 */
export function initializeSolanaGameBridge(
  config: GameBridgeConfig
): SolanaGameBridge {
  solanaGameBridge = new SolanaGameBridge(config);

  // Make it available globally for the C++ WASM bridge
  if (typeof window !== "undefined") {
    (window as { SolanaGameBridge?: SolanaGameBridge }).SolanaGameBridge =
      solanaGameBridge;
  }

  return solanaGameBridge;
}

/**
 * Get the global SolanaGameBridge instance
 */
export function getSolanaGameBridge(): SolanaGameBridge | null {
  return solanaGameBridge;
}
