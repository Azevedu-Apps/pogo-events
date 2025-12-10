import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/* TIPOS PERSONALIZADOS (Apenas para objetos únicos)
   Obs: Removemos os tipos de Arrays (AttackItem, SpawnItem) para usar a.json()
   e evitar o erro de build.
*/

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

// --- MODELO PRINCIPAL ---
const schema = a.schema({
  PogoEvent: a
    .model({
      // Campos básicos
      name: a.string().required(),
      type: a.string(),
      start: a.datetime(),
      end: a.datetime(),
      location: a.string(),
      cover: a.string(),
      research: a.string(),

      eggTitle: a.string(),
      eggDesc: a.string(),

      // Listas Simples (Strings funcionam bem com .array)
      bonuses: a.string().array(),
      images: a.string().array(),

      // Objetos Únicos (Custom Types funcionam bem aqui)
      payment: PaymentInfo,
      featured: FeaturedPokemon,
      paidResearch: PaidResearch,

      // --- A CORREÇÃO ESTÁ AQUI ---
      // Usamos a.json() para listas complexas de objetos.
      // Isso permite salvar seus Arrays de objetos sem erro de TypeScript.
      spawnCategories: a.json(), // Guarda a lista de categorias e spawns
      attacks: a.json(),         // Guarda a lista de ataques
      raidsList: a.json(),       // Guarda a lista de raids
      customTexts: a.json(),     // Guarda as seções de texto/imagem
      eggs: a.json(),            // Guarda a configuração dos ovos
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