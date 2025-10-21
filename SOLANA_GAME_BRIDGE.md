# Solana Game Bridge Integration

This document describes the Solana Game Bridge integration for the SolFPS game, connecting the C++ WebAssembly game engine with Solana blockchain contracts via Privy wallet integration.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   C++ Game     │    │   JavaScript     │    │   Solana        │
│   Engine       │◄──►│   Bridge         │◄──►│   Contracts     │
│   (WASM)       │    │   (MagicBlock)   │    │   (Bolt ECS)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### MagicBlock SDK Integration

The bridge uses the official MagicBlock SDK for proper ECS interactions:

- **`FindComponentPda`** - Derives component PDAs
- **`FindWorldPda`** - Derives world PDA
- **`FindEntityPda`** - Derives entity PDAs
- **`ApplySystem`** - Executes system programs
- **`InitializeNewWorld`** - Creates new world instances
- **`AddEntity`** - Adds entities to world
- **`InitializeComponent`** - Initializes component instances

## 📁 File Structure

```
solfps-xyz-next/src/
├── lib/
│   ├── contractAddresses.ts     # All contract addresses and configurations
│   └── solanaGameBridge.ts      # Main bridge class with all game methods
├── hooks/
│   └── useSolanaGameBridge.ts   # React hook for bridge integration
└── components/
    └── SolanaGameBridgeTest.tsx # Test component for bridge functionality
```

## 🔧 Contract Addresses

All contract addresses are defined in `contractAddresses.ts`:

### Components

- `GAME_COMPONENT` - Game state and lobby management
- `PLAYER_COMPONENT` - Player data and status
- `HEALTH_COMPONENT` - Health and armor system
- `WEAPON_COMPONENT` - Weapon data and ammo
- `POSITION_COMPONENT` - Player position and movement
- `PLAYER_STATS_COMPONENT` - Statistics and achievements

### Systems

- `INIT_PLAYER` - Player initialization
- `INIT_GAME` - Game/lobby creation
- `JOIN_GAME` - Join existing game
- `LEAVE_GAME` - Leave current game
- `SET_READY` - Toggle ready status
- `START_GAME` - Start game (lobby owner)
- `END_GAME` - End current game
- `SHOOT` - Shooting mechanics
- `RELOAD` - Weapon reloading
- `APPLY_DAMAGE` - Damage application
- `SWITCH_WEAPON` - Weapon switching
- `RESPAWN` - Player respawn
- `MOVEMENT` - Real-time movement updates

## 🎮 Game Bridge Methods

### Initialization

```typescript
await bridge.initPlayer(); // Initialize player account
await bridge.initGame(); // Create new game/lobby
```

### Lobby Management

```typescript
await bridge.joinGame(gameAddress); // Join existing game
await bridge.leaveGame(); // Leave current game
await bridge.setReady(true); // Set ready status
await bridge.startGame(); // Start game (owner only)
await bridge.endGame(); // End current game
```

### Combat

```typescript
await bridge.shoot(1); // Shoot primary weapon
await bridge.reload(1); // Reload primary weapon
await bridge.switchWeapon(2); // Switch to secondary
await bridge.applyDamage(victim, 1, false, 10.5); // Apply damage
await bridge.respawn(); // Respawn player
```

### Movement

```typescript
await bridge.updateMovement(x, y, z, rotation, vx, vy, vz);
```

## 🔌 Privy Integration

The bridge uses Privy for all wallet operations:

```typescript
const { ready, authenticated, user, connect, logout } = usePrivy();

// Initialize bridge with Privy wallet
const bridge = initializeSolanaGameBridge({
  privyWallet: user?.wallet,
  connection: new Connection(rpcUrl),
  ephemeralRollup: true, // Use ER for gasless transactions
});
```

## 🌐 Network Configuration

### Ephemeral Rollup (Recommended)

- **RPC URL**: `https://devnet.magicblock.app`
- **Benefits**: Gasless transactions, sub-10ms latency
- **Use Case**: Real-time game actions (movement, shooting, combat)

### Standard Solana Networks

- **Localnet**: `http://127.0.0.1:8899` (development)
- **Devnet**: `https://api.devnet.solana.com` (testing)

## 🎯 C++ Integration

The C++ game engine calls JavaScript functions via Emscripten:

