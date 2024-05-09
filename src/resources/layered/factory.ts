import type { HttpClient } from '@module/backend'
import type { ResourceDescriptor } from '@module/resources'
import type { UrlTemplate } from '@module/url'

import { HttpLayer } from '@module/resources/layered/httpLayer'
import { CollectionMappingLayer } from '@module/resources/layered/mappingLayers'
import { LayeredCollectionResource } from '@module/resources/layered/resources'

import { KeyExtractionMethod, Mapper } from '@module/resources/mappers'
import {
  ExtractFromKeyBody,
  ExtractFromLocationUrl,
  ExtractFromObjectBody,
} from '@module/resources/mappers/keyExtraction'
import { CollectionManager } from '@module/resources/managers'

export interface LayeredResourceInit {
  baseUrl: UrlTemplate
  descriptor: ResourceDescriptor
  httpClient: HttpClient
  path: string
}

export class LayeredResourceFactory {
  public static makeCollectionResource<T extends object>(init: LayeredResourceInit): LayeredCollectionResource<T> {
    const rawLayers = this.makeRawLayers(init)

    const manager = new CollectionManager<T>(init.descriptor)

    const mapper = new Mapper<any, T>(init.descriptor)
    const keyExtractionMethods = this.makeKeyExtractionMethods(mapper, manager, init)
    const mappingLayer = new CollectionMappingLayer(mapper, keyExtractionMethods, rawLayers)

    return new LayeredCollectionResource(mappingLayer, manager)
  }

  private static makeKeyExtractionMethods(
    mapper: Mapper<any, any>,
    manager: CollectionManager<any>,
    init: LayeredResourceInit,
  ): KeyExtractionMethod[] {
    return [
      new ExtractFromObjectBody(mapper, manager.key as string),
      new ExtractFromKeyBody(),
      new ExtractFromLocationUrl(init.baseUrl.getUrlForResource(init.path, {}), manager.keyKind),
    ]
  }

  private static makeRawLayers(init: LayeredResourceInit) {
    // no cache layer yet
    // const cacheLayer = new CacheLayer(...)
    return new HttpLayer(init.httpClient, init.baseUrl, init.path)
  }
}
