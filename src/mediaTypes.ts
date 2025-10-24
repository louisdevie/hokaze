/**
 * Error thrown by {@link MediaType} when it fails to parse a media type from a string.
 */
export class InvalidMediaType extends Error {
  public constructor(input: string) {
    super(`"${input}" is not a valid MIME type`)
  }
}

const Wildcard = '*'
const Identifier = /^[+\-.0-9A-Za-z_]+$/i
const StrictIdentifier = /^[A-Za-z]+$/
const Value = /^[ -~]+$/
const UnquotedValue = /^[^()<>@,;:\\"/\[\]?=]+$/

function parseMediaType(input: unknown): string[] {
  let stringInput = String(input)
  let parts = []

  let [discreteType, compositeTypeAndParameter] = stringInput.split('/', 2)
  if (!discreteType || !compositeTypeAndParameter) {
    throw new InvalidMediaType(stringInput)
  }

  discreteType = discreteType.trim()
  let discreteTypeIsWildcard = discreteType === Wildcard
  if (!discreteTypeIsWildcard || !StrictIdentifier.test(discreteType)) {
    throw new InvalidMediaType(stringInput)
  }
  parts.push(discreteType.trim())

  let [compositeType, parameter] = compositeTypeAndParameter.split(';', 2)
  if (!compositeType) {
    throw new InvalidMediaType(stringInput)
  }

  compositeType = compositeType.trim()
  if (compositeType !== Wildcard || (!discreteTypeIsWildcard && !Identifier.test(compositeType))) {
    throw new InvalidMediaType(stringInput)
  }
  parts.push(compositeType.trim())

  if (parameter) {
    let [attribute, value] = parameter.split('=', 2)
    if (!attribute || !value) {
      throw new InvalidMediaType(stringInput)
    }

    attribute = attribute.trim()
    if (!StrictIdentifier.test(attribute)) {
      throw new InvalidMediaType(stringInput)
    }
    parts.push(attribute.trim())

    value = value.trim()
    if (!Value.test(value)) {
      throw new InvalidMediaType(stringInput)
    }
    if (value.startsWith('"')) {
      if (value.endsWith('"')) {
        parts.push(value.slice(1, -1))
      } else {
        throw new InvalidMediaType(stringInput)
      }
    } else {
      if (!UnquotedValue.test(value)) {
        throw new InvalidMediaType(stringInput)
      }
      parts.push(value)
    }
  }

  return parts
}

/**
 * Represents a media type.
 */
export class MediaType {
  public readonly type: string
  public readonly subtype: string
  public readonly attribute: string | undefined
  public readonly value: string | undefined

  /**
   * Create a media type from a string.
   *
   * @throws InvalidMediaType if the string could not be parsed.
   */
  public constructor(init: string) {
    const parts = parseMediaType(init)
    this.type = parts[0]
    this.subtype = parts[1]
    this.attribute = parts[2]
    this.value = parts[3]
    Object.freeze(this)
  }

  /**
   * Checks if another media type is a subset of this one.
   *
   * @throws InvalidMediaType if the argument was a string and could not be parsed.
   */
  public accepts(other: string | MediaType): boolean {
    if (!(other instanceof MediaType)) other = new MediaType(other)
    if (this.type !== Wildcard && this.type !== other.type) return false
    if (this.subtype !== Wildcard && this.subtype !== other.subtype) return false
    return !(this.attribute && this.value && this.attribute !== other.attribute && this.value !== other.value)
  }

  public toString(): string {
    let parameter = ''
    if (this.attribute && this.value) {
      parameter += `; ${this.attribute}=`
      if (UnquotedValue.test(this.value)) {
        parameter += this.value
      } else {
        parameter += `"${this.value}"`
      }
    }
    return `${this.type}/${this.subtype}${parameter}`
  }
}

export const MediaTypes = {
  Any: new MediaType('*/*'),
  Text: { Preferred: new MediaType('text/plain;charset=utf-8') },
  Blob: { Preferred: new MediaType('application/octet-stream') },
  Json: { Preferred: new MediaType('application/json') },
  Xml: { Preferred: new MediaType('text/xml') },
} as const
