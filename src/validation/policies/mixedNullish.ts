export interface MixedNullishPolicy {}

const Ignore: MixedNullishPolicy = {}

const Convert: MixedNullishPolicy = {}

const Reject: MixedNullishPolicy = {}

export type MixedNullishPolicyName = 'ignore' | 'convert' | 'reject'

export function mixedNullishPolicy(name: MixedNullishPolicyName): MixedNullishPolicy {
  switch (name) {
    case 'ignore':
      return Ignore
    case 'convert':
      return Convert
    case 'reject':
      return Reject
  }
}
