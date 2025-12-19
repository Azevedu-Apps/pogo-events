import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import outputs from '../amplify_outputs.json' with { type: "json" };

Amplify.configure(outputs);
const client = generateClient();

async function check() {
  console.log("🔍 Consultando banco de dados...");

  try {
    const { data: pokemons } = await client.models.Pokemon.list({
      limit: 5
    });

    console.log(`\n📊 Total encontrado na consulta simples: ${pokemons.length}`);

    if (pokemons.length > 0) {
      console.log("✅ SUCESSO! Os dados estão lá. Exemplo:");
      console.log(pokemons[0]);
    } else {
      console.log("⚠️ O banco retornou vazio. Algo estranho aconteceu.");
    }

  } catch (error) {
    console.error("Erro ao consultar:", error);
  }
}

check();