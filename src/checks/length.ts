import type { Check } from '@module/checks'
import { throwError } from '@module/errors'
import L from '@module/locale'
import { ValidationResult } from '@module/validation'

type Length = { readonly length: number }

class LengthCheck implements Check<Length> {
  private readonly _maxLength: number
  private readonly _minLength: number

  public constructor(minLength: number, maxLength: number) {
    this._minLength = minLength
    this._maxLength = maxLength

    if (this._minLength >= this._maxLength) {
      throwError(L.minGreaterThanMax)
    }
  }

  public validate(value: Length): ValidationResult {
    let result = ValidationResult.valid()

    if (!isNaN(this._minLength) && value.length < this._minLength) {
      result = ValidationResult.invalid(L.stringTooShort(this._maxLength))
    }

    if (!isNaN(this._maxLength) && value.length > this._maxLength) {
      result = ValidationResult.invalid(L.stringTooLong(this._maxLength))
    }

    return result
  }
}

export function maxLength(max: number): Check<Length> {
  return new LengthCheck(NaN, max)
}

export function minLength(min: number): Check<Length> {
  return new LengthCheck(min, NaN)
}

export function length(min: number, max: number): Check<Length> {
  return new LengthCheck(min, max)
}
