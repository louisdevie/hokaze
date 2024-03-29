import { SendAndReceive, Key, Manager } from '.';


export abstract class ResourceChain<ItemType> implements SendAndReceive<ItemType> {
  private readonly _manager: Manager<ItemType>;
  private _next?: ResourceChain<ItemType>;

  public constructor(manager: Manager<ItemType>) {
    this._manager = manager;
  }

  public addNext(next: ResourceChain<ItemType>): void {
    this._next = next;
  }

  protected get manager(): Manager<ItemType> {
    return this._manager;
  }

  public abstract get(key: Key, args?: Record<string, any> | undefined): Promise<ItemType>;

  public abstract getAll(args?: Record<string, any> | undefined): Promise<ItemType[]>;

  public abstract send(item: ItemType, args?: Record<string, any> | undefined): Promise<void>;

  public abstract sendMany(items: ItemType[], args?: Record<string, any> | undefined): Promise<void>;

  public abstract save(item: ItemType, args?: Record<string, any> | undefined): Promise<void>;

  public abstract saveMany(items: ItemType[], args?: Record<string, any> | undefined): Promise<void>;

  public abstract delete(item: ItemType, args?: Record<string, any> | undefined): Promise<void>;

  public abstract deleteKey(key: Key, args?: Record<string, any> | undefined): Promise<void>;

  public abstract deleteMany(items: ItemType[], args?: Record<string, any> | undefined): Promise<void>;

  public abstract deleteAll(args?: Record<string, any> | undefined): Promise<void>;
}
