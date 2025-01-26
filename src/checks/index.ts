import { ValidationResult } from '@module/validation'

export interface Checks<T> {
  validate(value: T): ValidationResult
}

export class NoChecks implements Checks<never> {
  public validate(): ValidationResult {
    return ValidationResult.valid()
  }
}

export abstract class SingleCheck<T> implements Checks<T> {
  private _otherChecks: Checks<T>

  public constructor(otherChecks: Checks<T>) {
    this._otherChecks = otherChecks
  }

  public validate(value: T): ValidationResult {
    return this.check(value).mergeWith(this._otherChecks.validate(value))
  }

  protected abstract check(value: T): ValidationResult
}
