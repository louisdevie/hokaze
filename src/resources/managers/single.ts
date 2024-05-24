import { DescriptorInterpreter, getInterpreterFor } from '@module/resources/managers/interpreters'
import type { ResourceDescriptor } from '@module/resources'

export class SingleResourceManager<T extends object> {
  private readonly _interpreter: DescriptorInterpreter

  public constructor(descriptor: ResourceDescriptor) {
    this._interpreter = getInterpreterFor(descriptor)
  }

  public createOrUpdate(item: T): T {
    return item // no management
  }

  public createInstance(): T {
    return this._interpreter.createInstance(undefined) as T
  }
}
