export interface MissingValuesPolicy {}

const Ignore: MissingValuesPolicy = {}

const Reject: MissingValuesPolicy = {}

export type MissingValuesPolicyName = 'ignore' | 'reject'

export function missingValuesPolicy(name: MissingValuesPolicyName): MissingValuesPolicy {
  switch (name) {
    case 'ignore':
      return Ignore
    case 'reject':
      return Reject
  }
}
