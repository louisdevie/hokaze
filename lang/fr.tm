# messages d'erreur des champs, pas de majuscule ni de point ===========================================================

requiredValueMissing = 'obligatoire'
stringTooShort = "minimum {n} caractères"
stringTooLong = "maximum {n} caractères"
stringEmpty = "ne doit pas être vide"
mustBeGreaterThan = "doit être strictement supérieur à {n}"
mustBeLessThan = "doit être strictement inférieur à {n}"
mustBeGreaterThanOrEqualTo = "doit être au moins {n}"
mustBeLessThanOrEqualTo = "ne doit pas dépasser {n}"

# ======================================================================================================================

missingField = 'Le champ {name} est obligatoire.'
collectionExpectsArray = "L'API a renvoyé une réponse différente d'un tableau pour une ressource de type collection."

couldNotInferKey = "Impossible de deviner quelle propriété est la clé de la ressource '{resourceName}'. Utilisez .asKey() pour indiquer la propriété à utiliser."
(resourceKeyErrorBase) = "Le champ '{fieldName}' de la ressource '{resourceName}' ne peut pas être utilisé comme clé :"
badKeyType = '{%resourceKeyErrorBase} seuls les champs texte et numérique sont autorisés.'
optionalKey = '{%resourceKeyErrorBase} elle ne devrait pas être optionnelle.'
nullableKey = '{%resourceKeyErrorBase} elle ne devrait jamais être null.'
unreadableKey = '{%resourceKeyErrorBase} elle ne devrait pas être en écriture seule.'

writeOnlyResource = 'La ressource est en écriture seule.'
readOnlyResource = 'La ressource est en lecture seule.'
bothReadOnlyAndWriteOnly = 'Une ressource ne peut pas être à la fois en écriture seule et en lecture seule.'

undefinedRequestBody = "Les requêtes {method} nécessitent qu'un corps de requête sois défini."
undefinedResponseBody = "Les requêtes {method} nécessitent qu'un corps de réponse sois défini."
requestBodyRequired = "Les requêtes {method} ont besoin d'un corps de requête."

invalidRequestPathDefault = 'Un chemin de requête invalide ne peut pas être utilisé ici.'
childUsedWithoutKey = 'Une requête fille ne peut pas être utilisée sans clé.'

objectInUrlNotAllowed = "Les objets ne sont pas autorisés dans les paramètres d'URL."

minGreaterThanMax = "La limite inférieure ne peut pas être égale à ou plus grande que la limite supérieure."

emptyConverter = "Un convertisseur doit posséder au moins une méthode 'unpack' ou 'pack'."

refIsUnloaded = "Impossible de sérialiser une référence comme un objet complet si elle n'est pas chargée."
failedToLoadRef = 'Échec du chargement de la ressource référencée'
keyIsDifferent = 'La resource chargée depuis la clé {requested:json} possède une clé différente ({received:json})'

colonNotAllowedInUsername = "Les deux-points ':' ne sont pas autorisés dans les noms d'utilisateur."

baseKeywordCanAppearOnlyOnce = 'Le mot-clé "base" ne peut apparaître qu'une seule fois dans le tableau de configuration."
