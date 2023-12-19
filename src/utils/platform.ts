export function getPlatformModifierKeyText() {
  return window.navigator.platform === "MacIntel" ? "⌘" : " Ctrl ";
}

export function getPlatformSecondaryModifierKeyText() {
  return window.navigator.platform === "MacIntel" ? "⌥" : " Alt ";
}