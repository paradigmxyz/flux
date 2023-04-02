export function getPlatformModifierKey() {
    return window.navigator.platform === "MacIntel" ? "meta" : "ctrl";
  }

export function getPlatformModifierKeyText() {
    return window.navigator.platform === "MacIntel" ? "⌘" : "Ctrl";
  }