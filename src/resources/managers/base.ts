import { KeyKind } from '@module/fields'
import { Key } from '@module/resources'
import { Manager } from './index'

export abstract class BaseManager<T> implements Manager<T> {
  public abstract get key(): keyof T

  public abstract get keyKind(): KeyKind

  public isNew(item: T): boolean {
    return item[this.key] === null
  }

  public getKeyOf(item: T): Key {
    return item[this.key] as Key
  }

  public setKeyOf(item: T, key: Key): void {
    item[this.key] = key as any
  }

  public abstract createInstance(): T
}
