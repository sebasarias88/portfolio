/** Tiny event bus so intro animations start after the preloader leaves. */
const EVENT = "sa:preloader-done";

declare global {
  interface Window {
    __saPreloaderDone?: boolean;
  }
}

export function markPreloaderDone() {
  window.__saPreloaderDone = true;
  window.dispatchEvent(new Event(EVENT));
}

/** Runs `callback` once the preloader is done (immediately if it already is). */
export function onPreloaderDone(callback: () => void) {
  if (window.__saPreloaderDone) {
    callback();
    return () => {};
  }
  const handler = () => callback();
  window.addEventListener(EVENT, handler, { once: true });
  return () => window.removeEventListener(EVENT, handler);
}
