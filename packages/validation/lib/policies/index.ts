import { getChecksPolicy, ChecksPolicy, ChecksPolicyName } from './checks'
import { getMissingValuesPolicy, MissingValuesPolicy, MissingValuesPolicyName } from './missingValues'
import { getMixedNullishPolicy, MixedNullishPolicy, MixedNullishPolicyName } from './mixedNullish'
import { getTypesPolicy, TypesPolicy, TypesPolicyName } from './types'

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

export function getValidationPolicies(names: ValidationPoliciesNames): ValidationPolicies {
  return {
    types: getTypesPolicy(names.types),
    missingValues: getMissingValuesPolicy(names.missingValues),
    checks: getChecksPolicy(names.checks),
    mixedNullish: getMixedNullishPolicy(names.mixedNullish),
  }
}
