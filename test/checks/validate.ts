import { Check } from '@module/checks'

export function validate<T>(value: T, check: Check<T>): boolean {
  return check.validate(value).isValid
}

export function validateWith<T>(check: Check<T>): (value: T) => boolean {
  return (value) => check.validate(value).isValid
}
