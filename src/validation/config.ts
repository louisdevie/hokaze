import type { ValidationPoliciesNames } from '@module/validation'

export interface ValidationConfig {
  input: ValidationPoliciesNames
  output: ValidationPoliciesNames
}

export const DefaultValidationConfig: ValidationConfig = {
  input: {
    types: 'ignore',
    missingValues: 'ignore',
    checks: 'ignore',
    mixedNullish: 'ignore',
  },
  output: {
    types: 'ignore',
    missingValues: 'ignore',
    checks: 'ignore',
    mixedNullish: 'ignore',
  },
}

export type PartialValidationConfig =
  | Partial<ValidationPoliciesNames>
  | {
      input?: Partial<ValidationPoliciesNames>
      output?: Partial<ValidationPoliciesNames>
    }

/**
 * A list of validation policies for common use cases.
 */
export const Config: {
  /**
   * All checks must pass and the data always needs to be in the expected format.
   */
  readonly Strict: ValidationPoliciesNames

  /**
   * Skip all checks and never fail.
   */
  readonly Unchecked: ValidationPoliciesNames

  /**
   * Try to use automatic fixes when possible, and fail otherwise.
   */
  readonly TryFixing: ValidationPoliciesNames

  /**
   * Allow any value to be null, undefined or missing.
   */
  readonly AllowNullUndefined: ValidationPoliciesNames
} = Object.freeze({
  Strict: Object.freeze({
    types: 'reject',
    missingValues: 'reject',
    checks: 'reject',
    mixedNullish: 'reject',
  }),

  Unchecked: Object.freeze({
    types: 'ignore',
    missingValues: 'ignore',
    checks: 'ignore',
    mixedNullish: 'ignore',
  }),

  TryFixing: Object.freeze({
    types: 'convertOrReject',
    missingValues: 'reject',
    checks: 'fixOrReject',
    mixedNullish: 'convert',
  }),

  AllowNullUndefined: Object.freeze({
    types: 'reject',
    missingValues: 'ignore',
    checks: 'reject',
    mixedNullish: 'convert',
  }),
})

export function mergeValidationConfig(
  base: ValidationConfig,
  override: PartialValidationConfig | undefined,
): ValidationConfig {
  let validation: ValidationConfig
  if (override === undefined) {
    validation = base
  } else if ('input' in override || 'output' in override) {
    validation = {
      input: mergeValidationPoliciesNames(base.input, override.input),
      output: mergeValidationPoliciesNames(base.output, override.output),
    }
  } else {
    validation = {
      input: mergeValidationPoliciesNames(base.input, override as Partial<ValidationPoliciesNames>),
      output: mergeValidationPoliciesNames(base.output, override as Partial<ValidationPoliciesNames>),
    }
  }
  return validation
}

function mergeValidationPoliciesNames(
  base: ValidationPoliciesNames,
  override: Partial<ValidationPoliciesNames> | undefined,
): ValidationPoliciesNames {
  return {
    checks: override?.checks ?? base.checks,
    missingValues: override?.missingValues ?? base.missingValues,
    mixedNullish: override?.mixedNullish ?? base.mixedNullish,
    types: override?.types ?? base.types,
  }
}
