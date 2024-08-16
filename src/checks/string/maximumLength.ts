import { invalid, valid, ValidationResult } from '@module/validation'
import __ from '@module/locale'
import { Checks, SingleCheck } from '@module/checks'

export class MaximumLengthCheck<N> extends SingleCheck<string | N> {
  private readonly _maxLength: number

  public constructor(otherChecks: Checks<string | N>, maxLength: number) {
    super(otherChecks)
    this._maxLength = maxLength
  }

  protected check(value: string | N): ValidationResult {
    return typeof value === 'string' && value.length > this._maxLength ?
        invalid(__.stringTooLong(this._maxLength))
      : valid()
  }
}
