/**
 * Script para popular o banco de dados do Amplify com os Pokémons
 * Uso: node seed-database.js
 */
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Carrega as configurações do seu backend (Sandbox ou Prod)
// Certifique-se que o arquivo amplify_outputs.json existe na raiz
import outputs from '../amplify_outputs.json' with { type: "json" };

Amplify.configure(outputs);
const client = generateClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pasta onde o script Python salvou os JSONs
const MANIFESTS_DIR = path.join(__dirname, 'manifests');

async function seedRegion(filename) {
  const filePath = path.join(MANIFESTS_DIR, filename);
  if (!fs.existsSync(filePath)) return;

  // Extrai o nome da região do arquivo (ex: manifest-kanto.json -> kanto)
  const regionName = filename.replace('manifest-', '').replace('.json', '');

  console.log(`\n📦 Processando região: ${regionName.toUpperCase()}...`);

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const pokemons = JSON.parse(rawData);

  let successCount = 0;
  let errorCount = 0;

  // Processa em lotes de 10 para não sobrecarregar a conexão
  const BATCH_SIZE = 10;

  for (let i = 0; i < pokemons.length; i += BATCH_SIZE) {
    const batch = pokemons.slice(i, i + BATCH_SIZE);

    // Promessa paralela para o lote atual
    await Promise.all(batch.map(async (p) => {
      try {
        // Mapeia o JSON do Python para o Schema do Amplify
        await client.models.Pokemon.create({
          pokemonId: p.id,       // "BULBASAUR"
          dexNr: p.dexNr,        // 1
          region: regionName,    // "kanto"
          types: p.types,        // ["GRASS", ...]
          stats: p.stats,        // Objeto JSON
          forms: p.forms         // Array de objetos JSON
        });
        process.stdout.write('.'); // Feedback visual
        successCount++;
      } catch (error) {
        process.stdout.write('X');
        console.error(`\nErro ao criar ${p.id}:`, error.message);
        errorCount++;
      }
    }));
  }

  console.log(`\n✅ ${regionName}: ${successCount} criados, ${errorCount} erros.`);
}

async function main() {
  if (!fs.existsSync(MANIFESTS_DIR)) {
    console.error(`❌ Pasta '${MANIFESTS_DIR}' não encontrada. Rode o script Python primeiro.`);
    return;
  }

  const files = fs.readdirSync(MANIFESTS_DIR).filter(f => f.endsWith('.json'));

  console.log(`Encontrados ${files.length} arquivos de manifesto.`);
  console.log("Iniciando carga do banco de dados (Isso pode demorar alguns minutos)...");

  for (const file of files) {
    await seedRegion(file);
  }

  console.log("\n🎉 Processo finalizado!");
}

main();