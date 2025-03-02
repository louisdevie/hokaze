import { DayjsValue, DayjsValuePublicAPI } from './descriptor'
import { FieldRoleHints, Likelihood, ValidationResult, ValueMapper } from '@hokaze/core'
import __dayjs, { Dayjs } from 'dayjs'

export { Dayjs } from 'dayjs'

type ExtendedDayjs = typeof __dayjs & DayjsValuePublicAPI<never>

const init: DayjsValuePublicAPI<never> = {
  isNullable: false,
  isOptional: false,
  isReadable: true,
  isWritable: true,
  keyKind: null,
  makeBlankValue(): Dayjs {
    return new DayjsValue<never>().makeBlankValue()
  },
  validate(value: Dayjs): ValidationResult {
    return new DayjsValue<never>().validate(value)
  },
  isKey(hints: FieldRoleHints): Likelihood {
    return new DayjsValue<never>().isKey(hints)
  },
  makeMapper(): ValueMapper<Dayjs> {
    return new DayjsValue<never>().makeMapper()
  },
  readOnly: new DayjsValue<never>().readOnly,
  writeOnly: new DayjsValue<never>().writeOnly,
  optional: new DayjsValue<never>().optional,
  nullable: new DayjsValue<never>().nullable,
  withBlankValue(factoryOrValue: (() => Dayjs) | Dayjs): DayjsValue<never> {
    return new DayjsValue<never>().withBlankValue(factoryOrValue as Dayjs)
  },
}

const dayjs: ExtendedDayjs = Object.assign(__dayjs, init)

export default dayjs
