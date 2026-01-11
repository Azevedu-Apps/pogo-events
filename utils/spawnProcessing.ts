import { Pokemon } from '../types';

// Default Backgrounds
const DEFAULT_LOCATION_BG = "lc_CitySafari2024_saopaulo.png";
const DEFAULT_SPECIAL_BG = "sb_GoFest2025.png";

/**
 * Explodes a list of spawns by creating duplicates for Pokémon marked with background flags.
 * - isLocationBg: Adds a clone with a default Location Background.
 * - isSpecialBg: Adds a clone with a default Special Background.
 * 
 * The clones are treated as distinct entities for progress tracking (handled by generatePokemonId including background field).
 */
export const processSpawnsWithBackgrounds = (spawns: Pokemon[]): Pokemon[] => {
    if (!spawns) return [];

    const processed: Pokemon[] = [];

    spawns.forEach(p => {
        // ALWAYS add the original
        processed.push(p);



        // Check for Location Background flag
        if (p.isLocationBg) {
            processed.push({
                ...p,
                isLocationBg: false, // Clear flag to avoid confusion
                isSpecialBg: false,
                background: DEFAULT_LOCATION_BG
            });
        }

        // Check for Special Background flag
        if (p.isSpecialBg) {
            processed.push({
                ...p,
                isLocationBg: false,
                isSpecialBg: false,
                background: DEFAULT_SPECIAL_BG
            });
        }
    });

    return processed;
};
