import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

// --- TIPOS PERSONALIZADOS (Estruturas aninhadas) ---
// Isso permite salvar objetos complexos dentro do Evento sem criar 1000 tabelas

const PaymentInfo = a.customType({
  type: a.string(), // free, paid_event, free_ticket
  cost: a.string(),
  ticketCost: a.string(),
  ticketBonuses: a.string().array(),
});

const SpawnItem = a.customType({
  name: a.string().required(),
  image: a.string(),
  shiny: a.boolean(),
  form: a.string(),
  shinyImage: a.string(),
});

const SpawnCategory = a.customType({
  id: a.float().required(), // Usando float para timestamp/ID numérico
  name: a.string().required(),
  spawns: SpawnItem.array(),
});

const AttackItem = a.customType({
  pokemon: a.string().required(),
  move: a.string().required(),
  type: a.string(),
  energy: a.string(),
  method: a.string(),
  image: a.string(),
});

const RaidItem = a.customType({
  tier: a.string().required(),
  boss: a.string().required(),
});

const CustomTextSection = a.customType({
  type: a.string(), // text, image, mixed
  title: a.string(),
  desc: a.string(),
  img: a.string(),
});

const EggGroup = a.customType({
  distance: a.string().required(), // 2 km, 5 km, etc
  spawns: SpawnItem.array(),
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
      start: a.datetime(), // Formato ISO 8601
      end: a.datetime(),
      location: a.string(),
      cover: a.string(),
      research: a.string(), // Texto da pesquisa de campo

      // Configurações de Ovos (Título e Descrição)
      eggTitle: a.string(),
      eggDesc: a.string(),

      // Listas Simples
      bonuses: a.string().array(),
      images: a.string().array(), // Galeria

      // Estruturas Complexas (Custom Types)
      payment: PaymentInfo,
      featured: FeaturedPokemon,
      paidResearch: PaidResearch,

      // Listas de Objetos
      spawnCategories: SpawnCategory.array(),
      attacks: AttackItem.array(),
      raidsList: RaidItem.array(),
      customTexts: CustomTextSection.array(),
      eggs: EggGroup.array(),
    })
    .authorization(allow => [
      // Permite que qualquer pessoa (mesmo sem login) LEIA os eventos
      allow.publicApiKey().to(['read']),
      // Apenas quem estiver logado (Admin) pode CRIAR/EDITAR/APAGAR
      // Para simplificar seu teste agora, vamos deixar 'publicApiKey' fazer tudo.
      // Futuramente, mudamos para 'allow.owner()'
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