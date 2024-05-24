import { ObjectTypeFromFields, ResourceFields } from '@module/resources'

/**
 * Describes a custom request.
 */
export interface CustomRequestDescriptor {
  /**
   * The name of the resource as it appears in the URL.
   */
  path: string

  /**
   * Describes the objects sent.
   */
  request?: ResourceFields

  /**
   * Describes the objects received.
   */
  response?: ResourceFields

  /**
   * Describes the objects sent and received.
   */
  requestAndResponse?: ResourceFields
}

type WithRequest = { request: ResourceFields }
type WithResponse = { response: ResourceFields }
type WithRequestAndResponse = { requestAndResponse: ResourceFields }

export type RequestType<Descriptor extends CustomRequestDescriptor> =
  Descriptor extends WithRequest ? [ObjectTypeFromFields<Descriptor['request']>]
  : Descriptor extends WithRequestAndResponse ? [ObjectTypeFromFields<Descriptor['requestAndResponse']>]
  : []

export type ResponseType<Descriptor extends CustomRequestDescriptor> =
  Descriptor extends WithResponse ? ObjectTypeFromFields<Descriptor['response']>
  : Descriptor extends WithRequestAndResponse ? ObjectTypeFromFields<Descriptor['requestAndResponse']>
  : undefined

export type RequestParams = [] | [object]
export type RequestReturn = object | undefined

export interface CustomRequest<Q extends RequestParams, R extends RequestReturn> {
  send(...request: Q): Promise<R>
}
