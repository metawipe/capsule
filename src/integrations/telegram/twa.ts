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
  safeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  contentSafeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
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

function isAndroidDevice(webApp?: TelegramWebApp | null) {
  return webApp?.platform?.toLowerCase() === 'android'
    || document.documentElement.classList.contains('android-mini-app')
    || /Android/i.test(navigator.userAgent)
}

const ANDROID_APP_TOP_GAP = 48

function getAppSafeAreaTop(webApp?: TelegramWebApp | null) {
  const isAndroid = isAndroidDevice(webApp)
  const contentInset = webApp?.contentSafeAreaInset
  const safeInset = webApp?.safeAreaInset
  const topInset = Math.max(contentInset?.top ?? 0, safeInset?.top ?? 0)

  if (topInset > 0) return topInset
  return isAndroid ? ANDROID_APP_TOP_GAP : 0
}

function applyAppViewportInsets(webApp?: TelegramWebApp | null) {
  const top = getAppSafeAreaTop(webApp)
  document.documentElement.style.setProperty('--app-safe-area-top', `${top}px`)

  const bottomInset = Math.max(
    webApp?.contentSafeAreaInset?.bottom ?? 0,
    webApp?.safeAreaInset?.bottom ?? 0,
  )
  if (bottomInset > 0) {
    document.documentElement.style.setProperty('--app-safe-area-bottom', `${bottomInset}px`)
  }

  if (webApp) applyModalViewportInsets(webApp)
  window.dispatchEvent(new Event('appInsetsChanged'))
}

function applyModalViewportInsets(webApp: TelegramWebApp): void {
  const { top, bottom } = getModalInsetsFromWebApp(webApp)
  document.documentElement.style.setProperty('--modal-gap-top', `${top}px`)
  document.documentElement.style.setProperty('--modal-gap-bottom', `${bottom}px`)
  window.dispatchEvent(new Event('modalInsetsChanged'))
}

export function getModalInsets() {
  const webApp = getTelegramWebApp()
  if (webApp) return getModalInsetsFromWebApp(webApp)

  const isAndroid = isAndroidDevice()

  return {
    top: isAndroid ? 12 : 12,
    bottom: 8,
    side: 8,
  }
}

function getModalInsetsFromWebApp(webApp: TelegramWebApp) {
  const isAndroid = isAndroidDevice(webApp)
  const contentInset = webApp.contentSafeAreaInset
  const safeInset = webApp.safeAreaInset
  const topInset = Math.max(contentInset?.top ?? 0, safeInset?.top ?? 0)
  const bottomInset = Math.max(contentInset?.bottom ?? 0, safeInset?.bottom ?? 0)

  return {
    top: topInset > 0 ? topInset + 12 : (isAndroid ? 12 : 12),
    bottom: bottomInset > 0 ? bottomInset + 8 : 8,
    side: 8,
  }
}

export function initTelegramMiniApp(): void {
  if (!isTelegramWebApp()) {
    if (isAndroidDevice()) {
      document.documentElement.classList.add('android-mini-app');
      applyAppViewportInsets();
    }
    return;
  }

  const webApp = getTelegramWebApp();
  if (!webApp) return;

  const isAndroid = isAndroidDevice(webApp);
  document.documentElement.classList.toggle('android-mini-app', isAndroid);
  applyAppViewportInsets(webApp);

  try {
    webApp.ready();
  } catch (error) {}

  const onViewportChange = () => applyAppViewportInsets(webApp);
  const tg = webApp as TelegramWebApp & {
    onEvent?: (eventType: string, callback: () => void) => void
  }
  if (typeof tg.onEvent === 'function') {
    tg.onEvent('viewportChanged', onViewportChange)
    tg.onEvent('safeAreaChanged', onViewportChange)
    tg.onEvent('contentSafeAreaChanged', onViewportChange)
  } else {
    window.addEventListener('viewportChanged', onViewportChange);
    window.addEventListener('safeAreaChanged', onViewportChange);
  }

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

  // Fullscreen expands after ready(); re-apply insets once layout settles.
  window.setTimeout(() => applyAppViewportInsets(webApp), 0);
  window.setTimeout(() => applyAppViewportInsets(webApp), 250);
  window.setTimeout(() => applyAppViewportInsets(webApp), 800);

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