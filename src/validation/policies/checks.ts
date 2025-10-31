export interface ChecksPolicy {}

const Ignore: ChecksPolicy = {}

const FixOrIgnore: ChecksPolicy = {}

const FixOrReject: ChecksPolicy = {}

const Reject: ChecksPolicy = {}

export type ChecksPolicyName = 'ignore' | 'fixOrIgnore' | 'fixOrReject' | 'reject'

export function checksPolicy(name: ChecksPolicyName): ChecksPolicy {
  switch (name) {
    case 'ignore':
      return Ignore
    case 'fixOrIgnore':
      return FixOrIgnore
    case 'fixOrReject':
      return FixOrReject
    case 'reject':
      return Reject
  }
}
