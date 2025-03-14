import type { CollectionResource, Key, SingleResource } from '.'
import { AnyResponseType, CreationResult } from '@module/backend'
import { DataDescriptor } from '@module/data'
import { ObjectDescriptor } from '@module/data/serialized/object'
import { throwError } from '@module/errors'
import L from '@module/locale'
import { Mapper } from '@module/mappers'
import { ValueMapper } from '@module/mappers/serialized'
import { JsonArrayMapper } from '@module/mappers/serialized/json'
import { consumeCreationResult, KeyExtractionMethod } from '@module/mappers/serialized/keyExtraction'
import { ObjectMapper } from '@module/mappers/serialized/object'
import { RequestPath } from '@module/requestPath'
import { ResourceRequestBuilder } from '@module/resources/requestBuilder'
import { UrlSearchArgs } from '@module/url'

export type AllowedOperations = 'r' | 'w' | 'rw'

export class GenericSingleResource<T> implements SingleResource<T> {
  private readonly _requestBuilder: ResourceRequestBuilder
  private readonly _descriptor: DataDescriptor<T>
  private readonly _mapper: Mapper<T>
  private readonly _allowedOperations: AllowedOperations

  public constructor(
    requestBuilder: ResourceRequestBuilder,
    descriptor: DataDescriptor<T>,
    allowedOperations: AllowedOperations,
  ) {
    this._requestBuilder = requestBuilder
    this._descriptor = descriptor
    this._mapper = descriptor.makeMapper()
    this._allowedOperations = allowedOperations
  }

  public get asPath(): RequestPath {
    return this._requestBuilder.resourcePath
  }

  public get descriptor(): DataDescriptor<T> {
    return this._descriptor
  }

  public async get(): Promise<T> {
    if (this._allowedOperations === 'w') throwError(L.writeOnlyResource)

    const dto = await this._requestBuilder.getAll(this._mapper.expectedResponseType)
    return this._mapper.unpack(dto)
  }

  public create(): T {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)

    return this._descriptor.makeBlankValue()
  }

  public async send(value: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)
    this._descriptor.validate(value).throwIfInvalid()

    const dto = this._mapper.pack(value)
    await this._requestBuilder.saveNew(dto, AnyResponseType)
  }

  public async save(value: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)
    this._descriptor.validate(value).throwIfInvalid()

    const dto = this._mapper.pack(value)
    await this._requestBuilder.saveAll(dto, AnyResponseType)
  }

  public async delete(): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)

    await this._requestBuilder.deleteAll(AnyResponseType)
  }
}

const NewItemSymbol = Symbol.for('hokaze:new')

type TaggedObject = { [NewItemSymbol]?: unknown }

export class GenericCollectionResource<T> implements CollectionResource<T> {
  private readonly _requestBuilder: ResourceRequestBuilder
  private readonly _descriptor: ObjectDescriptor<T>
  private readonly _keyProperty: keyof T
  private readonly _itemMapper: ValueMapper<T>
  private readonly _arrayMapper: ValueMapper<T[]>
  private readonly _allowedOperations: AllowedOperations
  private _keyExtractionMethods: KeyExtractionMethod[]
  private _foundWorkingMethod: boolean

  public constructor(
    requestBuilder: ResourceRequestBuilder,
    descriptor: ObjectDescriptor<T>,
    mapper: ObjectMapper<T>,
    keyProperty: keyof T,
    allowedOperations: AllowedOperations,
    keyExtractionMethods: KeyExtractionMethod[],
  ) {
    this._keyProperty = keyProperty
    this._requestBuilder = requestBuilder
    this._descriptor = descriptor
    this._itemMapper = mapper
    this._arrayMapper = new JsonArrayMapper(this._itemMapper)
    this._allowedOperations = allowedOperations
    this._keyExtractionMethods = keyExtractionMethods
    this._foundWorkingMethod = false
  }

  public get asPath(): RequestPath {
    return this._requestBuilder.resourcePath
  }

  public get descriptor(): ObjectDescriptor<T> {
    return this._descriptor
  }

  public get keyProperty(): keyof T {
    return this._keyProperty
  }

  public async get(key: Key): Promise<T> {
    if (this._allowedOperations === 'w') throwError(L.writeOnlyResource)

    const dto = await this._requestBuilder.getOne(key, this._itemMapper.expectedResponseType)
    return this._itemMapper.unpack(dto)
  }

  public async getAll(search?: UrlSearchArgs | undefined): Promise<T[]> {
    if (this._allowedOperations === 'w') throwError(L.writeOnlyResource)

    const dto = await this._requestBuilder.getAll(this._itemMapper.expectedResponseType, search)
    return this._arrayMapper.unpack(dto)
  }

  public create(): T {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)

    const item = this._descriptor.makeBlankValue()
    this.setNewTagOf(item)
    return item
  }

  public isNew(item: T): boolean {
    return (
      this.getNewTagOf(item) === true ||
      (this.getKeyOf(item) as Key | null) === null ||
      (this.getKeyOf(item) as Key | undefined) === undefined
    )
  }

  public async send(item: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)
    this._descriptor.validate(item).throwIfInvalid()

    const dto = this._itemMapper.pack(item)
    const result = await this._requestBuilder.saveNew(dto, AnyResponseType)

    const key = await this.tryToExtractId(result)
    if (key !== undefined) {
      this.setKeyOf(item, key)
    }
    this.unsetNewTagOf(item)
  }

  public async save(item: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)

    if (this.isNew(item)) {
      await this.send(item)
    } else {
      this._descriptor.validate(item).throwIfInvalid()

      const dto = this._itemMapper.pack(item)
      await this._requestBuilder.saveExisting(dto, this.getKeyOf(item), AnyResponseType)
      this.unsetNewTagOf(item)
    }
  }

  public async delete(item: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)

    if (!this.isNew(item)) {
      await this._requestBuilder.deleteOne(this.getKeyOf(item), AnyResponseType)
    }
  }

  public async deleteKey(key: Key): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)

    await this._requestBuilder.deleteOne(key, AnyResponseType)
  }

  public async deleteAll(search?: UrlSearchArgs | undefined): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)

    await this._requestBuilder.deleteAll(AnyResponseType, search)
  }

  private setNewTagOf(item: T): void {
    ;(item as unknown as TaggedObject)[NewItemSymbol] = true
  }

  private getNewTagOf(item: T): unknown {
    return (item as unknown as TaggedObject)[NewItemSymbol]
  }

  private unsetNewTagOf(item: T): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (item as unknown as TaggedObject)[NewItemSymbol]
  }

  private setKeyOf(item: T, value: Key): void {
    item[this._keyProperty] = value as T[keyof T]
  }

  private getKeyOf(item: T): Key {
    return item[this._keyProperty] as Key
  }

  private async tryToExtractId(result: CreationResult): Promise<Key | undefined> {
    const ccr = await consumeCreationResult(result)

    let keyFound = undefined
    let i = 0
    for (; i < this._keyExtractionMethods.length && keyFound === undefined; i++) {
      keyFound = this._keyExtractionMethods[i].tryToExtractKey(ccr)
    }

    if (keyFound !== undefined && !this._foundWorkingMethod) {
      // if we found a method that worked, move it to the start of the list
      this._keyExtractionMethods.unshift(this._keyExtractionMethods.splice(i - 1, 1)[0])
      this._foundWorkingMethod = true
    }

    return keyFound
  }
}
