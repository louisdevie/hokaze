import _defaultEnglishLocale from './en'

export interface LocaleData {}

export class Locale {
  public static get current(): LocaleData {
    return _defaultEnglishLocale
  }

  public static format(key: keyof LocaleData, data: any) {
    return
  }
}
