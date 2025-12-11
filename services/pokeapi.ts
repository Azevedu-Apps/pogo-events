
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

export const fetchPokemon = async (query: string) => {
  try {
    // Trim and replace spaces with hyphens (e.g. "Tapu Koko" -> "tapu-koko")
    // Also remove special chars like periods (Mr. Mime -> mr-mime)
    const cleanQuery = query.trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[.'"]/g, '')
      .replace(/♀/g, '-f')
      .replace(/♂/g, '-m');
    
    if (!cleanQuery) return null;

    const res = await fetch(`${API_URL}/pokemon/${cleanQuery}`);
    if (!res.ok) throw new Error('Pokemon not found');
    const data = await res.json();
    
    // Use the Asset Service to get the Pogo-style 3D model
    const image = getPokemonAsset(data.id, false);
    const shinyImage = getPokemonAsset(data.id, true);

    return {
      name: data.name,
      image: image,
      shinyImage: shinyImage,
      types: data.types.map((t: any) => t.type.name),
      id: data.id,
      stats: data.stats
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
