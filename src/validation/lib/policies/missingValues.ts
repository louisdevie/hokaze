export interface MissingValuesPolicy {}

const Ignore: MissingValuesPolicy = {}

const Reject: MissingValuesPolicy = {}

export type MissingValuesPolicyName = 'ignore' | 'reject'

export function getMissingValuesPolicy(name: MissingValuesPolicyName): MissingValuesPolicy {
  switch (name) {
    case 'ignore':
      return Ignore
    case 'reject':
      return Reject
  }
}
