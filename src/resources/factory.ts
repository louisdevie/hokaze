import { UrlTemplate } from '@module/url'
import { DataDescriptor } from '@module/data'
import { HttpClient } from '@module/backend'
import { AllowedOperations, GenericCollectionResource, GenericSingleResource } from '@module/resources/generic'
import { ResourceRequestBuilder } from '@module/resources/requestBuilder'
import { throwError } from '@module/errors'
import __ from '@module/locale'
import { CollectionResource } from '@module/resources/index'
import { ObjectDescriptor } from '@module/data/serialized/object'
import {
  ExtractFromKeyBody,
  ExtractFromLocationUrl,
  ExtractFromObjectBody,
} from '@module/mappers/serialized/keyExtraction'

export interface ResourceInit<T> {
  baseUrl: UrlTemplate
  name: string
  httpClient: HttpClient
  descriptor: DataDescriptor<T>
}

export interface CollectionResourceInit<T> extends ResourceInit<T> {
  descriptor: ObjectDescriptor<T>
}

export function makeCollectionResource<T>(init: CollectionResourceInit<T>): CollectionResource<T> {
  const requestBuilder = new ResourceRequestBuilder(init.httpClient, init.baseUrl, init.name)
  const key = init.descriptor.findKey(init.name)
  const mapper = init.descriptor.makeMapper()
  mapper.setKeyProperty(key.property)
  const extractionMethods = [
    new ExtractFromObjectBody(mapper),
    new ExtractFromKeyBody(),
    new ExtractFromLocationUrl(init.baseUrl.getUrlForResource(init.name, {}), key.kind),
  ]
  return new GenericCollectionResource(
    requestBuilder,
    init.descriptor,
    mapper,
    key.property as keyof T,
    getAllowedOperations(init),
    extractionMethods,
  )
}

export function makeSingleResource<T>(init: ResourceInit<T>): GenericSingleResource<T> {
  const requestBuilder = new ResourceRequestBuilder(init.httpClient, init.baseUrl, init.name)
  return new GenericSingleResource(requestBuilder, init.descriptor, getAllowedOperations(init))
}

function getAllowedOperations(init: ResourceInit<unknown>): AllowedOperations {
  let ops: AllowedOperations

  if (init.descriptor.isReadable) {
    if (init.descriptor.isWritable) {
      ops = 'rw'
    } else {
      ops = 'r'
    }
  } else {
    if (init.descriptor.isWritable) {
      ops = 'w'
    } else {
      throwError(__.bothReadOnlyAndWriteOnly)
    }
  }

  return ops
}
