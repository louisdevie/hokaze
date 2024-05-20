import __ from '@module/locale'

export class Internal {
  public static descriptorNotSupported(): never {
    this.throwInternalError('Unsupported descriptor.')
  }

  private static throwInternalError(message: string): never {
    console.error('[EIKTOBEL INTERNAL ERROR] ' + message)
    console.warn(
      'The error above is not your fault. Please report it at : https://github.com/louisdevie/eiktobel/issues',
    )
    throw 'Interrupting because of internal error'
  }
}

export class Throw {
  public static couldNotInferKey(resourceName: string): never {
    throw new Error(
      `Couldn't infer the key property of the '${resourceName}' resource. Use .asKey() to specify which property to use.`,
    )
  }

  private static resourceKeyBase(resourceName: string, fieldName: string) {
    return `The field '${fieldName}' of the '${resourceName}' resource cannot be used as the key :`
  }

  public static badTypeKey(resourceName: string, fieldName: string): never {
    throw new Error(this.resourceKeyBase(resourceName, fieldName) + 'only strings and numbers are supported.')
  }

  public static optionalKey(resourceName: string, fieldName: string): never {
    throw new Error(this.resourceKeyBase(resourceName, fieldName) + 'it cannot be optional.')
  }

  public static nullableKey(resourceName: string, fieldName: string): never {
    throw new Error(this.resourceKeyBase(resourceName, fieldName) + 'it cannot be nullable.')
  }

  public static unreadableKey(resourceName: string, fieldName: string): never {
    throw new Error(this.resourceKeyBase(resourceName, fieldName) + 'it mut be readable.')
  }

  public static writeOnlyResource(): never {
    throw new Error('The resource is write-only.')
  }

  public static readOnlyResource(): never {
    throw new Error('The resource is read-only.')
  }

  public static bothReadOnlyAndWriteOnly(): never {
    throw new Error('A resource cannot be both read-only and write-only.')
  }

  static undefinedRequestBody(method: string): never {
    throw new Error(`${method} requests require a request body to be defined.`)
  }

  static undefinedResponseBody(method: string): never {
    throw new Error(`${method} requests require a response body to be defined.`)
  }

  static requestBodyRequired(method: string): never {
    throw new Error(`${method} requests require a request body.`)
  }
}
