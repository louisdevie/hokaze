import { elz } from './gen'

export { default } from './gen'

elz.useStaticDefaultLocale()

export function setLocale(locale: string): void {
  elz.useLocale(locale).catch((reason: unknown) => {
    console.error(`Error while setting the Hokaze locale to '${locale}'`, reason)
  })
}
