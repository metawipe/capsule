interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

interface InitDataUnsafe {
  user?: TelegramUser;
  query_id?: string;
  auth_date?: string;
  hash?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: InitDataUnsafe;
  version: string;
  platform: string;
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isFullscreen: boolean;
  
  ready: () => void;
  expand: () => void;
  close: () => void;
  requestFullscreen?: () => void;
  isVersionAtLeast?: (version: string) => boolean;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  openTelegramLink?: (url: string) => void;
  shareMessage?: (params: { text: string; url?: string }) => void;
  
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp || null;
}

function isDesktopTelegramClient(webApp: TelegramWebApp): boolean {
  // Telegram explicitly identifies native desktop clients this way.  The
  // pointer/media-query fallback covers the web client opened on a computer.
  if (['tdesktop', 'macos', 'web', 'weba', 'webk'].includes(webApp.platform)) {
    return true;
  }

  return window.matchMedia?.('(pointer: fine)').matches
    && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function initTelegramMiniApp(): void {
  if (!isTelegramWebApp()) {
    return;
  }

  const webApp = getTelegramWebApp();
  if (!webApp) return;

  const isAndroid = webApp.platform === 'android' || /Android/i.test(navigator.userAgent);
  document.documentElement.classList.toggle('android-mini-app', isAndroid);

  try {
    webApp.ready();
  } catch (error) {}

  // Desktop clients use the largest available Mini App window. On mobile,
  // request the native fullscreen mode when the Telegram client supports it.
  if (isDesktopTelegramClient(webApp)) {
    try {
      webApp.expand();
    } catch {
      // Telegram may reject expanding on clients that already use max height.
    }
  } else if (!webApp.isFullscreen && webApp.requestFullscreen) {
    try {
      const supportsFullscreen = !webApp.isVersionAtLeast || webApp.isVersionAtLeast('8.0');
      if (supportsFullscreen) webApp.requestFullscreen();
      else webApp.expand();
    } catch {
      // Older Telegram clients fall back to the normal expanded viewport.
      try {
        webApp.expand();
      } catch {
        // No supported viewport API.
      }
    }
  }

  try {
    document.addEventListener(
      'contextmenu',
      (e) => {
        const target = e.target as HTMLElement | null;
        const isEditable = !!target && (
          target.isContentEditable ||
          ['INPUT', 'TEXTAREA'].includes(target.tagName)
        );
        if (!isEditable) e.preventDefault();
      },
      { passive: false }
    );
  } catch (error) {}
}

export function getTelegramUser(): TelegramUser | null {
  if (isTelegramWebApp()) {
    const webApp = getTelegramWebApp();
    return webApp?.initDataUnsafe.user || null;
  }
  return null;
}

export function getTelegramUserSafe() {
  const user = getTelegramUser();
  if (user) {
    return {
      id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      language_code: user.language_code || 'en',
      is_premium: user.is_premium || false,
      allows_write_to_pm: user.allows_write_to_pm || false,
      photo_url: user.photo_url || '',
    };
  }
  return null;
}

export function getInitData(): string {
  if (isTelegramWebApp()) {
    const webApp = getTelegramWebApp();
    return webApp?.initData || '';
  }
  return '';
}

export function getInitDataUnsafe(): InitDataUnsafe | null {
  if (isTelegramWebApp()) {
    const webApp = getTelegramWebApp();
    return webApp?.initDataUnsafe || null;
  }
  return null;
}

export function hapticLight(): void {
  if (!isTelegramWebApp()) {
    const isAndroid = /Android/i.test(navigator.userAgent);
    fallbackHaptic(isAndroid ? 'medium' : 'light');
    return;
  }

  try {
    const webApp = getTelegramWebApp();
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (webApp?.HapticFeedback?.impactOccurred) {
      webApp.HapticFeedback.impactOccurred(isAndroid ? 'medium' : 'light');
      return;
    }
    
    if (typeof (webApp as any)?.hapticImpact === 'function') {
      (webApp as any).hapticImpact(isAndroid ? 'medium' : 'light');
      return;
    }
    
    if (typeof (webApp as any)?.impactOccurred === 'function') {
      (webApp as any).impactOccurred(isAndroid ? 'medium' : 'light');
      return;
    }
  } catch (error) {}
  
  const isAndroid = /Android/i.test(navigator.userAgent);
  fallbackHaptic(isAndroid ? 'medium' : 'light');
}

export function hapticSelection(): void {
  if (!isTelegramWebApp()) {
    fallbackHaptic('medium');
    return;
  }

  try {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback?.selectionChanged) {
      webApp.HapticFeedback.selectionChanged();
      return;
    }
    
    if (typeof (webApp as any)?.selectionChanged === 'function') {
      (webApp as any).selectionChanged();
      return;
    }

    if (webApp?.HapticFeedback?.impactOccurred) {
      webApp.HapticFeedback.impactOccurred('medium');
      return;
    }
  } catch (error) {}
  
  fallbackHaptic('medium');
}

function fallbackHaptic(type: 'light' | 'medium' | 'heavy' | 'soft' = 'light'): void {
  try {
    if (typeof navigator.vibrate === 'function') {
      const isAndroid = /Android/i.test(navigator.userAgent);
      const patterns = {
        light: isAndroid ? [40, 25, 40] : [30, 20, 30],    
        soft: isAndroid ? [30, 20, 30] : [20, 10, 20],
        medium: isAndroid ? [70, 40, 70] : [50, 30, 50],   
        heavy: isAndroid ? [100, 50, 100] : [80, 40, 80] 
      };
      navigator.vibrate(patterns[type]);
    }
  } catch (error) {}
}

export function hapticMedium(): void {
  if (!isTelegramWebApp()) {
    fallbackHaptic('medium');
    return;
  }

  try {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback?.impactOccurred) {
      webApp.HapticFeedback.impactOccurred('medium');
      return;
    }
  } catch (error) {}
  
  fallbackHaptic('medium');
}

export function hapticSuccess(): void {
  if (!isTelegramWebApp()) {
    fallbackHaptic('medium');
    return;
  }

  try {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback?.notificationOccurred) {
      webApp.HapticFeedback.notificationOccurred('success');
      return;
    }
  } catch (error) {}
  
  fallbackHaptic('medium');
}