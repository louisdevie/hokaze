export function throwError(message: string, options?: ErrorOptions): never {
  throw new Error(message, options)
}

export function throwInternal(error: string): never {
  console.error(`[HOKAZE INTERNAL ERROR] ${error}. Please report it at : https://github.com/louisdevie/hokaze/issues.`)
  throw new Error('Interrupting because of internal error')
}

/*
  descriptorNotSupported: 'Unsupported descriptor.',
  unwrappedError: 'unwrap() called on an error',
  unwrappedValue: 'unwrap_error() called on a value',
*/
