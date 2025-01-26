import { SingleCheck } from '@module/checks'
import { ValidationResult } from '@module/validation'
import __ from '@module/locale'

export class NotEmptyCheck<N> extends SingleCheck<string | N> {
  protected check(value: string | N): ValidationResult {
    let result = ValidationResult.valid()

    if (typeof value === 'string' && value.match(/^\s*$/)) {
      result = ValidationResult.invalid(__.stringEmpty)
    }

    return result
  }
}
