import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

// --- Seus Tipos Customizados (Mantidos iguais) ---
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

// --- Definição do Esquema ---
const schema = a.schema({
  // Seu modelo existente
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

  UserEventProgress: a
    .model({
      eventId: a.string().required(),
      progressData: a.json(),
    })
    .authorization(allow => [
      allow.owner(),
      allow.publicApiKey()
    ]),
  UserPokedex: a
    .model({
      progressData: a.json(),
    })
    .authorization(allow => [
      allow.owner(),
      allow.publicApiKey()
    ]),
  Pokemon: a
    .model({
      pokemonId: a.string().required(), // O ID textual (ex: "BULBASAUR")
      dexNr: a.integer(),               // Número da Pokedex (ex: 1)
      region: a.string(),               // Para filtro (ex: "kanto")
      types: a.string().array(),        // ["POKEMON_TYPE_GRASS", ...]

      // Armazenamos objetos complexos como JSON para economizar leitura e complexidade
      stats: a.json(),                  // { baseStamina: 111, ... }
      forms: a.json(),                  // [{ name: "...", sprite: "..." }, ...]
    })
    .secondaryIndexes((index) => [
      index("pokemonId"), // Para buscar por nome: client.models.Pokemon.list({ pokemonId: 'PIKACHU' })
      index("dexNr"),     // Para ordenar: client.models.Pokemon.list({ sort: ... })
      index("region"),    // Para carregar por aba: client.models.Pokemon.list({ region: 'kanto' })
    ])
    .authorization(allow => [
      allow.publicApiKey(), // Permite leitura/escrita via API Key (facilitará o script de seed)
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