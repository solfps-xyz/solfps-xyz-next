import { PublicKey } from "@solana/web3.js";

// ============================================================================
// COMPONENT ADDRESSES
// ============================================================================

// Core Game Components
export const GAME_COMPONENT = new PublicKey(
  "DyjiisyNGjj2vb5SG5Upf2v4Q63rSbGax6vpEiXUVeut"
);
export const PLAYER_COMPONENT = new PublicKey(
  "5r3VuhkgUJj1ToYPVhZfD7e88e6AEnqhPURtRso9aCeh"
);
export const HEALTH_COMPONENT = new PublicKey(
  "ELyBMdiFKysGvm3u2KFCqJoiD4YcCY5qWtRxCjaaLm5W"
);
export const WEAPON_COMPONENT = new PublicKey(
  "3Dw1S5VX8QbyvxTmjgaLViRqKATh2PYX5bjSP6bpkHLc"
);
export const POSITION_COMPONENT = new PublicKey(
  "CDFTYv8oBAgpduT7vcUFRE32d3Wypuj6r7AwchfXEs4k"
);
export const PLAYER_STATS_COMPONENT = new PublicKey(
  "51PMj35BCPyHeKhJLmxF6i22cKkasitfZPhSVbmX9d8m"
);

// ============================================================================
// SYSTEM ADDRESSES
// ============================================================================

// Initialization Systems
export const INIT_PLAYER = new PublicKey(
  "FwwTc1UnMYDj2P7eHby2GVtxdP7gQaq8XnPUPZHoJNfy"
);
export const INIT_GAME = new PublicKey(
  "GXVJqpVuUEkufDjFhzLcX64gs3JTaog9z7yj8mwuWVP9"
);

// Lobby Systems
export const JOIN_GAME = new PublicKey(
  "253SWqcBw5p1TA62C8zhncH6ijdxhx3ErwMNjEJ5QZXX"
);
export const LEAVE_GAME = new PublicKey(
  "D8DZEXX46QvUNMhhEeDGdopcrz9Gogh9hPBLZMdLi1kn"
);
export const SET_READY = new PublicKey(
  "5EcjaFZnZhHzguj66PYFfdxSDTftmf1QjTZQu3CYsDwA"
);
export const START_GAME = new PublicKey(
  "DiwnvUwsQQwJdUVcPvSrRR9BnVCmCo1x3MWuLktunErL"
);
export const END_GAME = new PublicKey(
  "7gWFh8SSrdiAod8CkHHCygzwYD3qcF5LidDYo27EHqmh"
);

// Combat Systems
export const SHOOT = new PublicKey(
  "7XuvYvaEG7V8VnVKkxQwrfd9RKPvcJ5LsbZRUTu9YcQw"
);
export const RELOAD = new PublicKey(
  "CCMW8iY2AXakbHF173V7G2ZNrNUCXym9Yge3bJng4YAG"
);
export const APPLY_DAMAGE = new PublicKey(
  "CXWqvJ2NTQhtaXD4S6p8LbafitCPXYf4gk9paujePYSp"
);
export const SWITCH_WEAPON = new PublicKey(
  "Eg9ouayrW4VT42wM8dMxRmxDmgfizH2C7LS3VceGpzfV"
);
export const RESPAWN = new PublicKey(
  "EmPykaPt5GLtnJ5CUhSPo3vd59Ksbn8feTmxvkr8igUV"
);

// Movement System
export const MOVEMENT = new PublicKey(
  "6XWj2L5VmG1MU12AT3vF94PNeRQFstxwHt4WwBKimqS4"
);

// ============================================================================
// MAIN PROGRAM ADDRESS
// ============================================================================

export const SOLFPS_PROGRAM = new PublicKey(
  "9VNXswMdQsTJh71GSjSVVULYcMCuoQmWcgT9bAJ6WiFS"
);

// ============================================================================
// CONTRACT ADDRESS MAPPINGS
// ============================================================================

// Component mappings for easy access
export const COMPONENTS = {
  GAME: GAME_COMPONENT,
  PLAYER: PLAYER_COMPONENT,
  HEALTH: HEALTH_COMPONENT,
  WEAPON: WEAPON_COMPONENT,
  POSITION: POSITION_COMPONENT,
  PLAYER_STATS: PLAYER_STATS_COMPONENT,
} as const;

// System mappings for easy access
export const SYSTEMS = {
  // Initialization
  INIT_PLAYER,
  INIT_GAME,

  // Lobby Management
  JOIN_GAME,
  LEAVE_GAME,
  SET_READY,
  START_GAME,
  END_GAME,

  // Combat
  SHOOT,
  RELOAD,
  APPLY_DAMAGE,
  SWITCH_WEAPON,
  RESPAWN,

  // Movement
  MOVEMENT,
} as const;

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

export const NETWORK_CONFIG = {
  // Local development
  LOCALNET: {
    RPC_URL: "http://127.0.0.1:8899",
    WS_URL: "ws://127.0.0.1:8900",
  },

  // Devnet
  DEVNET: {
    RPC_URL: "https://api.devnet.solana.com",
    WS_URL: "wss://api.devnet.solana.com",
  },

  // Ephemeral Rollup (MagicBlock) - Local
  EPHEMERAL_ROLLUP_LOCAL: {
    RPC_URL: "http://0.0.0.0:7799", // Use ER validator endpoint
    WS_URL: "ws://0.0.0.0:7800",
    VALIDATOR: new PublicKey("mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev"), // Local ER Validator
  },

  // Ephemeral Rollup (MagicBlock) - Devnet Asia
  EPHEMERAL_ROLLUP_ASIA: {
    RPC_URL: "https://devnet-as.magicblock.app",
    WS_URL: "wss://devnet.magicblock.app",
    VALIDATOR: new PublicKey("MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"), // Asia ER Validator
  },

  // Ephemeral Rollup (MagicBlock) - Devnet Global
  EPHEMERAL_ROLLUP_GLOBAL: {
    RPC_URL: "https://devnet.magicblock.app",
    WS_URL: "wss://devnet.magicblock.app",
    VALIDATOR: new PublicKey("MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"), // Default validator
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all component addresses as an array
 */
export function getComponentAddresses(): PublicKey[] {
  return Object.values(COMPONENTS);
}

/**
 * Get all system addresses as an array
 */
export function getSystemAddresses(): PublicKey[] {
  return Object.values(SYSTEMS);
}

/**
 * Get all contract addresses (components + systems + main program)
 */
export function getAllContractAddresses(): PublicKey[] {
  return [...getComponentAddresses(), ...getSystemAddresses(), SOLFPS_PROGRAM];
}

/**
 * Validate that a PublicKey is one of our known contract addresses
 */
export function isValidContractAddress(address: PublicKey): boolean {
  const allAddresses = getAllContractAddresses();
  return allAddresses.some((addr) => addr.equals(address));
}

/**
 * Get contract type (component, system, or program) from address
 */
export function getContractType(
  address: PublicKey
): "component" | "system" | "program" | "unknown" {
  if (Object.values(COMPONENTS).some((addr) => addr.equals(address))) {
    return "component";
  }
  if (Object.values(SYSTEMS).some((addr) => addr.equals(address))) {
    return "system";
  }
  if (SOLFPS_PROGRAM.equals(address)) {
    return "program";
  }
  return "unknown";
}
