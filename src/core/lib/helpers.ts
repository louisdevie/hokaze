export function isObject(value: unknown): boolean {
  return (typeof value === 'object' && value !== null) || typeof value === 'function'
}

export function isNullish(value: unknown): value is null | undefined {
  return value === undefined || value === null
}

export function isIterable(value: unknown): value is Iterable<any> {
  return typeof value === 'object' && value !== null && Symbol.iterator in value
}
