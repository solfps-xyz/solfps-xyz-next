/**
 * Ephemeral Rollup Configuration
 *
 * This file contains the configuration for MagicBlock Ephemeral Rollups
 * based on the MagicBlock documentation and Supersize example.
 */

import { PublicKey } from "@solana/web3.js";

// ============================================================================
// ER VALIDATOR ADDRESSES
// ============================================================================

export const ER_VALIDATORS = {
  // Local development validator
  LOCAL: new PublicKey("mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev"),

  // Asia ER Validator
  ASIA: new PublicKey("MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"),

  // Global ER Validator (default)
  GLOBAL: new PublicKey("MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"),
} as const;

// ============================================================================
// ER ENDPOINT CONFIGURATIONS
// ============================================================================

export const ER_ENDPOINTS = {
  // Local development
  LOCAL: {
    RPC_URL: "http://127.0.0.1:8899",
    WS_URL: "ws://127.0.0.1:8900",
    VALIDATOR: ER_VALIDATORS.LOCAL,
  },

  // Devnet Asia
  ASIA: {
    RPC_URL: "https://devnet-as.magicblock.app",
    WS_URL: "wss://devnet.magicblock.app",
    VALIDATOR: ER_VALIDATORS.ASIA,
  },

  // Devnet Global
  GLOBAL: {
    RPC_URL: "https://devnet.magicblock.app",
    WS_URL: "wss://devnet.magicblock.app",
    VALIDATOR: ER_VALIDATORS.GLOBAL,
  },
} as const;

// ============================================================================
// DELEGATION CONFIGURATION
// ============================================================================

export interface DelegationConfig {
  validator: PublicKey;
  rpcUrl: string;
  wsUrl: string;
  useEphemeralRollup: boolean;
}

/**
 * Get delegation configuration for the current environment
 */
export function getDelegationConfig(
  environment: "local" | "asia" | "global" = "local"
): DelegationConfig {
  const config =
    ER_ENDPOINTS[environment.toUpperCase() as keyof typeof ER_ENDPOINTS];

  return {
    validator: config.VALIDATOR,
    rpcUrl: config.RPC_URL,
    wsUrl: config.WS_URL,
    useEphemeralRollup: true,
  };
}

// ============================================================================
// INTEGRATION NOTES
// ============================================================================

/*
Based on the MagicBlock documentation and Supersize example:

1. **Validator Selection**: 
   - Local: mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev
   - Asia: MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57
   - Global: MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57

2. **Endpoint Configuration**:
   - Local: Use localnet (127.0.0.1:8899)
   - Asia: https://devnet-as.magicblock.app
   - Global: https://devnet.magicblock.app

3. **Delegation Process**:
   - Add delegation hooks to your program
   - Delegate state accounts through ER sessions
   - Execute transactions with gasless, real-time speed

4. **Integration Steps**:
   - Configure the correct validator for your environment
   - Use the appropriate RPC endpoint
   - Implement delegation in your contracts
   - Test with the ER endpoints

5. **Development Workflow**:
   - Start with local ER for development
   - Test on Asia ER for better latency
   - Deploy to Global ER for production

The Supersize example shows how to:
- Set up Anchor providers for both regular and ER endpoints
- Configure the correct validator addresses
- Handle delegation and undelegation
- Execute transactions through ER sessions

For your SolFPS game:
- Use LOCAL for development with your deployed localnet contracts
- Use ASIA for testing with better latency
- Use GLOBAL for production deployment
*/
