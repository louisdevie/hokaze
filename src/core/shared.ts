// Code shared by multiple packages but not publicly exported from @hokaze/core.

export function throwInternal(error: string): never {
  console.error(`[HOKAZE INTERNAL ERROR] ${error}. Please report it at : https://github.com/louisdevie/hokaze/issues.`)
  throw new Error('Interrupting because of internal error')
}
