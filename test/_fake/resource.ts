import { RequestPath } from '@module/requestPath'
import type { Key, CollectionResource } from '@module/resources'
import { UrlSearchArgs } from '@module/url'
import { fakeRequestPath } from './requestPath'

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

  public readonly key: keyof Fruit = 'id'

  public readonly asPath: RequestPath = fakeRequestPath()

  private notFound(key: Key): never {
    throw new Error(`Item not found for key '${key}'`)
  }

  public async get(key: Key): Promise<Fruit> {
    return this._fruits.get(typeof key === 'number' ? key : this.notFound(key)) ?? this.notFound(key)
  }

  public async getAll(): Promise<Fruit[]> {
    return Array.from(this._fruits.values())
  }

  public create(): Fruit {
    return { id: -1, name: '' }
  }

  public async send(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async save(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async delete(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async deleteKey(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async deleteAll(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export function fakeResource(): CollectionResource<Fruit> {
  return new FruitsResourceImpl()
}
