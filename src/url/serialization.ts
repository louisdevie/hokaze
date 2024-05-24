import { throwError } from '@module/errors'
import __ from '@module/locale'

export type UrlSerializationBehavior = 'throw' | 'placeholder' | 'json' | 'json+base64'

export const UrlSerializationImpl: { [B in UrlSerializationBehavior]: (value: object) => string } = {
  throw: () => throwError(__.objectInUrlNotAllowed),

  placeholder: () => '[object]',

  json: (value) => JSON.stringify(value),

  'json+base64': (value) => atob(JSON.stringify(value)),
}
