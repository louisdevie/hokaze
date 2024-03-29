import { valid, ValidationResult } from '@module/validation'

export interface Checks<T> {
  validate(value: T): ValidationResult
}

export class NoChecks implements Checks<any> {
  validate(value: any): ValidationResult {
    return valid()
  }
}

export abstract class SingleCheck<T> implements Checks<T> {
  private _otherChecks: Checks<T>

  public constructor(otherChecks: Checks<T>) {
    this._otherChecks = otherChecks
  }

  public validate(value: T): ValidationResult {
    let thisCheckResult = this.check(value)
    return !thisCheckResult.isValid ? thisCheckResult : this._otherChecks.validate(value)
  }

  protected abstract check(value: T): ValidationResult
}