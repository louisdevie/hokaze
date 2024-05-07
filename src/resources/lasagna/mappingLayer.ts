import { Key, SendAndReceive } from '@module/resources'
import { UrlSearchArgs } from '@module/url'

export class MappingLayer<T> implements SendAndReceive<T> {
  get(key: Key, args?: UrlSearchArgs | undefined): Promise<T> {
    throw new Error('Method not implemented.')
  }
  getAll(args?: UrlSearchArgs | undefined): Promise<T[]> {
    throw new Error('Method not implemented.')
  }
  send(item: T, args?: UrlSearchArgs | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  sendMany(items: T[], args?: UrlSearchArgs | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  save(item: T, args?: UrlSearchArgs | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  saveMany(items: T[], args?: UrlSearchArgs | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  delete(item: T, args?: UrlSearchArgs | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  deleteKey(key: Key, args?: UrlSearchArgs | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  deleteMany(items: T[], args?: UrlSearchArgs | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  deleteAll(args?: UrlSearchArgs | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
}