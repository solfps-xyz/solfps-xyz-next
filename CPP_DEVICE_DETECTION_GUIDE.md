# C++ Changes Required for Device Detection

## ✅ TypeScript Files Updated

The following files have been created/updated:
- ✅ `src/lib/deviceDetection.ts` - Device detection utilities
- ✅ `src/lib/wasmBridge.ts` - Updated with device detection functions

## 📝 Changes Needed in Your C++ Raylib Project

### 1. Add Device Detection Functions to Your Header

Add these functions to your game's header file (e.g., `game.h` or create a new `device_utils.h`):

```cpp
#include <emscripten.h>

// Device Detection Functions

// Check if current device is mobile (returns 1 if mobile, 0 otherwise)
EM_JS(int, is_mobile_device, (), {
  return window.PrivyBridge.isMobile() ? 1 : 0;
});

// Check if current device is tablet (returns 1 if tablet, 0 otherwise)
EM_JS(int, is_tablet_device, (), {
  return window.PrivyBridge.isTablet() ? 1 : 0;
});

// Check if current device is desktop (returns 1 if desktop, 0 otherwise)
EM_JS(int, is_desktop_device, (), {
  return window.PrivyBridge.isDesktop() ? 1 : 0;
});

// Check if device has touch support (returns 1 if touch supported, 0 otherwise)
EM_JS(int, has_touch_support, (), {
  return window.PrivyBridge.hasTouch() ? 1 : 0;
});

// Get screen width in pixels
EM_JS(int, get_screen_width, (), {
  return window.PrivyBridge.getScreenWidth();
});

// Get screen height in pixels
EM_JS(int, get_screen_height, (), {
  return window.PrivyBridge.getScreenHeight();
});

// Get device orientation (returns 0 for landscape, 1 for portrait)
EM_JS(int, get_orientation, (), {
  return window.PrivyBridge.getOrientation() === 'portrait' ? 1 : 0;
});
```

### 2. Update Your Game Code to Use Device Detection

Here's how to adjust your muzzle flash and other settings based on device:

```cpp
// In your game initialization or configuration
typedef struct {
    bool isMobile;
    bool isTablet;
    bool isDesktop;
    bool hasTouch;
    int screenWidth;
    int screenHeight;
    bool isPortrait;
    
    // Game-specific adjustments
    float muzzleFlashScale;
    float uiScale;
    bool showTouchControls;
} DeviceConfig;

DeviceConfig deviceConfig;

void InitializeDeviceConfig() {
    // Detect device type
    deviceConfig.isMobile = is_mobile_device();
    deviceConfig.isTablet = is_tablet_device();
    deviceConfig.isDesktop = is_desktop_device();
    deviceConfig.hasTouch = has_touch_support();
    
    // Get screen info
    deviceConfig.screenWidth = get_screen_width();
    deviceConfig.screenHeight = get_screen_height();
    deviceConfig.isPortrait = get_orientation();
    
    // Adjust game settings based on device
    if (deviceConfig.isMobile) {
        deviceConfig.muzzleFlashScale = 0.5f;  // 50% size on mobile
        deviceConfig.uiScale = 1.2f;           // Larger UI for touch
        deviceConfig.showTouchControls = true;
    } else if (deviceConfig.isTablet) {
        deviceConfig.muzzleFlashScale = 0.75f; // 75% size on tablet
        deviceConfig.uiScale = 1.1f;
        deviceConfig.showTouchControls = true;
    } else {
        deviceConfig.muzzleFlashScale = 1.0f;  // Full size on desktop
        deviceConfig.uiScale = 1.0f;
        deviceConfig.showTouchControls = false;
    }
    
    printf("Device Config:\n");
    printf("  Mobile: %d\n", deviceConfig.isMobile);
    printf("  Tablet: %d\n", deviceConfig.isTablet);
    printf("  Desktop: %d\n", deviceConfig.isDesktop);
    printf("  Touch: %d\n", deviceConfig.hasTouch);
    printf("  Screen: %dx%d\n", deviceConfig.screenWidth, deviceConfig.screenHeight);
    printf("  Muzzle Flash Scale: %.2f\n", deviceConfig.muzzleFlashScale);
}
```

