# WASM Bridge Integration - Quick Reference

## 🎯 What's Been Set Up

The WASM bridge allows your Raylib C/C++ game to interact with Privy wallet authentication.

## 📁 Files Created

### Frontend (TypeScript/React)
- ✅ `src/lib/wasmBridge.ts` - Bridge implementation
- ✅ `src/components/RaylibGame.tsx` - Updated game component with bridge
- ✅ `src/components/BridgeTest.tsx` - Testing UI component
- ✅ `src/app/page.tsx` - Updated to include test component

### Game (C/C++)
- ✅ `public/game/privy_bridge.h` - C header with all bridge functions
- ✅ `public/game/BRIDGE_INTEGRATION.md` - Full integration guide

## 🎮 How It Works

```
┌─────────────────┐
│  Raylib C/C++   │ ──┐
│  Game (WASM)    │   │ EM_ASYNC_JS calls
└─────────────────┘   │
                      ▼
┌─────────────────────────────────┐
│  window.PrivyBridge (JavaScript) │
│  - getWalletAddress()            │
│  - connectWallet()               │
│  - getSolanaBalance()            │
│  etc...                          │
└─────────────────────────────────┘
                      │
                      ▼
┌─────────────────┐
│  React/Privy    │
│  Frontend       │
└─────────────────┘
```

## 🚀 Quick Start for Your Game

### 1. Include the header in your C game
```c
#include "privy_bridge.h"
#include "raylib.h"
```

### 2. Use the functions
```c
// Connect wallet
if (IsKeyPressed(KEY_W)) {
    connect_wallet();
}

// Check connection
int connected = is_wallet_connected();

// Get address
char* address = get_solana_address();
if (address) {
    printf("Wallet: %s\\n", address);
    free(address);  // Important!
}

// Get balance
double balance = get_solana_balance();
printf("Balance: %.4f SOL\\n", balance / 1e9);
```

### 3. Compile with Emscripten
```bash
emcc -o game.html game.c \\
  -s USE_GLFW=3 \\
  -s ASYNCIFY \\
  -s ALLOW_MEMORY_GROWTH=1 \\
  -DPLATFORM_WEB \\
  -lraylib
```

## 🧪 Testing the Bridge

1. **Start dev server**: `pnpm dev`
2. **Open browser**: http://localhost:3000
3. **Login with Privy**: Click "Connect Wallet"
4. **Open Bridge Tester**: Bottom-left corner of the screen
5. **Click "Run Tests"**: See all bridge functions work

## 📊 Available Functions

### Connection Management
- `connect_wallet()` - Opens Privy modal
- `disconnect_wallet()` - Logs out
- `is_wallet_connected()` - Returns 1/0

### Wallet Info
- `get_solana_address()` - Returns address string
- `get_solana_balance()` - Returns balance in lamports
- `get_user_id()` - Returns Privy user ID
- `get_user_email()` - Returns user email

## ⚠️ Important Notes

1. **Memory Management**: Always `free()` strings returned from bridge functions
2. **Async Functions**: All functions are async but safe to call in game loop
3. **Error Handling**: Check for NULL/-1 return values

## 🎨 Example Game Code

See `public/game/privy_bridge.h` for complete example with:
- Wallet connection UI
- Balance display
- User info display
- Keyboard controls

## 🐛 Debugging

### Check if bridge is loaded
Open browser console and type:
```javascript
window.PrivyBridge
```

Should show all available functions.

### Test from console
```javascript
await window.PrivyBridge.connectWallet()
await window.PrivyBridge.getSolanaAddress()
await window.PrivyBridge.getSolanaBalance()
```

## 📞 Bridge API Reference

| Function | C Signature | Returns | Notes |
|----------|------------|---------|-------|
| Connect | `void connect_wallet()` | void | Opens modal |
| Disconnect | `void disconnect_wallet()` | void | Logs out |
| Is Connected | `int is_wallet_connected()` | 1/0 | Check status |
| Get Address | `char* get_solana_address()` | string | Must free() |
| Get Balance | `double get_solana_balance()` | lamports | -1 on error |
| Get User ID | `char* get_user_id()` | string | Must free() |
| Get Email | `char* get_user_email()` | string | Must free() |

## 🎯 Next Steps

1. ✅ Bridge is set up and ready
2. 📝 Copy `privy_bridge.h` to your game project
3. 🎮 Add wallet functionality to your game
4. 🧪 Test with the Bridge Tester component
5. 🚀 Build and deploy!

Your Raylib game now has full Privy wallet integration! 🎉
