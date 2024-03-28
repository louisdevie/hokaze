export default class ResourceUrl {
  private readonly _url: URL;

  public constructor(baseUrl: string | URL) {
    if (typeof baseUrl === "string") {
      this._url = new URL(baseUrl);
    } else {
      this._url = baseUrl;
    }
  }
}
