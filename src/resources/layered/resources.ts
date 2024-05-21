import type { CollectionResource, Key, SingleResource } from '@module/resources'
import type { UrlSearchArgs } from '@module/url'
import type {
  ResourceRequestPath,
  SendAndReceiveCollection,
  SendAndReceiveSingle,
} from '@module/resources/layered/abstractLayers'
import { noSearch } from '@module/resources/helpers'
import { CollectionManager, SingleResourceManager } from '@module/resources/managers'
import { DefaultRequestPath, RequestPath } from '@module/requestPath'
import { throwError } from '@module/errors'
import __ from '@module/locale'

export type AllowedOperations = 'r' | 'w' | 'rw'

export class LayeredCollectionResource<T extends object> implements CollectionResource<T> {
  private readonly _topLayer: SendAndReceiveCollection<T>
  private readonly _manager: CollectionManager<T>
  private readonly _allowedOperations: AllowedOperations
  private readonly _children: ResourceRequestPath

  public constructor(
    topLayer: SendAndReceiveCollection<T>,
    manager: CollectionManager<T>,
    allowedOperations: AllowedOperations,
    children: ResourceRequestPath,
  ) {
    this._topLayer = topLayer
    this._manager = manager
    this._allowedOperations = allowedOperations
    this._children = children
  }

  public get key(): keyof T {
    return this._manager.key
  }

  public get asPath(): RequestPath {
    return new DefaultRequestPath(this._children.forResource)
  }

  public async get(key: Key): Promise<T> {
    if (this._allowedOperations === 'w') throwError(__.writeOnlyResource)

    const item = await this._topLayer.getOne(key, undefined)
    this._manager.addChildren(item, new DefaultRequestPath(this._children.forItem(key)))
    return this._manager.createOrUpdateOne(key, item)
  }

  public async getAll(search?: UrlSearchArgs | undefined): Promise<T[]> {
    if (this._allowedOperations === 'w') throwError(__.writeOnlyResource)

    const items = await this._topLayer.getAll(search)
    let collection
    if (noSearch(search)) {
      collection = this._manager.updateAll(items)
    } else {
      collection = []
      for (const item of items) {
        const key = this._manager.getKeyOf(item)
        this._manager.addChildren(item, new DefaultRequestPath(this._children.forItem(key)))
        collection.push(this._manager.createOrUpdateOne(key, item))
      }
    }
    return collection
  }

  public create(): T {
    if (this._allowedOperations === 'r') throwError(__.readOnlyResource)

    const item = this._manager.createInstance()
    this._manager.addChildren(item, null)
    return item
  }

  public async send(item: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(__.readOnlyResource)

    const key = await this._topLayer.saveNew(item, undefined)
    if (key !== undefined) {
      this._manager.setKeyOf(item, key)
      this._manager.addChildren(item, new DefaultRequestPath(this._children.forItem(key)))
      this._manager.createOrUpdateOne(key, item)
    }
  }

  public async save(item: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(__.readOnlyResource)

    if (this._manager.isNew(item)) {
      await this.send(item)
    } else {
      await this._topLayer.saveExisting(item, this._manager.getKeyOf(item), undefined)
    }
  }

  public async delete(item: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(__.readOnlyResource)

    if (!this._manager.isNew(item)) {
      await this._topLayer.deleteOne(this._manager.getKeyOf(item), undefined)
    }
  }

  public async deleteKey(key: Key): Promise<void> {
    if (this._allowedOperations === 'r') throwError(__.readOnlyResource)

    await this._topLayer.deleteOne(key, undefined)
  }

  public async deleteAll(search?: UrlSearchArgs | undefined): Promise<void> {
    if (this._allowedOperations === 'r') throwError(__.readOnlyResource)

    await this._topLayer.deleteAll(search)
  }
}

export class LayeredSingleResource<T extends object> implements SingleResource<T> {
  private readonly _topLayer: SendAndReceiveSingle<T>
  private readonly _manager: SingleResourceManager<T>
  private readonly _allowedOperations: AllowedOperations
  private readonly _children: ResourceRequestPath

  public constructor(
    topLayer: SendAndReceiveSingle<T>,
    manager: SingleResourceManager<T>,
    allowedOperations: AllowedOperations,
    children: ResourceRequestPath,
  ) {
    this._topLayer = topLayer
    this._manager = manager
    this._allowedOperations = allowedOperations
    this._children = children
  }

  public get asPath(): RequestPath {
    return new DefaultRequestPath(this._children.forResource)
  }

  public async get(): Promise<T> {
    if (this._allowedOperations === 'w') throwError(__.writeOnlyResource)
    const value = await this._topLayer.getAll(undefined)
    return this._manager.createOrUpdate(value)
  }

  public create(): T {
    if (this._allowedOperations === 'r') throwError(__.readOnlyResource)
    return this._manager.createInstance()
  }

  public async send(value: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(__.readOnlyResource)
    await this._topLayer.saveNew(value, undefined)
  }

  public async save(value: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(__.readOnlyResource)
    await this._topLayer.saveExisting(value, undefined)
  }

  public async delete(): Promise<void> {
    if (this._allowedOperations === 'r') throwError(__.readOnlyResource)
    await this._topLayer.deleteAll(undefined)
  }
}
