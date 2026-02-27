// Telegram Mini App initialization
const WebApp = (window as any).Telegram?.WebApp || {
  ready: () => {},
  expand: () => {},
  setHeaderColor: () => {},
  setBackgroundColor: () => {},
  confirm: (_msg: string, callback: (confirmed: boolean) => void) => callback(true),
  showAlert: (_msg: string) => {},
  HapticFeedback: {
    impactOccurred: (_type: string) => {}
  },
  initDataUnsafe: { user: null }
}

export function initTelegram() {
  try {
    WebApp.ready()
    WebApp.expand()
    WebApp.setHeaderColor('#14b8a6')
    WebApp.setBackgroundColor('#f8fafc')
  } catch {
    // Running outside Telegram
  }
  return WebApp
}

export function getTelegramUser() {
  return WebApp.initDataUnsafe?.user || null
}

export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    WebApp.confirm(message, (confirmed: boolean) => {
      resolve(confirmed)
    })
  })
}

export function showAlert(message: string) {
  WebApp.showAlert(message)
}

export function hapticFeedback(type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy' = 'light') {
  const typeMap: Record<string, string> = {
    'success': 'medium',
    'error': 'heavy', 
    'warning': 'medium',
    'light': 'light',
    'medium': 'medium',
    'heavy': 'heavy'
  }
  WebApp.HapticFeedback?.impactOccurred(typeMap[type] || 'light')
}

export default WebApp
