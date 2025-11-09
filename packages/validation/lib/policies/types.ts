export interface TypesPolicy {}

const Ignore: TypesPolicy = {}

const ConvertOrIgnore: TypesPolicy = {}

const ConvertOrReject: TypesPolicy = {}

const Reject: TypesPolicy = {}

export type TypesPolicyName = 'ignore' | 'convertOrIgnore' | 'convertOrReject' | 'reject'

export function getTypesPolicy(name: TypesPolicyName): TypesPolicy {
  switch (name) {
    case 'ignore':
      return Ignore
    case 'convertOrIgnore':
      return ConvertOrIgnore
    case 'convertOrReject':
      return ConvertOrReject
    case 'reject':
      return Reject
  }
}
