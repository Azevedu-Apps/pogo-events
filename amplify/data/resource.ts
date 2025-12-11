import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const PaymentInfo = a.customType({
  type: a.string(),
  cost: a.string(),
  ticketCost: a.string(),
  ticketBonuses: a.string().array(),
});

const FeaturedPokemon = a.customType({
  name: a.string(),
  image: a.string(),
});

const PaidResearch = a.customType({
  name: a.string(),
  cost: a.string(),
  details: a.string(),
});

const schema = a.schema({
  PogoEvent: a
    .model({
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

      payment: PaymentInfo,
      featured: FeaturedPokemon,
      paidResearch: PaidResearch,
      spawnCategories: a.json(),
      attacks: a.json(),
      raidsList: a.json(),
      customTexts: a.json(),
      eggs: a.json(),
    })
    .authorization(allow => [
      allow.publicApiKey(),
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