### 3. Apply Muzzle Flash Scaling

When drawing your muzzle flash effect:

```cpp
void DrawMuzzleFlash(Vector3 position, float baseSize) {
    // Apply device-specific scaling
    float scaledSize = baseSize * deviceConfig.muzzleFlashScale;
    
    // Draw your muzzle flash with the scaled size
    DrawCube(position, scaledSize, scaledSize, scaledSize, YELLOW);
    // ... or however you're drawing your muzzle flash
}

// Example in your shooting code:
void OnShoot() {
    Vector3 muzzlePos = GetGunMuzzlePosition();
    
    // Base size is 1.0, but will be scaled based on device
    DrawMuzzleFlash(muzzlePos, 1.0f);
}
```

### 4. Handle Orientation Changes (Optional)

If you want to detect when user rotates their device:

```cpp
void UpdateGame() {
    static int lastOrientation = 0;
    int currentOrientation = get_orientation();
    
    // Detect orientation change
    if (currentOrientation != lastOrientation) {
        printf("Orientation changed: %s\n", 
               currentOrientation ? "Portrait" : "Landscape");
        
        // You might want to pause game or show a message
        if (currentOrientation && deviceConfig.isMobile) {
            // Show "Please rotate to landscape" message
        }
        
        lastOrientation = currentOrientation;
    }
}
```

### 5. Touch Controls (Optional)

If you want touch-friendly controls on mobile:

```cpp
void DrawTouchControls() {
    if (!deviceConfig.showTouchControls) return;
    
    // Draw virtual joystick, buttons, etc.
    int screenW = deviceConfig.screenWidth;
    int screenH = deviceConfig.screenHeight;
    
    // Example: Draw shoot button
    Rectangle shootButton = {
        screenW - 100, 
        screenH - 100, 
        80, 
        80
    };
    DrawRectangleRec(shootButton, RED);
    DrawText("SHOOT", shootButton.x + 10, shootButton.y + 30, 20, WHITE);
}
```

## 🎯 Quick Implementation Steps

1. **Copy the device detection functions** to your game header
2. **Call `InitializeDeviceConfig()`** at game startup
3. **Update your muzzle flash code** to use `deviceConfig.muzzleFlashScale`
4. **Test on mobile** to verify the scaling works

## 📊 Example Usage Summary

```cpp
// In main.cpp or game.cpp

int main() {
    InitWindow(800, 450, "Sol FPS");
    
    // Initialize device configuration
    InitializeDeviceConfig();
    
    while (!WindowShouldClose()) {
        UpdateGame();
        
        BeginDrawing();
        ClearBackground(BLACK);
        
        // Your game rendering...
        
        // Draw touch controls if needed
        DrawTouchControls();
        
        EndDrawing();
    }
    
    CloseWindow();
    return 0;
}
```

## 🐛 Debugging

To verify device detection is working, add this to your game loop:

```cpp
// Press 'I' to show device info
if (IsKeyPressed(KEY_I)) {
    printf("\n=== Device Info ===\n");
    printf("Mobile: %d\n", is_mobile_device());
    printf("Tablet: %d\n", is_tablet_device());
    printf("Desktop: %d\n", is_desktop_device());
    printf("Touch: %d\n", has_touch_support());
    printf("Screen: %dx%d\n", get_screen_width(), get_screen_height());
    printf("Orientation: %s\n", get_orientation() ? "Portrait" : "Landscape");
    printf("Muzzle Flash Scale: %.2f\n", deviceConfig.muzzleFlashScale);
}
```

## ✅ Checklist

- [ ] Add device detection functions to your header
- [ ] Create DeviceConfig struct
- [ ] Call InitializeDeviceConfig() at startup
- [ ] Update muzzle flash rendering to use scale
- [ ] Test on desktop (should be full size)
- [ ] Test on mobile (should be 50% size)
- [ ] Optionally add touch controls
- [ ] Recompile with Emscripten

That's it! Your game will now automatically adjust the muzzle flash size based on the device type! 🎮
