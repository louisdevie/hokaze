import { Check, ValidationResult } from '~/validation'

export class TestCheck implements Check<unknown> {
  private _discriminant: number

  public constructor(discriminant: number) {
    this._discriminant = discriminant
  }

  public validate(value: unknown): ValidationResult {
    return {}
  }
}
