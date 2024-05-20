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
import { Throw } from '@module/errors'

export interface LayeredResourceInit {
  baseUrl: UrlTemplate
  descriptor: ResourceDescriptor
  httpClient: HttpClient
}

export class LayeredResourceFactory {
  public static makeCollectionResource<T extends object>(init: LayeredResourceInit): LayeredCollectionResource<T> {
    const rawLayers = this.makeRawLayers(init)

    const manager = new CollectionManager<T>(init.descriptor)

    const mapper = new Mapper<any, T>(init.descriptor.fields)
    const keyExtractionMethods = this.makeKeyExtractionMethods(mapper, manager, init)
    const mappingLayer = new CollectionMappingLayer(mapper, keyExtractionMethods, rawLayers)

    return new LayeredCollectionResource(mappingLayer, manager, this.getAllowedOperations(init))
  }

  public static makeSingleResource<T extends object>(init: LayeredResourceInit): LayeredSingleResource<T> {
    const rawLayers = this.makeRawLayers(init)

    const manager = new SingleResourceManager<T>(init.descriptor)

    const mapper = new Mapper<any, T>(init.descriptor.fields)
    const mappingLayer = new SingleMappingLayer(mapper, rawLayers)

    return new LayeredSingleResource(mappingLayer, manager, this.getAllowedOperations(init))
  }

  private static makeKeyExtractionMethods(
    mapper: Mapper<any, any>,
    manager: CollectionManager<any>,
    init: LayeredResourceInit,
  ): KeyExtractionMethod[] {
    return [
      new ExtractFromObjectBody(mapper, manager.key as string),
      new ExtractFromKeyBody(),
      new ExtractFromLocationUrl(init.baseUrl.getUrlForResource(init.descriptor.name, {}), manager.keyKind),
    ]
  }

  private static makeRawLayers(init: LayeredResourceInit) {
    // no cache layer yet
    // const cacheLayer = new CacheLayer(...)
    return new HttpLayer(init.httpClient, init.baseUrl, init.descriptor.name)
  }

  private static getAllowedOperations(init: LayeredResourceInit): AllowedOperations {
    let ops: AllowedOperations

    if (init.descriptor.readOnly) {
      if (init.descriptor.writeOnly) {
        Throw.bothReadOnlyAndWriteOnly()
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
}
