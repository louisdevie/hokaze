import type { Interceptor, InterceptorFunction } from '.'
import { badResponse } from './badResponse'
import { throwError } from '@module/errors'
import L from '@module/locale'

export type InterceptConfig = (Interceptor | InterceptorFunction)[]

export const DefaultInterceptConfig: InterceptConfig = [badResponse()]

export type PartialInterceptConfig = (Interceptor | InterceptorFunction | 'base')[]

export function mergeInterceptConfig(
  base: InterceptConfig,
  override: PartialInterceptConfig | undefined,
): InterceptConfig {
  let merged: InterceptConfig = []
  if (override === undefined) {
    merged.push(...base)
  } else if (Array.isArray(override)) {
    let baseKeywordReplaced = false
    for (const o of override) {
      if (o === 'base') {
        if (baseKeywordReplaced) {
          throwError(L.baseKeywordCanAppearOnlyOnce)
        } else {
          merged.push(...base)
        }
      } else {
        merged.push(o)
      }
    }
  } else {
    merged.push(override)
  }
  return merged
}
