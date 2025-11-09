export interface Log {
  /**
   * Forcibly enable or disable development mode. When this mode is enabled, additional error and warning message may be
   * logged to the console to help with debugging. Hokaze will try to automatically enable it based on the value of
   * `process.env.NODE_ENV`, but you can use this method to set it manually in cases where it doesn't work properly.
   * @param enable `true` to enable development mode or `false` to disable it.
   */
  enableDevMode(enable: boolean): void

  /**
   * Throw an error with an "internal error" disclaimer and a link to the issues page when running in dev mode.
   * @param error The error message.
   * @internal
   */
  throwInternal(error: string): never

  /**
   * Display a warning when running in dev mode.
   * @param warning The warning message.
   * @internal
   */
  warn(warning: string): void
}

class ConsoleLogger implements Log {
  private _dev: boolean

  public constructor(dev: boolean) {
    this._dev = dev
  }

  public enableDevMode(enable: boolean): void {
    this._dev = enable
  }

  public throwInternal(error: string): never {
    if (this._dev) {
      console.error(
        `[HOKAZE INTERNAL ERROR] ${error}. Please report it at : https://github.com/louisdevie/hokaze/issues.`,
      )
    }
    throw new Error('Interrupting because of internal error', { cause: error })
  }

  public warn(warning: string): void {
    if (this._dev) {
      console.warn(`[HOKAZE WARNING] ${warning}.`)
    }
  }
}

export const Log: Log = new ConsoleLogger(
  typeof process !== 'undefined' && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development'),
)
