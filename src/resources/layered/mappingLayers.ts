import {
  RawSendAndReceive,
  SendAndReceiveCollection,
  SendAndReceiveSingle,
} from '@module/resources/layered/abstractLayers'
import { KeyExtractionMethod, Mapper } from '@module/resources/mappers'
import type { Key } from '@module/resources'
import { OptionalSearchArgs } from '@module/resources/helpers'
import { CreationResult } from '@module/backend'

export class CollectionMappingLayer<T extends object> implements SendAndReceiveCollection<T> {
  private readonly _mapper: Mapper<any, T>
  private readonly _wrapped: RawSendAndReceive
  private _keyExtractionMethods: KeyExtractionMethod[]
  private _foundBestMethod: boolean

  public constructor(
    mapper: Mapper<any, T>,
    keyExtractionMethods: KeyExtractionMethod[],
    wrappedLayer: RawSendAndReceive,
  ) {
    this._mapper = mapper
    this._wrapped = wrappedLayer
    this._keyExtractionMethods = keyExtractionMethods
    this._foundBestMethod = false
  }

  public async getOne(key: Key, search: OptionalSearchArgs): Promise<T> {
    const dto = await this._wrapped.getOne(key, search)

    const item = this._mapper.unpackItem(dto.value)

    if (item.success) {
      await dto.accept()
      return item.value!
    } else {
      await dto.reject()
      throw new Error(item.error)
    }
  }

  public async getAll(search: OptionalSearchArgs): Promise<T[]> {
    const dto = await this._wrapped.getAll(search)

    const item = this._mapper.unpackItemsArray(dto.value)

    if (item.success) {
      await dto.accept()
      return item.value!
    } else {
      await dto.reject()
      throw new Error(item.error)
    }
  }

  private tryToExtractId(result: CreationResult): Key | undefined {
    let keyFound = undefined
    let i
    for (i = 0; i < this._keyExtractionMethods.length && keyFound === undefined; i++) {
      keyFound = this._keyExtractionMethods[i].tryToExtractKey(result)
    }

    if (keyFound !== undefined && !this._foundBestMethod) {
      // if we found a method that worked, move it to the start of the list
      this._keyExtractionMethods.unshift(this._keyExtractionMethods.splice(i - 1, 1)[0])
      this._foundBestMethod = true
    }

    return keyFound
  }

  public async saveNew(item: T, search: OptionalSearchArgs): Promise<Key | undefined> {
    const dto = this._mapper.packItem(item)
    if (!dto.success) throw new Error(dto.error)

    const creationResult = await this._wrapped.saveNew(dto.value, search)

    return this.tryToExtractId(creationResult)
  }

  public async saveExisting(item: T, key: Key, search: OptionalSearchArgs): Promise<void> {
    const dto = this._mapper.packItem(item)
    if (!dto.success) throw new Error(dto.error)

    await this._wrapped.saveExisting(dto.value, key, search)
  }

  public async deleteOne(key: Key, search: OptionalSearchArgs): Promise<void> {
    await this._wrapped.deleteOne(key, search)
  }

  public async deleteAll(search: OptionalSearchArgs): Promise<void> {
    await this._wrapped.deleteAll(search)
  }
}

export class SingleMappingLayer<T extends object> implements SendAndReceiveSingle<T> {
  private readonly _mapper: Mapper<any, T>
  private readonly _wrapped: RawSendAndReceive

  public constructor(mapper: Mapper<any, T>, wrappedLayer: RawSendAndReceive) {
    this._mapper = mapper
    this._wrapped = wrappedLayer
  }

  public async getAll(search: OptionalSearchArgs): Promise<T> {
    const dto = await this._wrapped.getAll(search)

    const item = this._mapper.unpackItem(dto.value)

    if (item.success) {
      await dto.accept()
      return item.value!
    } else {
      await dto.reject()
      throw new Error(item.error)
    }
  }

  public async saveNew(value: T, search: OptionalSearchArgs): Promise<void> {
    const dto = this._mapper.packItem(value)
    if (!dto.success) throw new Error(dto.error)

    await this._wrapped.saveNew(dto.value, search)
  }

  public async saveExisting(value: T, search: OptionalSearchArgs): Promise<void> {
    const dto = this._mapper.packItem(value)
    if (!dto.success) throw new Error(dto.error)

    await this._wrapped.saveAll(dto.value, search)
  }

  public async deleteAll(search: OptionalSearchArgs): Promise<void> {
    await this._wrapped.deleteAll(search)
  }
}
