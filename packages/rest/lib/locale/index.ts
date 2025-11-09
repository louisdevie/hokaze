import { elz } from './gen'

export { default } from './gen'

elz.useStaticDefaultLocale()

export function setLocale(locale: string): void {
  elz.useLocale(locale).catch((reason: unknown) => {
    XXXerror(`Error while setting the Hokaze locale to '${locale}'`, reason)
  })
}
