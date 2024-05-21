import type { ResourceDescriptor } from '@module/resources'
import type { KeyKind } from '@module/fields'
import { FieldListInterpreter } from './fieldList'
import { DescriptorMapInterpreter } from './descriptorMap'

export interface DescriptorInterpreter {
  findKey(): { property: string; kind: KeyKind }
  createInstance(keyProperty: string | number | symbol | undefined): unknown
  copy(from: Record<string, unknown>, to: Record<string, unknown>): void
}

export function getInterpreterFor(descriptor: ResourceDescriptor): DescriptorInterpreter {
  let interpreter
  if (Array.isArray(descriptor.fields)) {
    interpreter = new FieldListInterpreter(descriptor)
  } else {
    interpreter = new DescriptorMapInterpreter(descriptor)
  }
  return interpreter
}
