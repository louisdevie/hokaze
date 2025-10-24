import { RequestBodyOrParams } from '../../../http'

/** @internal */
export class JsonRequestBody implements RequestBodyOrParams {
  private readonly _value: unknown

  public constructor(value: unknown) {
    this._value = value
  }

  public readonly type = 'application/json'

  public intoBodyInit(): BodyInit | null {
    return (JSON.stringify(this._value) as string | undefined) ?? null
  }
}
