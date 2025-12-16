
import { getPokemonAsset } from './assets';

const API_URL = 'https://pokeapi.co/api/v2';

let pokemonListCache: { name: string; url: string }[] | null = null;

export const getAllPokemonNames = async () => {
  if (pokemonListCache) return pokemonListCache;
  try {
    const res = await fetch(`${API_URL}/pokemon?limit=10000`);
    const data = await res.json();
    pokemonListCache = data.results;
    return data.results;
  } catch (e) {
    console.error("Failed to load pokemon list", e);
    return [];
  }
};

export const fetchSpeciesDetails = async (id: number) => {
    try {
        const res = await fetch(`${API_URL}/pokemon-species/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        
        // Check varieties for Mega and Gmax
        const hasMega = data.varieties.some((v: any) => v.pokemon.name.includes('-mega'));
        const hasGmax = data.varieties.some((v: any) => v.pokemon.name.includes('-gmax'));
        
        return { hasMega, hasGmax };
    } catch (e) {
        return { hasMega: false, hasGmax: false };
    }
}

export const fetchPokemon = async (query: string) => {
  try {
    let q = query.trim().toLowerCase();
    
    // 1. Remove punctuation
    q = q.replace(/[.'":]/g, '');
    q = q.replace(/♀/g, '-f').replace(/♂/g, '-m');

    // 2. Handle Prefixes converting to Suffixes
    const prefixes: Record<string, string> = {
        'alolan ': '-alola',
        'galarian ': '-galar',
        'hisuian ': '-hisui',
        'paldean ': '-paldea',
        'primal ': '-primal',
        'mega ': '-mega' 
    };

    let suffix = '';
    
    // Check prefixes
    for (const [prefix, suf] of Object.entries(prefixes)) {
        if (q.startsWith(prefix)) {
            q = q.slice(prefix.length);
            suffix = suf;
            break; 
        }
    }

    // Handle Mega X/Y
    if (suffix === '-mega') {
        if (q.endsWith(' x')) {
            q = q.slice(0, -2);
            suffix = '-mega-x';
        } else if (q.endsWith(' y')) {
            q = q.slice(0, -2);
            suffix = '-mega-y';
        }
    }

    // Handle Gigamax / Gmax
    if (q.endsWith(' gigamax')) {
        q = q.replace(' gigamax', '');
        suffix = '-gmax';
    } else if (q.endsWith(' gmax')) {
        q = q.replace(' gmax', '');
        suffix = '-gmax';
    }

    // 3. Construct final query
    q = q.replace(/\s+/g, '-');
    const finalQuery = `${q}${suffix}`;
    
    if (!finalQuery) return null;

    const res = await fetch(`${API_URL}/pokemon/${finalQuery}`);
    if (!res.ok) throw new Error(`Pokemon not found: ${finalQuery}`);
    const data = await res.json();
    
    // Use High-Res Home sprites instead of standard Pogo Assets for better quality/sharpness
    // Fallback to official artwork if Home sprite is missing (common for some forms)
    const image = data.sprites.other.home.front_default || data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
    const shinyImage = data.sprites.other.home.front_shiny || data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny;

    // Extract Species ID from URL to ensure we point to the correct Species endpoint
    // (e.g. Venusaur Mega has ID 10033 but Species ID 3)
    const speciesUrl = data.species?.url;
    const speciesId = speciesUrl ? parseInt(speciesUrl.split('/').filter(Boolean).pop() || '0') : data.id;

    return {
      name: data.name,
      image: image,
      shinyImage: shinyImage,
      types: data.types.map((t: any) => t.type.name),
      id: data.id,
      speciesId: speciesId || data.id,
      stats: data.stats,
      weight: data.weight, // In hectograms
      height: data.height  // In decimeters
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
