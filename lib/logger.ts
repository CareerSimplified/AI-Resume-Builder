// Centralized logging - disabled in production
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

export const logger = {
  error: (label: string, error: any) => {
    if (isDev) console.error(`[${label}]`, error)
  },
  
  log: (message: string, data?: any) => {
    if (isDev) console.log(message, data || '')
  },
  
  warn: (message: string, data?: any) => {
    if (isDev) console.warn(message, data || '')
  },
}

// Disable console in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const noop = () => {}
  window.console = {
    ...window.console,
    log: noop,
    debug: noop,
    info: noop,
    warn: noop,
  } as any
}
