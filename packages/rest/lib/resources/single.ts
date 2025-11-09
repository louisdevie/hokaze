import { DataDescriptor } from '@module/data'
import { Service } from '@module/service'
import { ResourceRequestBuilder } from './requestBuilder'

/**
 * Represents a REST resource as a single value.
 */
export class SingleResource<T> {
  private readonly _requestBuilder: ResourceRequestBuilder
  private readonly _descriptor: DataDescriptor<T>
  private readonly _mapper: Mapper<T>
  private readonly _allowedOperations: AllowedOperations

  public constructor(service: Service, name: string, descriptor: DataDescriptor<T>) {
    this._requestBuilder = new ResourceRequestBuilder(init.httpClient, init.baseUrl, init.name)
    this._descriptor = descriptor
    this._mapper = descriptor.makeMapper()
    this._allowedOperations = allowedOperations
  }

  public get asPath(): RequestPath {
    return this._requestBuilder.resourcePath
  }

  public get descriptor(): DataDescriptor<T> {
    return this._descriptor
  }

  /**
   * Reads the value of resource.
   */
  public async get(): Promise<T> {
    if (this._allowedOperations === 'w') throwError(L.writeOnlyResource)

    const dto = await this._requestBuilder.getAll(this._mapper.expectedResponseType)
    return this._mapper.unpack(dto)
  }

  /**
   * Creates a new blank value of the resource.
   */
  public create(): T {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)

    return this._descriptor.makeBlankValue()
  }

  /**
   * Sends a value to the resource.
   * @param value The item to send.
   */
  public async send(value: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)
    this._descriptor.validate(value).throwIfInvalid()

    const dto = this._mapper.pack(value)
    await this._requestBuilder.saveNew(dto, AnyResponseType)
  }

  /**
   * Updates the value of the resource.
   * @param value The object obtained using the {@link get} or {@link create} methods.
   */
  public async save(value: T): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)
    this._descriptor.validate(value).throwIfInvalid()

    const dto = this._mapper.pack(value)
    await this._requestBuilder.saveAll(dto, AnyResponseType)
  }

  /**
   * Clears the value of the resource.
   */
  public async delete(): Promise<void> {
    if (this._allowedOperations === 'r') throwError(L.readOnlyResource)

    await this._requestBuilder.deleteAll(AnyResponseType)
  }
}
