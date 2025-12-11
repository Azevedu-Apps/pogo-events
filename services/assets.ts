
// Base URLs for assets
const POGO_ASSETS_BASE = "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images";
const HYBRID_ASSETS_BASE = "https://raw.githubusercontent.com/HybridPoke/PogoAssets/master/images/pokemon";

// Mapping for standard Pokemon GO Item IDs to filenames
const ITEM_MAP: Record<string, string> = {
    'egg_2km': 'Items/Item_1302_Pogo_Egg_2km.png',
    'egg_5km': 'Items/Item_1303_Pogo_Egg_5km.png',
    // 7km eggs are sometimes named Alola or Friendship, checking standard normalization
    'egg_7km': 'Items/Item_1305_Pogo_Egg_7km.png', 
    'egg_10km': 'Items/Item_1304_Pogo_Egg_10km.png',
    // 12km eggs are also known as Strange Eggs
    'egg_12km': 'Items/Item_1307_Pogo_Egg_Strange.png',
    
    'raid_pass': 'Items/Item_1401_RaidPass_Normal.png',
    'raid_pass_remote': 'Items/Item_1408_RaidPass_Remote.png',
    'raid_pass_premium': 'Items/Item_1402_RaidPass_Premium.png',
    'incubator_basic': 'Items/Item_1201_Pogo_Incubator_Basic.png',
    'incubator_super': 'Items/Item_1202_Pogo_Incubator_Super.png',
    'stardust': 'Items/Item_Stardust.png', // Generic fallback
    'candy': 'Items/Item_Candy_Rare.png'   // Generic fallback
};

export const getPokemonAsset = (id: number, shiny: boolean = false): string => {
    // HybridPoke mirror provides sanitized filenames that match ID structure better than raw PokeMiners
    // {id}.png or {id}_shiny.png
    return `${HYBRID_ASSETS_BASE}/${id}${shiny ? '_shiny' : ''}.png`;
};

export const getTypeIcon = (type: string): string => {
    // PokeMiners format: pokemon_type_icon_{lowercase}.png
    const t = type.toLowerCase();
    return `${POGO_ASSETS_BASE}/Types/pokemon_type_icon_${t}.png`;
};

export const getItemIcon = (key: keyof typeof ITEM_MAP): string => {
    return `${POGO_ASSETS_BASE}/${ITEM_MAP[key]}`;
};

export const getRaidEggIcon = (tier: string): string => {
    // Mapping tiers to egg images
    if (tier === '1' || tier === '3') return `${POGO_ASSETS_BASE}/Raids/raid_egg_2.png`; // Normal/Rare
    if (tier === '5') return `${POGO_ASSETS_BASE}/Raids/raid_egg_5.png`; // Legendary
    if (tier === 'Mega') return `${POGO_ASSETS_BASE}/Raids/raid_egg_mega.png`;
    if (tier === 'Shadow') return `${POGO_ASSETS_BASE}/Raids/raid_egg_shadow.png`; // Often distinct
    if (tier.startsWith('Max')) return `${POGO_ASSETS_BASE}/Raids/raid_egg_max.png`; // Theoretical/Placeholder
    return `${POGO_ASSETS_BASE}/Raids/raid_egg_2.png`;
};
