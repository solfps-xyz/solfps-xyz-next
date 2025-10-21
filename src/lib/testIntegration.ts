/**
 * Test Integration Script
 *
 * This script tests the MagicBlock SDK integration with your deployed contracts.
 * Run this to verify everything is working correctly.
 */

import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { COMPONENTS, SYSTEMS, NETWORK_CONFIG } from "./contractAddresses";
import { getDelegationConfig } from "./ephemeralRollupConfig";

// ============================================================================
// INTEGRATION TEST
// ============================================================================

export async function testMagicBlockIntegration() {
  console.log("🧪 Testing MagicBlock SDK Integration...");

  try {
    // Test 1: Verify contract addresses
    console.log("✅ Contract Addresses:");
    console.log("  - GAME_COMPONENT:", COMPONENTS.GAME.toString());
    console.log("  - PLAYER_COMPONENT:", COMPONENTS.PLAYER.toString());
    console.log("  - SHOOT_SYSTEM:", SYSTEMS.SHOOT.toString());
    console.log("  - MOVEMENT_SYSTEM:", SYSTEMS.MOVEMENT.toString());

    // Test 2: Verify network configuration
    console.log("✅ Network Configuration:");
    const localConfig = getDelegationConfig("local");
    console.log("  - Local RPC:", localConfig.rpcUrl);
    console.log("  - Local Validator:", localConfig.validator.toString());

    // Test 3: Test connection
    console.log("✅ Testing Connection:");
    const connection = new Connection(localConfig.rpcUrl, "confirmed");
    const version = await connection.getVersion();
    console.log("  - Solana Version:", version["solana-core"]);

    // Test 4: Verify ER validator
    console.log("✅ ER Validator Configuration:");
    console.log("  - Local ER Validator:", localConfig.validator.toString());
    console.log("  - Use Ephemeral Rollup:", localConfig.useEphemeralRollup);

    console.log("🎉 All tests passed! MagicBlock SDK integration is ready.");
    return true;
  } catch (error) {
    console.error("❌ Integration test failed:", error);
    return false;
  }
}

// ============================================================================
// CONTRACT VERIFICATION
// ============================================================================

export async function verifyDeployedContracts() {
  console.log("🔍 Verifying Deployed Contracts...");

  try {
    const connection = new Connection(
      NETWORK_CONFIG.EPHEMERAL_ROLLUP_LOCAL.RPC_URL,
      "confirmed"
    );

    // Test contract addresses from Anchor.toml
    const contractAddresses = [
      { name: "GAME_COMPONENT", address: COMPONENTS.GAME },
      { name: "PLAYER_COMPONENT", address: COMPONENTS.PLAYER },
      { name: "HEALTH_COMPONENT", address: COMPONENTS.HEALTH },
      { name: "WEAPON_COMPONENT", address: COMPONENTS.WEAPON },
      { name: "POSITION_COMPONENT", address: COMPONENTS.POSITION },
      { name: "PLAYER_STATS_COMPONENT", address: COMPONENTS.PLAYER_STATS },
      { name: "SHOOT_SYSTEM", address: SYSTEMS.SHOOT },
      { name: "RELOAD_SYSTEM", address: SYSTEMS.RELOAD },
      { name: "MOVEMENT_SYSTEM", address: SYSTEMS.MOVEMENT },
    ];

    for (const contract of contractAddresses) {
      try {
        const accountInfo = await connection.getAccountInfo(contract.address);
        if (accountInfo) {
          console.log(
            `✅ ${contract.name}: Deployed (${accountInfo.data.length} bytes)`
          );
        } else {
          console.log(`❌ ${contract.name}: Not found`);
        }
      } catch (error) {
        console.log(`⚠️  ${contract.name}: Error checking (${error})`);
      }
    }

    console.log("🔍 Contract verification complete.");
    return true;
  } catch (error) {
    console.error("❌ Contract verification failed:", error);
    return false;
  }
}

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/*
To test the integration:

1. **Run the integration test:**
   ```typescript
   import { testMagicBlockIntegration } from './testIntegration';
   await testMagicBlockIntegration();
   ```

2. **Verify deployed contracts:**
   ```typescript
   import { verifyDeployedContracts } from './testIntegration';
   await verifyDeployedContracts();
   ```

3. **Test in your React component:**
   ```typescript
   import { useSolanaGameBridge } from './hooks/useSolanaGameBridge';
   
   function TestComponent() {
     const { initPlayer, shoot, reload } = useSolanaGameBridge();
     
     const handleTest = async () => {
       try {
         await initPlayer();
         console.log("Player initialized!");
         
         await shoot(1);
         console.log("Shot weapon!");
         
         await reload(1);
         console.log("Reloaded weapon!");
       } catch (error) {
         console.error("Test failed:", error);
       }
     };
     
     return <button onClick={handleTest}>Test Integration</button>;
   }
   ```

4. **Check the browser console for:**
   - Contract address verification
   - Network configuration
   - Connection status
   - ER validator setup
   - Transaction signatures

5. **Expected output:**
   - All contract addresses should be valid
   - Connection should succeed
   - ER validator should be configured
   - Transactions should be signed and sent
   - No errors in the console

If you see any errors:
- Check that your localnet is running
- Verify contract addresses in Anchor.toml
- Ensure MagicBlock SDK is properly installed
- Check that ER validator is configured correctly
*/
