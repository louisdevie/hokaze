import { Key, Resource } from '@module/resources'

export interface Fruit {
  id: number
  name: string
}

class FruitsResourceImpl implements Resource<Fruit> {
  private _fruits: Map<number, Fruit>

  public constructor() {
    this._fruits = new Map([
      [1, { id: 1, name: 'Apple' }],
      [2, { id: 2, name: 'Pear' }],
      [3, { id: 3, name: 'Apricot' }],
      [4, { id: 4, name: 'Plum' }],
    ])
  }

  public readonly key = 'id'

  private notFound(key: Key): never {
    throw new Error(`Item not found for key '${key}'`)
  }

  public get(key: Key): Fruit {
    return this._fruits.get(typeof key === 'number' ? key : this.notFound(key)) ?? this.notFound(key)
  }

  public getAll(): Fruit[] {
    return Array.from(this._fruits.values())
  }

  public create(): Fruit {
    return { id: 0, name: '' }
  }

  public send(item: Fruit): void {
    throw new Error('Method not implemented.')
  }

  public sendMany(items: Fruit[]): void {
    throw new Error('Method not implemented.')
  }

  public save(item: Fruit): void {
    throw new Error('Method not implemented.')
  }

  public saveMany(items: Fruit[]): void {
    throw new Error('Method not implemented.')
  }

  public delete(item: Fruit): void {
    throw new Error('Method not implemented.')
  }

  public deleteKey(key: Key): void {
    throw new Error('Method not implemented.')
  }

  public deleteMany(items: Fruit[]): void {
    throw new Error('Method not implemented.')
  }

  public deleteAll(): void {
    throw new Error('Method not implemented.')
  }
}

export default function fakeResource(): Resource<Fruit> {
  return new FruitsResourceImpl()
}
