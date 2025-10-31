import type { Check } from '@module/checks'
import L from '@module/locale'
import { ValidationResult } from '@module/validation'

class NotEmptyCheck implements Check<string> {
  public validate(value: string): ValidationResult {
    let result = ValidationResult.valid()

    if (value.match(/^\s*$/)) {
      result = ValidationResult.invalid(L.stringEmpty)
    }

    return result
  }
}

export const notEmpty: Check<string> = new NotEmptyCheck()
