import { Key, CollectionResource } from '@module/resources'
import It = jest.It

type RefState<ItemType> = { loaded: false } | { loaded: true; value: ItemType }

export class Ref<ItemType> {
  private readonly _resource: CollectionResource<ItemType>
  private _key: Key
  private _state: RefState<ItemType>

  private constructor(resource: CollectionResource<ItemType>, key: Key, state: RefState<ItemType>) {
    this._resource = resource
    this._key = key
    this._state = state
  }

  public static fromKey<ItemType>(resource: CollectionResource<ItemType>, key: Key): Ref<ItemType> {
    return new Ref(resource, key, { loaded: false })
  }

  public static fromValue<ItemType>(resource: CollectionResource<ItemType>, value: ItemType): Ref<ItemType> {
    return new Ref(resource, value[resource.key] as any, { loaded: true, value })
  }

  public get key(): Key {
    return this._key
  }

  public get value(): ItemType | undefined {
    return this._state.loaded ? this._state.value : undefined
  }

  public set value(value: ItemType | undefined) {
    if (value === undefined) {
      this._state = { loaded: false }
    } else {
      this._state = { loaded: true, value }
    }
  }

  public set(key: Key): void {
    // the loose equality here is on purpose. changing from key '2' to key 2 shouldn't do anything.
    // (mixed keys shouldn't even be a thing if the library is used normally)
    if (key != this._key) {
      this._key = key
      this._state = { loaded: false }
    }
  }

  public async get(): Promise<ItemType> {
    await this.update()
    if (!this._state.loaded) throw new Error('failed to load referenced resource')
    return this._state.value
  }

  public async change(key: Key): Promise<void> {
    // see the comment inside the set method
    if (key != this._key) {
      this.set(key)
      await this.reload()
    }
  }

  private async update(): Promise<void> {
    if (!this._state.loaded) {
      await this.reload()
    }
  }

  private async reload(): Promise<void> {
    this.value = await this._resource.get(this.key)
  }
}
