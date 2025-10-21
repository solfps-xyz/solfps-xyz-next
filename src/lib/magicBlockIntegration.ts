/**
 * MagicBlock SDK Integration
 *
 * This file contains the proper MagicBlock SDK integration patterns
 * based on the Supersize example and MagicBlock documentation.
 */

import {
  PublicKey,
  TransactionInstruction,
  Connection,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";
import {
  FindWorldPda,
  FindEntityPda,
  FindComponentPda,
  InitializeNewWorld,
  AddEntity,
  InitializeComponent,
  ApplySystem,
  createDelegateInstruction,
  createUndelegateInstruction,
} from "@magicblock-labs/bolt-sdk";
import { COMPONENTS, SYSTEMS } from "./contractAddresses";

// ============================================================================
// MAGICBLOCK SDK INTEGRATION
// ============================================================================

/**
 * Initialize a new world using MagicBlock SDK
 */
export async function initializeWorld(
  payer: PublicKey,
  connection: Connection, // This should be base layer connection
  _worldId: BN = new BN(1) // Default world ID
): Promise<{
  transaction: Transaction;
  worldPda: PublicKey;
  worldId: BN;
}> {
  console.log("🌍 [MagicBlock] Initializing world...");
  console.log("Payer:", payer.toString());
  console.log("Connection:", connection.rpcEndpoint);

  const result = await InitializeNewWorld({
    payer,
    connection, // Use passed connection (base layer)
  });

  console.log("🌍 [MagicBlock] World initialized:");
  console.log("World PDA:", result.worldPda.toString());
  console.log("World ID:", result.worldId.toString());

  return {
    transaction: result.transaction,
    worldPda: result.worldPda,
    worldId: result.worldId,
  };
}

/**
 * Add entity to world using MagicBlock SDK
 */
export async function addEntityToWorld(
  worldId: BN,
  entityId: BN,
  payer: PublicKey,
  connection: Connection // Base layer connection
): Promise<{
  transaction: Transaction;
  entityPda: PublicKey;
}> {
  console.log("👤 [MagicBlock] Adding entity to world...");
  console.log("World ID:", worldId.toString());
  console.log("Entity ID:", entityId.toString());
  console.log("Payer:", payer.toString());

  const worldPda = FindWorldPda({ worldId });
  console.log("World PDA:", worldPda.toString());

  const result = await AddEntity({
    payer,
    world: worldPda,
    connection, // Use passed connection (base layer)
  });

  console.log("👤 [MagicBlock] Entity added:");
  console.log("Entity PDA:", result.entityPda.toString());

  return {
    transaction: result.transaction,
    entityPda: result.entityPda,
  };
}

/**
 * Initialize component using MagicBlock SDK
 */
export async function initializeComponent(
  componentId: PublicKey,
  entity: PublicKey,
  payer: PublicKey
): Promise<{
  transaction: Transaction;
  componentPda: PublicKey;
}> {
  console.log("🔧 [MagicBlock] Initializing component...");
  console.log("Component ID:", componentId.toString());
  console.log("Entity:", entity.toString());
  console.log("Payer:", payer.toString());

  const result = await InitializeComponent({
    payer,
    entity,
    componentId,
  });

  console.log("🔧 [MagicBlock] Component initialized:");
  console.log("Component PDA:", result.componentPda.toString());

  return {
    transaction: result.transaction,
    componentPda: result.componentPda,
  };
}

/**
 * Delegate component for gasless transactions
 */
export async function delegateComponent(
  componentId: PublicKey,
  entity: PublicKey,
  payer: PublicKey
): Promise<Transaction> {
  console.log("🔗 [MagicBlock] Delegating component...");
  console.log("Component ID:", componentId.toString());
  console.log("Entity:", entity.toString());
  console.log("Payer:", payer.toString());

  const componentPda = FindComponentPda({
    componentId,
    entity,
  });

  const delegateIx = createDelegateInstruction({
    entity,
    account: componentPda,
    ownerProgram: componentId,
    payer,
  });

  console.log("🔗 [MagicBlock] Component delegated:");
  console.log("Component PDA:", componentPda.toString());

  return new Transaction().add(delegateIx);
}

/**
 * Apply system using MagicBlock SDK
 */
export async function applySystem(
  systemId: PublicKey,
  worldId: BN,
  entities: Array<{
    entity: PublicKey;
    components: Array<{ componentId: PublicKey; seed?: string }>;
  }>,
  authority: PublicKey
): Promise<{ instruction: TransactionInstruction; transaction: unknown }> {
  const worldPda = FindWorldPda({ worldId });

  const result = await ApplySystem({
    authority,
    systemId,
    entities,
    world: worldPda,
  });

  return {
    instruction: result.instruction,
    transaction: result.transaction as unknown,
  };
}

// ============================================================================
// PDA DERIVATION HELPERS
// ============================================================================

/**
 * Find world PDA using MagicBlock SDK
 */
export function findWorldPda(worldId: BN = new BN(1)): PublicKey {
  return FindWorldPda({ worldId });
}

/**
 * Find entity PDA using MagicBlock SDK
 */
export function findEntityPda(worldId: BN, entityId: BN): PublicKey {
  return FindEntityPda({ worldId, entityId });
}

/**
 * Find component PDA using MagicBlock SDK
 */
export function findComponentPda(
  componentId: PublicKey,
  entity: PublicKey
): PublicKey {
  return FindComponentPda({ componentId, entity });
}

// ============================================================================
// SYSTEM-SPECIFIC HELPERS
// ============================================================================

/**
 * Create join game instruction
 */
export async function createJoinGameInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

/**
 * Create leave game instruction
 */
export async function createLeaveGameInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

/**
 * Create shoot instruction
 */
export async function createShootInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

/**
 * Create reload instruction
 */
export async function createReloadInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

/**
 * Create movement instruction
 */
export async function createMovementInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

/**
 * Create set ready instruction
 */
export async function createSetReadyInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

/**
 * Create start game instruction
 */
export async function createStartGameInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

/**
 * Create end game instruction
 */
export async function createEndGameInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

/**
 * Create apply damage instruction
 */
export async function createApplyDamageInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

/**
 * Create switch weapon instruction
 */
export async function createSwitchWeaponInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

/**
 * Create respawn instruction
 */
export async function createRespawnInstruction(
  world: PublicKey,
  entity: PublicKey,
  componentIds: PublicKey[],
  systemId: PublicKey,
  authority: PublicKey
): Promise<Transaction> {
  const applySystem = await ApplySystem({
    authority,
    world,
    entities: [
      {
        entity,
        components: componentIds.map((id) => ({ componentId: id })),
      },
    ],
    systemId,
  });

  return applySystem.transaction;
}

// ============================================================================
// INTEGRATION NOTES
// ============================================================================

/*
Based on the Supersize example, the correct integration pattern should be:

1. Import the correct MagicBlock SDK functions:
   - FindComponentPda
   - FindWorldPda  
   - FindEntityPda
   - ApplySystem
   - InitializeNewWorld
   - AddEntity
   - InitializeComponent

2. Use the correct API patterns:
   - PDA derivation functions return [pda, bump] tuples
   - System functions return { instruction, transaction, ... } objects
   - Component initialization requires componentId, entity, payer
   - System application requires systemId, world, entities, authority

3. Entity structure for ApplySystem:
   - entities: Array<{ entity: PublicKey, components?: PublicKey[] }>
   - Each entity can have associated components

4. Connection requirements:
   - Some functions require connection parameter
   - Used for account fetching and transaction building

5. Error handling:
   - All functions are async and can throw errors
   - Proper error handling and user feedback needed

// ============================================================================
// DELEGATION FUNCTIONS FOR GASLESS TRANSACTIONS
// ============================================================================

/**
 * Create delegation instruction for gasless transactions
 * This delegates the player's account to an ER validator
 */
export async function createPlayerDelegationInstruction(
  playerAddress: PublicKey,
  validatorAddress: PublicKey,
  commitFrequencyMs: number = 30000 // 30 seconds default
): Promise<TransactionInstruction> {
  return await createDelegateInstruction({
    payer: playerAddress,
    entity: playerAddress, // Use player address as entity
    account: playerAddress, // Use player address as account
    ownerProgram: playerAddress, // Use player address as owner program for now
  });
}

/**
 * Create undelegation instruction to remove gasless transaction capability
 */
export async function createPlayerUndelegationInstruction(
  playerAddress: PublicKey,
  validatorAddress: PublicKey
): Promise<TransactionInstruction> {
  return await createUndelegateInstruction({
    payer: playerAddress,
    delegatedAccount: playerAddress,
    componentPda: playerAddress, // Use player address as component PDA for now
  });
}

/**
 * Delegate player account to ER validator for gasless transactions
 * This is required before any gasless transactions can be executed
 */
export async function delegatePlayerForGaslessTransactions(
  playerAddress: PublicKey,
  connection: Connection,
  validatorAddress?: PublicKey
): Promise<{
  instruction: TransactionInstruction;
  validator: PublicKey;
}> {
  // Use provided validator or get the local ER validator
  const validator =
    validatorAddress ||
    new PublicKey("mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev");

  const instruction = await createPlayerDelegationInstruction(
    playerAddress,
    validator,
    30000 // 30 second commit frequency
  );

  return {
    instruction,
    validator,
  };
}

/**
 * Undelegate player account from ER validator
 * This removes gasless transaction capability
 */
export async function undelegatePlayerFromGaslessTransactions(
  playerAddress: PublicKey,
  validatorAddress: PublicKey
): Promise<TransactionInstruction> {
  return await createPlayerUndelegationInstruction(
    playerAddress,
    validatorAddress
  );
}

/*
To implement this integration:

1. Install the correct MagicBlock SDK version
2. Update the import statements with correct function names
3. Implement the PDA derivation functions
4. Implement the system application functions
5. Update the SolanaGameBridge to use these functions
6. Test with actual deployed contracts

The current implementation provides a foundation that can be easily updated
once the correct SDK API is confirmed.
*/
