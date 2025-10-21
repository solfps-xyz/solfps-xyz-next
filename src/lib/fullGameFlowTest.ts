/**
 * Full Game Flow Test
 *
 * This file contains a comprehensive integration test that runs through
 * the complete FPS game user flow from initialization to game end.
 */

import { SolanaGameBridge } from "./solanaGameBridge";

export async function testFullGameFlow(
  bridge: SolanaGameBridge
): Promise<boolean> {
  console.log("🎮 Starting Full Game Flow Test...");

  try {
    // Phase 1: Player Initialization
    console.log("Phase 1: Player Initialization");
    await bridge.initPlayer();
    console.log("✅ Player initialized");

    // Phase 2: Lobby Creation
    console.log("Phase 2: Create Game Room");
    await bridge.initGame();
    console.log("✅ Game room created");

    // Phase 3: Lobby Management
    console.log("Phase 3: Set Ready Status");
    await bridge.setReady(true);
    console.log("✅ Ready status set");

    // Phase 4: Game Start
    console.log("Phase 4: Start Game");
    await bridge.startGame();
    console.log("✅ Game started");

    // Phase 5: In-Game Combat
    console.log("Phase 5: Combat Actions");
    await bridge.shoot(1);
    console.log("✅ Shot weapon");

    await bridge.reload(1);
    console.log("✅ Reloaded weapon");

    await bridge.switchWeapon(2);
    console.log("✅ Switched weapon");

    // Phase 6: Movement
    console.log("Phase 6: Movement");
    await bridge.updateMovement(0, 0, 0, 0, 0, 0, 0);
    console.log("✅ Position updated");

    // Phase 7: Death & Respawn
    console.log("Phase 7: Respawn");
    await bridge.respawn();
    console.log("✅ Player respawned");

    // Phase 8: Game End
    console.log("Phase 8: End Game");
    await bridge.endGame();
    console.log("✅ Game ended");

    // Phase 9: Leave Game
    console.log("Phase 9: Leave Game");
    await bridge.leaveGame();
    console.log("✅ Left game");

    console.log("🎉 Full Game Flow Test Passed!");
    return true;
  } catch (error) {
    console.error("❌ Full Game Flow Test Failed:", error);
    return false;
  }
}
