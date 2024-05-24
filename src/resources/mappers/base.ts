import { Result } from '@module/result'

export abstract class MappedField {
  private readonly _modelProperty: string
  private readonly _transferProperty: string

  protected constructor(modelProperty: string, transferProperty: string) {
    this._modelProperty = modelProperty
    this._transferProperty = transferProperty
  }

  public get modelProperty(): string {
    return this._modelProperty
  }

  public get transferProperty(): string {
    return this._transferProperty
  }

  public abstract packValue(value: unknown): Result<unknown>

  public abstract unpackValue(value: unknown): Result<unknown>
}
