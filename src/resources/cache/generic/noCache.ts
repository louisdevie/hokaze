import { Key } from '@module/resources'
import { ResourceCache, ServiceCache } from '@module/resources/cache'
import { OptionalSearchArgs } from '@module/resources/helpers'

export class NoGSC implements ServiceCache {
  public async resource<T>(name: string): Promise<ResourceCache<T>> {
    return new NoGRC()
  }
}

export class NoGRC implements ResourceCache<any> {
  public async beforeGet(): Promise<any> {
    return undefined
  }
  public async afterGet(): Promise<void> {}
  public async beforeGetAll(): Promise<any[] | undefined> {
    return undefined
  }
  public async afterGetAll(): Promise<void> {}
  public async onSend(): Promise<void> {}
  public async onSendMany(): Promise<void> {}
  public async onSave(): Promise<void> {}
  public async onSaveMany(): Promise<void> {}
  public async onDelete(): Promise<void> {}
  public async onDeleteKey(): Promise<void> {}
  public async onDeleteMany(): Promise<void> {}
  public async onDeleteAll(): Promise<void> {}
}
