import { RequestBodyOrParams, ResponseBody } from '../../http'
import { Mapper } from '@module/mappers'
import { JsonRequestBody } from '@module/mappers/serialized/json/jsonRequestBody'
import { Ref } from '@module/reference'

export abstract class ValueMapper<T> implements Mapper<T> {
  public pack(value: T): RequestBodyOrParams {
    return new JsonRequestBody(this.packValue(value))
  }

  public async unpack(response: ResponseBody): Promise<T> {
    const responseText = await response.text()
    if (!responseText || responseText.trim().length == 0) {
      return undefined as T
    } else {
      const refLoader = new EagerReferenceLoader()
      const unpacked = this.unpackValue(JSON.parse(responseText), refLoader)
      await refLoader.loadAll()
      return unpacked
    }
  }

  public get expectedResponseType(): string {
    return 'application/json'
  }

  public abstract packValue(value: T): unknown

  public abstract unpackValue(response: unknown, refLoader: EagerReferenceLoader): T
}

export class EagerReferenceLoader {
  private _refsToLoad: Ref<unknown>[]

  public constructor() {
    this._refsToLoad = []
  }

  public register<R>(ref: Ref<R>): void {
    this._refsToLoad.push(ref as Ref<unknown>)
  }

  public async loadAll(): Promise<void> {
    await Promise.all(this._refsToLoad.map((ref) => ref.get()))
  }
}
