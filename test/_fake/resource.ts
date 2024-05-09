import type { Key, CollectionResource } from '@module/resources'
import { Manager } from '@module/resources/managers'

export interface Fruit {
  id: number
  name: string
}

class FruitsResourceImpl implements CollectionResource<Fruit>, Manager<Fruit> {
  private _fruits: Map<number, Fruit>

  public constructor() {
    this._fruits = new Map([
      [1, { id: 1, name: 'Apple' }],
      [2, { id: 2, name: 'Pear' }],
      [3, { id: 3, name: 'Apricot' }],
      [4, { id: 4, name: 'Plum' }],
    ])
  }

  public isNew(item: Fruit): boolean {
    return !this._fruits.has(item.id)
  }

  public readonly key = 'id'

  public readonly keyKind = 'number'

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
    return { id: 0, name: '' }
  }

  public async send(item: Fruit): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async sendMany(items: Fruit[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async save(item: Fruit): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async saveMany(items: Fruit[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async delete(item: Fruit): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async deleteKey(key: Key): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async deleteMany(items: Fruit[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async deleteAll(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export function fakeResource(): CollectionResource<Fruit> {
  return new FruitsResourceImpl()
}

export function fakeManager(): Manager<Fruit> {
  return new FruitsResourceImpl()
}
