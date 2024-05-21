import type { HttpClient } from '@module/backend'
import type { ResourceDescriptor } from '@module/resources'
import type { UrlTemplate } from '@module/url'
import { HttpLayer } from '@module/resources/layered/httpLayer'
import { CollectionMappingLayer, SingleMappingLayer } from '@module/resources/layered/mappingLayers'
import {
  AllowedOperations,
  LayeredCollectionResource,
  LayeredSingleResource,
} from '@module/resources/layered/resources'
import { KeyExtractionMethod, Mapper } from '@module/resources/mappers'
import {
  ExtractFromKeyBody,
  ExtractFromLocationUrl,
  ExtractFromObjectBody,
} from '@module/resources/mappers/keyExtraction'
import { CollectionManager, SingleResourceManager } from '@module/resources/managers'
import { RawSendAndReceive } from '@module/resources/layered/abstractLayers'
import { throwError } from '@module/errors'
import __ from '@module/locale'

export interface LayeredResourceInit {
  baseUrl: UrlTemplate
  descriptor: ResourceDescriptor
  httpClient: HttpClient
}

export function makeCollectionResource<T extends object>(init: LayeredResourceInit): LayeredCollectionResource<T> {
  const rawLayers = makeRawLayers(init)

  const manager: CollectionManager<T> = new CollectionManager(init.descriptor)

  const mapper: Mapper<NonNullable<unknown>, T> = new Mapper(init.descriptor.fields)
  const keyExtractionMethods = makeKeyExtractionMethods(mapper, manager, init)
  const mappingLayer = new CollectionMappingLayer(mapper, keyExtractionMethods, rawLayers)

  return new LayeredCollectionResource(mappingLayer, manager, getAllowedOperations(init), rawLayers.requestPath)
}

export function makeSingleResource<T extends object>(init: LayeredResourceInit): LayeredSingleResource<T> {
  const rawLayers = makeRawLayers(init)

  const manager: SingleResourceManager<T> = new SingleResourceManager(init.descriptor)

  const mapper: Mapper<NonNullable<unknown>, T> = new Mapper(init.descriptor.fields)
  const mappingLayer = new SingleMappingLayer(mapper, rawLayers)

  return new LayeredSingleResource(mappingLayer, manager, getAllowedOperations(init), rawLayers.requestPath)
}

function makeKeyExtractionMethods<T extends object>(
  mapper: Mapper<NonNullable<unknown>, T>,
  manager: CollectionManager<T>,
  init: LayeredResourceInit,
): KeyExtractionMethod[] {
  return [
    new ExtractFromObjectBody(mapper, manager.key as string),
    new ExtractFromKeyBody(),
    new ExtractFromLocationUrl(init.baseUrl.getUrlForResource(init.descriptor.name, {}), manager.keyKind),
  ]
}

function makeRawLayers(init: LayeredResourceInit): RawSendAndReceive {
  // no cache layer yet
  // const cacheLayer = new CacheLayer(...)
  return new HttpLayer(init.httpClient, init.baseUrl, init.descriptor.name)
}

function getAllowedOperations(init: LayeredResourceInit): AllowedOperations {
  let ops: AllowedOperations

  if (init.descriptor.readOnly) {
    if (init.descriptor.writeOnly) {
      throwError(__.bothReadOnlyAndWriteOnly)
    } else {
      ops = 'r'
    }
  } else {
    if (init.descriptor.writeOnly) {
      ops = 'w'
    } else {
      ops = 'rw'
    }
  }

  return ops
}
