import type { Key, CollectionResource } from '@module/resources'

type RefState<T> = { loaded: false } | { loaded: true; value: T }

export class Ref<T> {
  private readonly _resource: CollectionResource<T>
  private _key: Key
  private _state: RefState<T>

  private constructor(resource: CollectionResource<T>, key: Key, state: RefState<T>) {
    this._resource = resource
    this._key = key
    this._state = state
  }

  public static fromKey<T>(resource: CollectionResource<T>, key: Key): Ref<T> {
    return new Ref(resource, key, { loaded: false })
  }

  public static fromValue<T>(resource: CollectionResource<T>, value: T): Ref<T> {
    return new Ref(resource, value[resource.keyProperty] as Key, {
      loaded: true,
      value,
    })
  }

  public get key(): Key {
    return this._key
  }

  public get value(): T | undefined {
    return this._state.loaded ? this._state.value : undefined
  }

  public set value(value: T | undefined) {
    if (value === undefined) {
      this._state = { loaded: false }
    } else {
      this._state = { loaded: true, value }
    }
  }

  public set(key: Key): void {
    // the loose equality here is on purpose. changing from key '2' to key 2 shouldn't do anything because
    // the resulting URL would be the same.
    if (key != this._key) {
      this._key = key
      this._state = { loaded: false }
    }
  }

  public async get(): Promise<T> {
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
    const keyUsed = this.key
    this.value = await this._resource.get(keyUsed)
    const receivedKey = this.value[this._resource.keyProperty]
    // the loose equality here is on purpose. see the set(...) method above.
    if (receivedKey != keyUsed) {
      console.warn(
        `Reference loaded from key ${JSON.stringify(keyUsed)} has a different key ${JSON.stringify(receivedKey)}`,
      )
    }
  }
}
