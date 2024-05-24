@default

# field error messages, do not use capital letters at the start nor periods ============================================

stringTooLong = '{n} characters maximum'
stringEmpty = 'cannot be empty'

# ======================================================================================================================

missingField = 'Field {name} is required.'
collectionExpectsArray = 'The API returned something other than an array when fetching a collection resource.'

couldNotInferKey = "Couldn't infer the key property of the '{resourceName}' resource. Use .asKey() to specify which property to use."
(resourceKeyErrorBase) = "The field '{fieldName}' of the '{resourceName}' resource cannot be used as the key:"
badKeyType = '{%resourceKeyErrorBase} only strings and numbers are supported.'
optionalKey = '{%resourceKeyErrorBase} it cannot be optional.'
nullableKey = '{%resourceKeyErrorBase} it cannot be nullable.'
unreadableKey = '{%resourceKeyErrorBase} it must be readable.'

writeOnlyResource = 'The resource is write-only.'
readOnlyResource = 'The resource is read-only.'
bothReadOnlyAndWriteOnly = 'A resource cannot be both read-only and write-only.'

undefinedRequestBody = '{method} requests require a request body to be defined.'
undefinedResponseBody = '{method} requests require a response body to be defined.'
requestBodyRequired = '{method} requests require a request body.'

invalidRequestPathDefault = 'Invalid request path used.'
childUsedWithoutKey = 'A child request was used on a item that has no key.'

objectInUrlNotAllowed = "An object can't be used in URL query parameters."