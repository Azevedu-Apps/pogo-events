
import { ResourcesConfig } from 'aws-amplify';

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: "sa-east-1_KDmQHc1Yu",
      userPoolClientId: "2hubn8meq2598afuro18h1agcf",
      identityPoolId: "sa-east-1:1e1acc38-2e31-45cc-b3e8-fb2711ebe816",
      loginWith: {
        email: true
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true
        }
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireNumbers: false,
        requireSpecialCharacters: false
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: "https://63rnjd5nlvfrjlgxobywy34gu4.appsync-api.sa-east-1.amazonaws.com/graphql",
      region: "sa-east-1",
      defaultAuthMode: 'apiKey',
      apiKey: "da2-srl5u24xzjdgtpbj3udi4rdw7q",
      modelIntrospection: {
        "version": 1,
        "models": {
          "PogoEvent": {
            "name": "PogoEvent",
            "fields": {
              "id": { "name": "id", "isArray": false, "type": "ID", "isRequired": true, "attributes": [] },
              "name": { "name": "name", "isArray": false, "type": "String", "isRequired": true, "attributes": [] },
              "type": { "name": "type", "isArray": false, "type": "String", "isRequired": false, "attributes": [] },
              "start": { "name": "start", "isArray": false, "type": "AWSDateTime", "isRequired": false, "attributes": [] },
              "end": { "name": "end", "isArray": false, "type": "AWSDateTime", "isRequired": false, "attributes": [] },
              "location": { "name": "location", "isArray": false, "type": "String", "isRequired": false, "attributes": [] },
              "cover": { "name": "cover", "isArray": false, "type": "String", "isRequired": false, "attributes": [] },
              "research": { "name": "research", "isArray": false, "type": "String", "isRequired": false, "attributes": [] },
              "eggTitle": { "name": "eggTitle", "isArray": false, "type": "String", "isRequired": false, "attributes": [] },
              "eggDesc": { "name": "eggDesc", "isArray": false, "type": "String", "isRequired": false, "attributes": [] },
              "bonuses": { "name": "bonuses", "isArray": true, "type": "String", "isRequired": false, "attributes": [] },
              "images": { "name": "images", "isArray": true, "type": "String", "isRequired": false, "attributes": [] },

              "payment": { "name": "payment", "isArray": false, "type": "AWSJSON", "isRequired": false, "attributes": [] },
              "featured": { "name": "featured", "isArray": false, "type": "AWSJSON", "isRequired": false, "attributes": [] },
              "paidResearch": { "name": "paidResearch", "isArray": false, "type": "AWSJSON", "isRequired": false, "attributes": [] },
              "spawnCategories": { "name": "spawnCategories", "isArray": false, "type": "AWSJSON", "isRequired": false, "attributes": [] },
              "attacks": { "name": "attacks", "isArray": false, "type": "AWSJSON", "isRequired": false, "attributes": [] },
              "raidsList": { "name": "raidsList", "isArray": false, "type": "AWSJSON", "isRequired": false, "attributes": [] },
              "customTexts": { "name": "customTexts", "isArray": false, "type": "AWSJSON", "isRequired": false, "attributes": [] },
              "eggs": { "name": "eggs", "isArray": false, "type": "AWSJSON", "isRequired": false, "attributes": [] },

              "createdAt": { "name": "createdAt", "isArray": false, "type": "AWSDateTime", "isRequired": false, "attributes": [], "isReadOnly": true },
              "updatedAt": { "name": "updatedAt", "isArray": false, "type": "AWSDateTime", "isRequired": false, "attributes": [], "isReadOnly": true }
            },
            "syncable": true,
            "pluralName": "PogoEvents",
            "attributes": [
              { "type": "model", "properties": {} },
              { "type": "auth", "properties": { "rules": [{ "allow": "public", "provider": "apiKey", "operations": ["create", "update", "delete", "read"] }] } }
            ],
            "primaryKeyInfo": { "isCustomPrimaryKey": false, "primaryKeyFieldName": "id", "sortKeyFieldNames": [] }
          },
          "UserEventProgress": {
            "name": "UserEventProgress",
            "fields": {
              "id": { "name": "id", "isArray": false, "type": "ID", "isRequired": true, "attributes": [] },
              "eventId": { "name": "eventId", "isArray": false, "type": "String", "isRequired": true, "attributes": [] },
              "progressData": { "name": "progressData", "isArray": false, "type": "AWSJSON", "isRequired": false, "attributes": [] },
              "createdAt": { "name": "createdAt", "isArray": false, "type": "AWSDateTime", "isRequired": false, "attributes": [], "isReadOnly": true },
              "updatedAt": { "name": "updatedAt", "isArray": false, "type": "AWSDateTime", "isRequired": false, "attributes": [], "isReadOnly": true }
            },
            "syncable": true,
            "pluralName": "UserEventProgresses",
            "attributes": [
              { "type": "model", "properties": {} },
              { "type": "auth", "properties": { "rules": [{ "allow": "owner", "provider": "userPools", "operations": ["create", "update", "delete", "read"] }] } }
            ],
            "primaryKeyInfo": { "isCustomPrimaryKey": false, "primaryKeyFieldName": "id", "sortKeyFieldNames": [] }
          },
          "UserPokedex": {
            "name": "UserPokedex",
            "fields": {
              "id": { "name": "id", "isArray": false, "type": "ID", "isRequired": true, "attributes": [] },
              "progressData": { "name": "progressData", "isArray": false, "type": "AWSJSON", "isRequired": false, "attributes": [] },
              "createdAt": { "name": "createdAt", "isArray": false, "type": "AWSDateTime", "isRequired": false, "attributes": [], "isReadOnly": true },
              "updatedAt": { "name": "updatedAt", "isArray": false, "type": "AWSDateTime", "isRequired": false, "attributes": [], "isReadOnly": true }
            },
            "syncable": true,
            "pluralName": "UserPokedexes",
            "attributes": [
              { "type": "model", "properties": {} },
              { "type": "auth", "properties": { "rules": [{ "allow": "owner", "provider": "userPools", "operations": ["create", "update", "delete", "read"] }] } }
            ],
            "primaryKeyInfo": { "isCustomPrimaryKey": false, "primaryKeyFieldName": "id", "sortKeyFieldNames": [] }
          }
        },
        "enums": {},
        "nonModels": {}
      }
    }
  }
};
