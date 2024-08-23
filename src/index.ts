/* LIBRARY USAGE */
export { Service, service } from './service'
export { string, boolean, number, /*ref,*/ array, enumeration, object } from './data/serialized'
export { BasicAuth, BearerToken } from './auth'
export { plainText } from './data/plainText'
export { elz } from './locale'

/* FOR PLUGINS */
export type { ValidationResult } from './validation'
export type { Likelihood } from './inference'
export type { Checks } from './checks'
export type { FieldRoleHints, ValueDescriptor } from './data/serialized'
export type { ObjectDescriptor } from './data/serialized/object'
export type { AuthScheme } from './auth'
export { ValueMapper } from './mappers/serialized'
export { AnyValue, type AnyValueOptions } from './data/serialized/base'
