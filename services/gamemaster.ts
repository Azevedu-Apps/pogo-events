
// Service to interact with PogoAPI.net for Game Master data

const BASE_URL = 'https://pogoapi.net/api/v1';

interface GoMove {
    name: string;
    type: string;
    power: number;
    duration: number;
    energy_delta: number; // Positive for fast (gain), Negative for charged (cost)
    category: 'fast' | 'charged';
}

// Caches
let fastMovesCache: Record<string, GoMove> | null = null;
let chargedMovesCache: Record<string, GoMove> | null = null;
let pokemonMovesCache: Record<string, { charged_moves: string[], fast_moves: string[], elite_charged_moves: string[], elite_fast_moves: string[] }> | null = null;

// Initialize caches
export const initGameMaster = async () => {
    if (fastMovesCache && chargedMovesCache && pokemonMovesCache) return;

    try {
        const [fastRes, chargedRes, pokeMovesRes] = await Promise.all([
            fetch(`${BASE_URL}/fast_moves.json`),
            fetch(`${BASE_URL}/charged_moves.json`),
            fetch(`${BASE_URL}/current_pokemon_moves.json`)
        ]);

        const fastData = await fastRes.json();
        const chargedData = await chargedRes.json();
        const pokeMovesData = await pokeMovesRes.json();

        // Transform arrays to map for easier lookup by name
        fastMovesCache = {};
        fastData.forEach((m: any) => {
            fastMovesCache![m.name] = { ...m, category: 'fast' };
        });

        chargedMovesCache = {};
        chargedData.forEach((m: any) => {
            chargedMovesCache![m.name] = { ...m, category: 'charged' };
        });

        // Transform pokemon moves to map by ID (string)
        // Note: PogoAPI returns one entry per form. We aggregate them by ID for this app to ensure
        // we show moves even if the form ID logic differs slightly from PokeAPI.
        pokemonMovesCache = {};
        pokeMovesData.forEach((p: any) => {
            const id = p.pokemon_id.toString();
            if (!pokemonMovesCache![id]) {
                pokemonMovesCache![id] = {
                    charged_moves: [],
                    fast_moves: [],
                    elite_charged_moves: [],
                    elite_fast_moves: []
                };
            }
            
            // Merge moves from all forms into the base ID to ensure coverage
            const entry = pokemonMovesCache![id];
            entry.fast_moves = [...new Set([...entry.fast_moves, ...p.fast_moves])];
            entry.charged_moves = [...new Set([...entry.charged_moves, ...p.charged_moves])];
            entry.elite_fast_moves = [...new Set([...entry.elite_fast_moves, ...(p.elite_fast_moves || [])])];
            entry.elite_charged_moves = [...new Set([...entry.elite_charged_moves, ...(p.elite_charged_moves || [])])];
        });

    } catch (e) {
        console.error("Failed to load Game Master data", e);
    }
};

export const getMovesForPokemon = async (pokemonId: number): Promise<string[]> => {
    await initGameMaster();
    const data = pokemonMovesCache?.[pokemonId.toString()];
    if (!data) return [];
    
    // Combine all available moves
    const allMoves = [
        ...data.fast_moves,
        ...data.charged_moves,
        ...data.elite_fast_moves,
        ...data.elite_charged_moves
    ];
    
    return [...new Set(allMoves)].sort();
};

export const getPokemonMoveset = async (pokemonId: number) => {
    await initGameMaster();
    const data = pokemonMovesCache?.[pokemonId.toString()];
    
    if (!data) return null;

    const mapMoveDetails = (names: string[], eliteNames: string[]) => {
        return names.map(name => {
            const details = fastMovesCache?.[name] || chargedMovesCache?.[name];
            return {
                name,
                type: details?.type || 'Normal',
                isElite: eliteNames.includes(name)
            };
        });
    };

    return {
        fast: mapMoveDetails(data.fast_moves, data.elite_fast_moves),
        charged: mapMoveDetails(data.charged_moves, data.elite_charged_moves),
        eliteFast: mapMoveDetails(data.elite_fast_moves, data.elite_fast_moves),
        eliteCharged: mapMoveDetails(data.elite_charged_moves, data.elite_charged_moves)
    };
};

export const getMoveDetails = async (moveName: string): Promise<GoMove | null> => {
    await initGameMaster();
    
    if (fastMovesCache?.[moveName]) return fastMovesCache[moveName];
    if (chargedMovesCache?.[moveName]) return chargedMovesCache[moveName];
    
    return null;
};

export const calculateBars = (energyDelta: number): string => {
    // Energy delta for charged moves is negative (cost)
    const cost = Math.abs(energyDelta);
    if (cost <= 33) return "3";
    if (cost <= 50) return "2";
    return "1";
};
