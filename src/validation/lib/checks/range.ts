import type { Check } from '@module/checks'
import { throwError } from '@module/errors'
import L from '@module/locale'
import { ValidationResult } from '@module/validation'

class RangeCheck implements Check<number> {
  private readonly _lowerBound: number
  private readonly _upperBound: number
  private readonly _isInclusive: boolean

  public constructor(lowerBound: number, upperBound: number, isInclusive: boolean) {
    this._lowerBound = lowerBound
    this._upperBound = upperBound
    this._isInclusive = isInclusive

    if (this._lowerBound >= this._upperBound) {
      throwError(L.minGreaterThanMax)
    }
  }

  public validate(value: number): ValidationResult {
    let result = ValidationResult.valid()

    if (this._isInclusive) {
      if (!isNaN(this._lowerBound) && value < this._lowerBound) {
        result = ValidationResult.invalid(L.mustBeGreaterThanOrEqualTo(this._lowerBound))
      }

      if (!isNaN(this._upperBound) && value > this._upperBound) {
        result = ValidationResult.invalid(L.mustBeLessThanOrEqualTo(this._upperBound))
      }
    } else {
      if (!isNaN(this._lowerBound) && value <= this._lowerBound) {
        result = ValidationResult.invalid(L.mustBeGreaterThan(this._lowerBound))
      }

      if (!isNaN(this._upperBound) && value >= this._upperBound) {
        result = ValidationResult.invalid(L.mustBeLessThan(this._upperBound))
      }
    }

    return result
  }
}

export function greaterThan(value: number): Check<number> {
  return new RangeCheck(value, NaN, false)
}

export function lessThan(value: number): Check<number> {
  return new RangeCheck(NaN, value, false)
}

export function greaterThanOrEqualTo(value: number): Check<number> {
  return new RangeCheck(value, NaN, true)
}

export function lessThanOrEqualTo(value: number): Check<number> {
  return new RangeCheck(NaN, value, true)
}

export const positive: Check<number> = new RangeCheck(0, NaN, true)

export const negative: Check<number> = new RangeCheck(NaN, 0, true)

export const strictlyPositive: Check<number> = new RangeCheck(0, NaN, false)

export const strictlyNegative: Check<number> = new RangeCheck(NaN, 0, false)

export function between(min: number, max: number): Check<number> {
  return new RangeCheck(min, max, true)
}

export function exclusiveBetween(min: number, max: number): Check<number> {
  return new RangeCheck(min, max, false)
}
