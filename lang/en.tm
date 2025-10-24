@default

# field error messages, do not use capital letters at the start nor periods ============================================

requiredValueMissing = 'required'
stringTooShort = '{n} characters minimum'
stringTooLong = '{n} characters maximum'
stringEmpty = 'cannot be empty'
mustBeGreaterThan = "must be greater than {n}"
mustBeLessThan = "must be less than {n}"
mustBeGreaterThanOrEqualTo = "cannot be less than {n}"
mustBeLessThanOrEqualTo = "cannot be greater than {n}"

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

minGreaterThanMax = "The lower bound cannot be equal to or greater than the upper bound."

emptyConverter = "A converter must defined at least an 'unpack' or a 'pack' operation."

refIsUnloaded = 'Cannot serialize ref as a full object if it is not loaded.'
failedToLoadRef = 'Failed to load the referenced resource.'
keyIsDifferent = 'Resource loaded from key {requested:json} has a different key ({received:json}).'