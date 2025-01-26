/* LIBRARY USAGE */
export { type Service, service } from './service'
export type { TxOnlyCustomRequest, EmptyCustomRequest, RxOnlyCustomRequest, CustomRequest } from './requests'
export type { CollectionResource, SingleResource, Key } from './resources'
export { string, boolean, number, /*ref,*/ array, enumeration, object } from './data/serialized'
export { ValidationResult } from './validation'
export { BasicAuth, BearerToken } from './auth'
export { plainText } from './data/plainText'
export { setLocale } from './locale'

/* FOR PLUGINS */
export type { Likelihood } from './inference'
export type { Checks } from './checks'
export type { FieldRoleHints, ValueDescriptor } from './data/serialized'
export type { ObjectDescriptor } from './data/serialized/object'
export type { AuthScheme } from './auth'
export { ValueMapper } from './mappers/serialized'
export { AnyValue, type AnyValueOptions } from './data/serialized/base'
