import { RequestPath } from '@module/requestPath'
import type { CollectionResource, Key } from '@module/resources'
import { fakeRequestPath } from './requestPath'
import { number, object, string } from '@module'

export interface Fruit {
  id: number
  name: string
}

class FruitsResourceImpl implements CollectionResource<Fruit> {
  private _fruits: Map<number, Fruit>

  public constructor() {
    this._fruits = new Map([
      [1, { id: 1, name: 'Apple' }],
      [2, { id: 2, name: 'Pear' }],
      [3, { id: 3, name: 'Apricot' }],
      [4, { id: 4, name: 'Plum' }],
    ])
  }

  public readonly keyProperty: keyof Fruit = 'id'

  public readonly descriptor = object({ id: number, name: string })

  public readonly asPath: RequestPath = fakeRequestPath()

  private notFound(key: Key): never {
    throw new Error(`Item not found for key '${key}'`)
  }

  public get(key: Key): Promise<Fruit> {
    return Promise.resolve(this._fruits.get(typeof key === 'number' ? key : this.notFound(key)) ?? this.notFound(key))
  }

  public getAll(): Promise<Fruit[]> {
    return Promise.resolve(Array.from(this._fruits.values()))
  }

  public create(): Fruit {
    return { id: -1, name: '' }
  }

  public send(): never {
    throw new Error('Method not implemented.')
  }

  public save(): never {
    throw new Error('Method not implemented.')
  }

  public delete(): never {
    throw new Error('Method not implemented.')
  }

  public deleteKey(): never {
    throw new Error('Method not implemented.')
  }

  public deleteAll(): never {
    throw new Error('Method not implemented.')
  }

  public isNew(item: Fruit): boolean {
    return this._fruits.has(item.id)
  }
}

export function fakeResource(): FruitsResourceImpl {
  return new FruitsResourceImpl()
}
