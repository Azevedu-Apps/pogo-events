
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  PogoEvent: a.model({
    name: a.string().required(),
    type: a.string(),
    start: a.datetime(),
    end: a.datetime(),
    location: a.string(),
    cover: a.string(),
    research: a.string(),
    eggTitle: a.string(),
    eggDesc: a.string(),
    bonuses: a.string().array(),
    images: a.string().array(),
    payment: a.json(),
    featured: a.json(),
    paidResearch: a.json(),
    spawnCategories: a.json(),
    attacks: a.json(),
    raidsList: a.json(),
    customTexts: a.json(),
    eggs: a.json(),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.owner().to(['create', 'update', 'delete', 'read'])
  ]),

  UserEventProgress: a.model({
    eventId: a.string().required(),
    progressData: a.json(),
  }).authorization(allow => [
    allow.owner(),
  ]),

  UserPokedex: a.model({
    progressData: a.json(),
  }).authorization(allow => [
    allow.owner(),
  ]),

  UserFeedback: a.model({
    title: a.string(),
    content: a.string().required(),
    userEmail: a.string(),
    category: a.string(),
    deviceInfo: a.string(),
    imageUrl: a.string(),
    occuredAt: a.datetime(),
  }).authorization(allow => [
    allow.publicApiKey().to(['create']),
    allow.owner().to(['read', 'delete'])
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
