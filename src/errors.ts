export function throwInline(error: unknown): never {
  throw error
}

export function throwError(message: string, options?: ErrorOptions): never {
  throw new Error(message, options)
}

export function internal(error: string): never {
  console.error(`[HOKAZE INTERNAL ERROR] ${error}`)
  console.warn('The error above is not your fault. Please report it at : https://github.com/louisdevie/hokaze/issues')
  throw new Error('Interrupting because of internal error')
}

export const Err = {
  descriptorNotSupported: 'Unsupported descriptor.',
  unwrappedError: 'unwrap() called on an error',
  unwrappedValue: 'unwrap_error() called on a value',
  triedToThrowOkResponse: 'BadResponse constructor called with ok response',
}
