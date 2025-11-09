/**
 * A converter between JavaScript values and serialized data to exchange with a webservice.
 */
export interface Mapper<T> {
  /**
   * Transforms a value to be sent.
   */
  pack(value: unknown): RequestData

  /**
   * Creates a value from data that was received.
   */
  unpack(response: ResponseData): Promise<T>

  /**
   * The expected media type of the response data.
   */
  readonly expectedMediaType?: string
}

/**
 * Possible request data binding targets.
 */
export enum BindingTarget {
  RequestBody = 'B',
  URLParams = 'P',
  URLQueryParams = 'Q',
}

/**
 * Data to send to a webservice.
 */
export interface RequestData {
  /**
   * Flags indicating where the data can be used.
   */
  bindTo: BindingTarget[]

  /**
   * The media type of the data.
   */
  mediaType?: string

  /**
   * The content of the request.
   */
  value: string | Blob | null
}

/**
 * Data received from a webservice.
 */
export interface ResponseData {
  /**
   * The media type of the data.
   */
  mediaType?: string

  /**
   * Reads the content of the response as text.
   */
  getText(): Promise<string>

  /**
   * Reads the content of the response as binary data.
   */
  getBlob(): Promise<Blob>
}
