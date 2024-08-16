import { SingleCheck } from '@module/checks'
import { invalid, valid, ValidationResult } from '@module/validation'
import __ from '@module/locale'

export class NotEmptyCheck<N> extends SingleCheck<string | N> {
  protected check(value: string | N): ValidationResult {
    let result = valid()

    if (typeof value === 'string' && value.match(/^\s*$/)) {
      result = invalid(__.stringEmpty)
    }

    return result
  }
}
