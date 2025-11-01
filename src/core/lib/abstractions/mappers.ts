/**
 * A converter between JavaScript values and serialized data to exchange with a webservice.
 */
export interface Mapper<T> {
  /**
   * Transforms a value to be sent.
   */
  pack(value: T): RequestBodyOrParams

  /**
   * Creates a value from data that was received.
   */
  unpack(response: ResponseBody): Promise<T>

  /**
   * The expected media type of the response data.
   */
  readonly expectedMediaType?: string
}

/**
 * Data to send to a webservice.
 */
export interface RequestBodyOrParams {
  /**
   * The media type of the data.
   */
  mediaType?: string;

  /**
   * The content of the request.
   */
  value: string | Blob | null;
}

/**
 * Data received from a webservice.
 */
export interface ResponseBody {
  /**
   * Reads the content of the response as text.
   */
  getText(): Promise<string>

  /**
   * Reads the content of the response as binary data.
   */
  getBlob(): Promise<Blob>
}
