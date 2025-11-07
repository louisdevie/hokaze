import L from '@module/locale'
import type { Key } from '@module/resources'

export interface Referenceable<T> {
  keyProperty: keyof T
  get(key: Key): Promise<T>
}

type RefState<T> = { loaded: false } | { loaded: true; value: T }

/**
 * A reference to a resource in a collection.
 */
export class Ref<T> {
  private readonly _resource: Referenceable<T>
  private _key: Key
  private _state: RefState<T>

  private constructor(resource: Referenceable<T>, key: Key, state: RefState<T>) {
    this._resource = resource
    this._key = key
    this._state = state
  }

  /**
   * Creates a ref without value.
   * @param resource The referenced collection resource.
   * @param key The key of the item in this collection.
   */
  public static fromKey<T>(resource: Referenceable<T>, key: Key): Ref<T> {
    return new Ref(resource, key, { loaded: false })
  }

  /**
   * Creates a ref with a value.
   * @param resource The referenced collection resource.
   * @param value The item from the collection.
   */
  public static fromValue<T>(resource: Referenceable<T>, value: T): Ref<T> {
    return new Ref(resource, value[resource.keyProperty] as Key, {
      loaded: true,
      value,
    })
  }

  /**
   * The key of the item in the collection.
   */
  public get key(): Key {
    return this._key
  }

  /**
   * The value of the item, or `undefined` if this ref is unloaded.
   */
  public get value(): T | undefined {
    return this._state.loaded ? this._state.value : undefined
  }

  public set value(value: T | undefined) {
    if (value === undefined || value === null) {
      this._state = { loaded: false }
    } else {
      this._key = value[this._resource.keyProperty] as Key
      this._state = { loaded: true, value }
    }
  }

  /**
   * Changes the key and *unloads* the value. Use {@link change} to reload it immediately instead.
   * @param key The key to the new item to reference.
   */
  public select(key: Key): void {
    // the loose equality here is on purpose. changing from key '2' to key 2 shouldn't do anything because
    // the resulting URL would be the same.
    if (key != this._key) {
      this._key = key
      this._state = { loaded: false }
    }
  }

  /**
   * Returns the referenced item, loading it if necessary.
   */
  public async get(): Promise<T> {
    if (!this._state.loaded) await this.reload()
    if (!this._state.loaded) throw new Error(L.failedToLoadRef)
    return this._state.value
  }

  /**
   * Changes the key and *reloads* the value. Use {@link select} if you don't want to reload the value immediately.
   * @param key The key to the new item to reference.
   */
  public async change(key: Key): Promise<void> {
    // see the comment inside the set method
    if (key != this._key) {
      this._key = key
      this._state = { loaded: false }
      await this.reload()
    }
  }

  private async reload(): Promise<void> {
    const requested = this._key
    this.value = await this._resource.get(requested)
    const received = this.value[this._resource.keyProperty]
    // the loose equality here is on purpose. see the set(...) method above.
    if (received != requested) {
      XXXwarn(L.keyIsDifferent(requested, received))
    }
  }
}
