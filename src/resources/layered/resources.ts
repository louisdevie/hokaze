import type { CollectionResource, Key, SingleResource } from '@module/resources'
import type { UrlSearchArgs } from '@module/url'
import { SendAndReceiveCollection, SendAndReceiveSingle } from '@module/resources/layered/abstractLayers'
import { noSearch } from '@module/resources/helpers'
import { CollectionManager, SingleResourceManager } from '@module/resources/managers'
import { Throw } from '@module/errors'

export type AllowedOperations = 'r' | 'w' | 'rw'

export class LayeredCollectionResource<T extends object> implements CollectionResource<T> {
  private readonly _topLayer: SendAndReceiveCollection<T>
  private readonly _manager: CollectionManager<T>
  private readonly _allowedOperations: AllowedOperations

  public constructor(
    topLayer: SendAndReceiveCollection<T>,
    manager: CollectionManager<T>,
    allowedOperations: AllowedOperations,
  ) {
    this._topLayer = topLayer
    this._manager = manager
    this._allowedOperations = allowedOperations
  }

  public get key(): keyof T {
    return this._manager.key
  }

  public async get(key: Key): Promise<T> {
    if (this._allowedOperations === 'w') Throw.writeOnlyResource()

    const item = await this._topLayer.getOne(key, undefined)
    return this._manager.createOrUpdateOne(key, item)
  }

  public async getAll(search?: UrlSearchArgs | undefined): Promise<T[]> {
    if (this._allowedOperations === 'w') Throw.writeOnlyResource()

    const items = await this._topLayer.getAll(search)
    let collection
    if (noSearch(search)) {
      collection = this._manager.updateAll(items)
    } else {
      collection = []
      for (const item of items) {
        collection.push(this._manager.createOrUpdateOne(this._manager.getKeyOf(item), item))
      }
    }
    return collection
  }

  public create(): T {
    if (this._allowedOperations === 'r') Throw.readOnlyResource()
    return this._manager.createInstance()
  }

  public async send(item: T): Promise<void> {
    if (this._allowedOperations === 'r') Throw.readOnlyResource()
    const key = await this._topLayer.saveNew(item, undefined)
    if (key !== undefined) {
      this._manager.setKeyOf(item, key)
      this._manager.createOrUpdateOne(key, item)
    }
  }

  public async save(item: T): Promise<void> {
    if (this._allowedOperations === 'r') Throw.readOnlyResource()
    if (this._manager.isNew(item)) {
      await this.send(item)
    } else {
      await this._topLayer.saveExisting(item, this._manager.getKeyOf(item), undefined)
    }
  }

  public async delete(item: T): Promise<void> {
    if (this._allowedOperations === 'r') Throw.readOnlyResource()
    if (!this._manager.isNew(item)) {
      await this._topLayer.deleteOne(this._manager.getKeyOf(item), undefined)
    }
  }

  public async deleteKey(key: Key): Promise<void> {
    if (this._allowedOperations === 'r') Throw.readOnlyResource()
    await this._topLayer.deleteOne(key, undefined)
  }

  public async deleteAll(search?: UrlSearchArgs | undefined): Promise<void> {
    if (this._allowedOperations === 'r') Throw.readOnlyResource()
    await this._topLayer.deleteAll(search)
  }
}

export class LayeredSingleResource<T extends object> implements SingleResource<T> {
  private readonly _topLayer: SendAndReceiveSingle<T>
  private readonly _manager: SingleResourceManager<T>
  private readonly _allowedOperations: AllowedOperations

  public constructor(
    topLayer: SendAndReceiveSingle<T>,
    manager: SingleResourceManager<T>,
    allowedOperations: AllowedOperations,
  ) {
    this._topLayer = topLayer
    this._manager = manager
    this._allowedOperations = allowedOperations
  }

  public async get(): Promise<T> {
    if (this._allowedOperations === 'w') Throw.writeOnlyResource()
    const value = await this._topLayer.getAll(undefined)
    return this._manager.createOrUpdate(value)
  }

  public create(): T {
    if (this._allowedOperations === 'r') Throw.readOnlyResource()
    return this._manager.createInstance()
  }

  public async send(value: T): Promise<void> {
    if (this._allowedOperations === 'r') Throw.readOnlyResource()
    await this._topLayer.saveNew(value, undefined)
  }

  public async save(value: T): Promise<void> {
    if (this._allowedOperations === 'r') Throw.readOnlyResource()
    await this._topLayer.saveExisting(value, undefined)
  }

  public async delete(): Promise<void> {
    if (this._allowedOperations === 'r') Throw.readOnlyResource()
    await this._topLayer.deleteAll(undefined)
  }
}
