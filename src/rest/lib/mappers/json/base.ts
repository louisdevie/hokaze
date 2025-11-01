import { HttpResponseBody, RequestBodyOrParams } from '@module/http'
import { Mapper } from '@module/mappers'
import { MediaType, MediaTypes } from '@module/mediaTypes'
import { Ref } from '@module/reference'

export abstract class ValueMapper<T> implements Mapper<T> {
  public pack(value: T): RequestBodyOrParams {
    const packedValue = this.packValue(value)
    const json = JSON.stringify(packedValue)
    return { kind: 'text', text: json, mediaType: MediaTypes.Json.Preferred }
  }

  public async unpack(response: HttpResponseBody): Promise<T> {
    const responseText = await response.text()
    if (!responseText || responseText.trim().length == 0) {
      return undefined as T
    } else {
      const erl = new EagerReferenceLoader()
      const fromJson = JSON.parse(responseText)
      const unpacked = this.unpackValue(fromJson, erl)
      await erl.loadAll()
      return unpacked
    }
  }

  public get expectedResponseType(): string {
    return 'application/json'
  }

  public abstract packValue(value: T): unknown

  public abstract unpackValue(response: unknown, erl: EagerReferenceLoader): T
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
