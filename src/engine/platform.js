/**
 * Detect iOS Safari / WKWebView–style environments.
 * Used to choose safe render loop paths (see main.js — iOS animation crash / rAF).
 */
export function isIOSWebKit() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOSDevice =
    /iPhone|iPad|iPod/i.test(ua) ||
    // iPadOS 13+ desktop UA
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return iOSDevice;
}
