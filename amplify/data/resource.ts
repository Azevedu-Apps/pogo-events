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

  // --- NOVO MODELO: UserEventProgress ---
  // Isso cria a tabela que estava faltando e corrige o Sync Error
  UserEventProgress: a
    .model({
      eventId: a.string().required(),
      progressData: a.json(), // JSON permite salvar: { pikachu: { shiny: true, hundo: false } }
    })
    .authorization(allow => [
      allow.owner(), // Apenas o dono (usuário logado) pode ver/editar sua lista
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