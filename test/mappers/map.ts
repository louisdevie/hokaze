import { DataDescriptor } from '@module/data'
import { Mapper } from '@module/mappers'

export function pack<T>(value: T, descriptorOrMapper: DataDescriptor<T> | Mapper<T>): BodyInit | null {
  if ('makeMapper' in descriptorOrMapper) {
    descriptorOrMapper = descriptorOrMapper.makeMapper()
  }
  return descriptorOrMapper.pack(value).intoBodyInit()
}

export function unpack<T>(dto: Response, descriptorOrMapper: DataDescriptor<T> | Mapper<T>): Promise<T> {
  if ('makeMapper' in descriptorOrMapper) {
    descriptorOrMapper = descriptorOrMapper.makeMapper()
  }
  return descriptorOrMapper.unpack(dto)
}
