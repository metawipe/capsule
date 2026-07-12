/// <reference types="vite/client" />

import type { TelegramWebApp } from './integrations/telegram/twa'

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Ваши существующие модули остаются без изменений
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.webm' {
  const src: string
  export default src
}

declare module '*.tgs' {
  const src: string
  export default src
}

declare module '*.lottie' {
  const src: string
  export default src
}

declare module 'jszip' {
  class JSZip {
    files: { [key: string]: JSZipObject }
    loadAsync(data: ArrayBuffer | Uint8Array | Blob): Promise<JSZip>
    file(name: string): JSZipObject | null
  }
  export default JSZip
  export interface JSZipObject {
    async(type: 'string'): Promise<string>
    async(type: 'uint8array'): Promise<Uint8Array>
  }
}

export {}