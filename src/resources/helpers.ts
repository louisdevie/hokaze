import { UrlSearchArgs } from '@module/url'

export type OptionalSearchArgs = UrlSearchArgs | undefined

export function noArgs(search: OptionalSearchArgs): boolean {
  return search === undefined || Object.keys(search).length === 0
}