```cpp
// In C++ headers (e.g., shoot.h)
static inline void Shoot(uint8_t weaponSlot, ShootCallback callback) {
    EM_ASM({
        window.SolanaGameBridge.shoot($0)
            .then(() => Module.dynCall_vii($1, 1, 0))
            .catch(err => {
                const errorPtr = allocateUTF8(err.message);
                Module.dynCall_vii($1, 0, errorPtr);
                _free(errorPtr);
            });
    }, weaponSlot, callback);
}
```

## 🧪 Testing

Use the `SolanaGameBridgeTest` component to test all bridge functionality:

1. **Connect Wallet** - Connect via Privy
2. **Initialize Player** - Create player account
3. **Create/Join Game** - Set up game lobby
4. **Test Combat** - Shoot, reload, switch weapons
5. **Test Movement** - Update player position

## 🚀 Usage Example

```typescript
import { useSolanaGameBridge } from "@/hooks/useSolanaGameBridge";

function GameComponent() {
  const { isConnected, gameState, initPlayer, joinGame, shoot, reload } =
    useSolanaGameBridge();

  const handleShoot = async () => {
    try {
      await shoot(1); // Shoot primary weapon
    } catch (error) {
      console.error("Shoot failed:", error);
    }
  };

  return (
    <div>
      {isConnected ? (
        <button onClick={handleShoot}>Shoot (Ammo: {gameState.ammo})</button>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## 🔄 State Management

The bridge maintains game state automatically:

```typescript
interface GameState {
  playerAddress?: PublicKey;
  gameAddress?: PublicKey;
  isInGame: boolean;
  isReady: boolean;
  health: number;
  maxHealth: number;
  currentWeapon: number;
  ammo: number;
  maxAmmo: number;
}
```

## ⚡ Performance Considerations

1. **Ephemeral Rollup**: Use for real-time actions (movement, shooting)
2. **Batching**: Group multiple actions in single transactions when possible
3. **Error Handling**: Graceful fallback for network issues
4. **State Caching**: Local state updates for immediate UI feedback

## 🛠️ Development

### Prerequisites

- Privy wallet integration
- MagicBlock SDK (`@magicblock-labs/bolt-sdk`)
- Solana Web3.js
- Bolt ECS contracts deployed
- Ephemeral Rollup access

### Setup

1. Install dependencies: `pnpm install`
2. Configure Privy in your app
3. Deploy Bolt ECS contracts to localnet/devnet
4. Update contract addresses in `contractAddresses.ts`
5. Test with `SolanaGameBridgeTest` component

### MagicBlock SDK Usage

```typescript
import {
  FindComponentPda,
  FindWorldPda,
  FindEntityPda,
  ApplySystem,
  InitializeNewWorld,
  AddEntity,
  InitializeComponent,
} from "@magicblock-labs/bolt-sdk";

// Derive PDAs
const [worldPda] = FindWorldPda();
const [entityPda] = FindEntityPda(worldPda, playerAddress);
const [componentPda] = FindComponentPda(componentProgramId, entityPda);

// Execute systems
const instruction = ApplySystem({
  system: systemProgramId,
  world: worldPda,
  entity: entityPda,
  payer: playerAddress,
  systemProgramId: systemProgramId,
});
```

## 📝 Next Steps

1. **MagicBlock SDK Integration** - Implement proper SDK integration in `magicBlockIntegration.ts`
2. **IDL Integration** - Use actual contract IDLs for instruction creation
3. **Add Ephemeral Rollup** - Integrate MagicBlock ER endpoints
4. **State Synchronization** - Real-time state updates from blockchain
5. **Error Recovery** - Robust error handling and retry logic
6. **Performance Optimization** - Transaction batching and caching

## 🔧 Current Implementation Status

### ✅ Completed

- Contract address definitions
- Basic bridge architecture
- Privy wallet integration
- React hooks for bridge management
- Test component for functionality
- TypeScript type definitions
- Error handling framework

### 🚧 In Progress

- MagicBlock SDK integration (placeholder implementation)
- Actual instruction creation (using placeholders)

### 📋 TODO

- Implement proper MagicBlock SDK functions
- Add real contract instruction creation
- Integrate with deployed contracts
- Add Ephemeral Rollup support
- Implement state synchronization

## 🔗 Related Files

- `solfps-xyz-raylib/include/*.h` - C++ integration headers
- `programs-ecs/systems/*/src/lib.rs` - Solana contract systems
- `Anchor.toml` - Contract deployment configuration
