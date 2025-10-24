import { DataDescriptor } from '@module/data'
import { ObjectDescriptor } from '@module/data/serialized/object'
import type {
  CustomRequestInit,
  EmptyCustomRequestInit,
  RxOnlyCustomRequestInit,
  SpecificRequestType,
} from '@module/requests'
import { makeDeleteRequest, makeGetRequest, makePostRequest, makePutRequest } from '@module/requests/factory'
import { CollectionResource, SingleResource, TypeOfData } from '@module/resources'
import { makeCollectionResource, makeSingleResource } from '@module/resources/factory'
import type { UrlTemplate } from '@module/url'
import type { HttpClient } from 'http'

export interface RequestPathInit {
  baseUrl: UrlTemplate
  httpClient: HttpClient
}

/**
 * A path base from which resources and requests can be created.
 */
export interface RequestPath {
  /**
   * Creates a resource that is a list of objects.
   * @param name The name of the resource as it appears in the URL.
   * @param descriptor An object describing the resource.
   */
  collection<Descriptor extends ObjectDescriptor<unknown>>(
    name: string,
    descriptor: Descriptor,
  ): CollectionResource<TypeOfData<Descriptor>>

  /**
   * Creates a simple resource.
   * @param name The name of the resource as it appears in the URL.
   * @param descriptor An object describing the resource.
   */
  single<Descriptor extends DataDescriptor<unknown>>(
    name: string,
    descriptor: Descriptor,
  ): SingleResource<TypeOfData<Descriptor>>

  /**
   * Crates a custom GET request.
   * @param init An object describing the endpoint.
   */
  getRequest<Init extends RxOnlyCustomRequestInit<unknown>>(init: Init): SpecificRequestType<Init>

  /**
   * Crates a custom POST request.
   * @param init An object describing the endpoint.
   */
  postRequest<Init extends CustomRequestInit<unknown, unknown>>(init: Init): SpecificRequestType<Init>

  /**
   * Crates a custom PUT request.
   * @param init An object describing the endpoint.
   */
  putRequest<Init extends CustomRequestInit<unknown, unknown>>(init: Init): SpecificRequestType<Init>

  /**
   * Crates a custom DELETE request.
   * @param init An object describing the endpoint.
   */
  deleteRequest<Init extends EmptyCustomRequestInit | RxOnlyCustomRequestInit<unknown>>(
    init: Init,
  ): SpecificRequestType<Init>
}

/**
 * An implementation of {@link RequestPath} that uses the default factories.
 */
export class DefaultRequestPath implements RequestPath {
  private readonly _baseUrl: UrlTemplate
  private readonly _httpClient: HttpClient

  public constructor(init: RequestPathInit) {
    this._baseUrl = init.baseUrl
    this._httpClient = init.httpClient
  }

  protected get httpClient(): HttpClient {
    return this._httpClient
  }

  // we have to cast the returned value in every method below because the compiler can't guarantee what an inferred type
  // will be (for example, TypeOfData<Something> when Something extends DataDescriptor<T> will actually always be T)
  // see also data/serialized/object.ts line 121

  public collection<Descriptor extends ObjectDescriptor<unknown>>(
    name: string,
    descriptor: Descriptor,
  ): CollectionResource<TypeOfData<Descriptor>> {
    return makeCollectionResource({
      baseUrl: this._baseUrl,
      httpClient: this._httpClient,
      name,
      descriptor,
    }) as CollectionResource<TypeOfData<Descriptor>>
  }

  public single<Descriptor extends DataDescriptor<unknown>>(
    name: string,
    descriptor: Descriptor,
  ): SingleResource<TypeOfData<Descriptor>> {
    return makeSingleResource({
      baseUrl: this._baseUrl,
      httpClient: this._httpClient,
      name,
      descriptor,
    }) as SingleResource<TypeOfData<Descriptor>>
  }

  public getRequest<Init extends RxOnlyCustomRequestInit<R>, R>(init: Init): SpecificRequestType<Init> {
    return makeGetRequest(this._baseUrl, this._httpClient, init) as SpecificRequestType<Init>
  }

  public postRequest<Init extends CustomRequestInit<unknown, unknown>>(init: Init): SpecificRequestType<Init> {
    return makePostRequest(this._baseUrl, this._httpClient, init) as SpecificRequestType<Init>
  }

  public putRequest<Init extends CustomRequestInit<unknown, unknown>>(init: Init): SpecificRequestType<Init> {
    return makePutRequest(this._baseUrl, this._httpClient, init) as SpecificRequestType<Init>
  }

  public deleteRequest<Init extends EmptyCustomRequestInit | RxOnlyCustomRequestInit<unknown>>(
    init: Init,
  ): SpecificRequestType<Init> {
    return makeDeleteRequest(this._baseUrl, this._httpClient, init) as SpecificRequestType<Init>
  }
}
