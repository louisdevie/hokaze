import { checksPolicy, ChecksPolicy, ChecksPolicyName } from './checks'
import { missingValuesPolicy, MissingValuesPolicy, MissingValuesPolicyName } from './missingValues'
import { mixedNullishPolicy, MixedNullishPolicy, MixedNullishPolicyName } from './mixedNullish'
import { typesPolicy, TypesPolicy, TypesPolicyName } from './types'

export interface ValidationPolicies {
  types: TypesPolicy
  missingValues: MissingValuesPolicy
  checks: ChecksPolicy
  mixedNullish: MixedNullishPolicy
}

export interface ValidationPoliciesNames {
  types: TypesPolicyName
  missingValues: MissingValuesPolicyName
  checks: ChecksPolicyName
  mixedNullish: MixedNullishPolicyName
}

export function validationPolicies(names: ValidationPoliciesNames): ValidationPolicies {
  return {
    types: typesPolicy(names.types),
    missingValues: missingValuesPolicy(names.missingValues),
    checks: checksPolicy(names.checks),
    mixedNullish: mixedNullishPolicy(names.mixedNullish),
  }
}
