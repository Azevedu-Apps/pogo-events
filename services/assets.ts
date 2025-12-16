
// Base URLs for assets - Using official PokeMiners repository
export const POGO_ASSETS_BASE = "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images";

// Legacy assets (ZeChrales) - Use this for items that are missing/converted to 3D in PokeMiners (like Eggs)
export const LEGACY_ASSETS_BASE = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/static_assets/png";

// PokeMiners specific paths
export const POKEMON_ASSETS_BASE = `${POGO_ASSETS_BASE}/Pokemon`;
export const ITEMS_BASE_URL = `${POGO_ASSETS_BASE}/Items`;

// Official PokeMiners Type Icons
export const TYPE_ICON_BASE = `${POGO_ASSETS_BASE}/Types`;

// --- ASSET FOLDERS (For Documentation/Reference) ---
export const ASSET_FOLDERS = {
    'Location Cards': `${POGO_ASSETS_BASE}/LocationCards`,
    'Megas & Primals': `${POGO_ASSETS_BASE}/Megas%20and%20Primals`,
    'Menu Icons': `${POGO_ASSETS_BASE}/Menu%20Icons`,
    'News': `${POGO_ASSETS_BASE}/News`,
    'Pokedex V1': `${POGO_ASSETS_BASE}/Pokedex`,
    'Pokedex V2': `${POGO_ASSETS_BASE}/PokedexV2`,
    'Pokemon (256x)': `${POGO_ASSETS_BASE}/Pokemon%20-%20256x256`,
    'Pokemon (Full)': `${POGO_ASSETS_BASE}/Pokemon`,
    'Pokestops & Gyms': `${POGO_ASSETS_BASE}/Pokestops%20and%20Gyms`,
    'Quests': `${POGO_ASSETS_BASE}/Quests`,
    'Raid Stadium': `${POGO_ASSETS_BASE}/Raid%20Stadium`,
    'Raids': `${POGO_ASSETS_BASE}/Raids`,
    'Route Maker': `${POGO_ASSETS_BASE}/Route%20Maker`,
    'Shop Images': `${POGO_ASSETS_BASE}/Shop%20Images`,
    'Tags': `${POGO_ASSETS_BASE}/Tags`,
    'Type Backgrounds': `${POGO_ASSETS_BASE}/Type%20Backgrounds`,
    'Types': `${POGO_ASSETS_BASE}/Types`,
    'Unique Icons': `${POGO_ASSETS_BASE}/Unique%20Pokemon%20Icons`,
    'Weather': `${POGO_ASSETS_BASE}/Weather`,
    'Event Pass': `${POGO_ASSETS_BASE}/EventPass`
};

// --- ITEM MAPPING ---
// Mapping for standard Pokemon GO Item IDs to filenames
export const ITEM_MAP: Record<string, string> = {
    // --- EGGS (Official PokeMiners Names) ---
    'egg_2km': 'Egg_2km.png',
    'egg_5km': 'Egg_5km.png',
    'egg_7km': 'Egg_7km.png',
    'egg_10km': 'Egg_10km.png',
    'egg_12km': 'Egg_12km_TR.png',

    // --- BALLS ---
    'poke_ball': 'PokeBall.png', // Assuming exists, otherwise standard name
    'great_ball': 'GreatBall.png',
    'ultra_ball': 'UltraBall.png',
    'master_ball': 'masterball_sprite.png',
    'premier_ball': 'premierball_sprite.png',
    'safari_ball': 'wildball_sprite.png',

    // --- INCENSES & LURES ---
    'incense_green': 'Incense_0.png',
    'incense_orange': 'Incense_1.png',
    'incense_daily': 'dailyWalking_incense.png',
    'incense_bundle': 'Incense_0_Large_Bundle.png',
    'lure_module': 'TroyKey.png',
    'lure_glacial': 'TroyKey_glacial.png',
    'lure_magnetic': 'TroyKey_magnetic.png',
    'lure_mossy': 'TroyKey_moss.png',
    'lure_rainy': 'TroyKey_rainy.png',
    'lure_golden': 'TroyKey_sparkly.png',

    // --- EVOLUTION ITEMS ---
    'dragon_scale': 'Bag_Dragon_Scale_Sprite.png',
    'kings_rock': "Bag_King's_Rock_Sprite.png",
    'metal_coat': 'Bag_Metal_Coat_Sprite.png',
    'sun_stone': 'Bag_Sun_Stone_Sprite.png',
    'up_grade': 'Bag_Up-Grade_Sprite.png',
    'sinnoh_stone': 'Bag_Sinnoh_Stone_Sprite.png',
    'unova_stone': 'Bag_Unova_Stone_Sprite.png',
    'other_stone_a': 'Bag_Other_Stone_A_Sprite.png', // Usually placeholder
    
    // --- RAIDS & BATTLE ---
    'raid_pass': 'Item_1401.png',
    'raid_pass_premium': 'Item_1402.png',
    'raid_pass_remote': 'Item_1408.png',
    'star_piece': 'starpiece.png',
    'lucky_egg': 'luckyegg.png',
    'tm_fast': 'Item_1201.png',
    'tm_charged': 'Item_1202.png',
    'tm_fast_elite': 'Item_1203.png',
    'tm_charged_elite': 'Item_1204.png',

    // --- INCUBATORS ---
    'incubator_basic': 'Item_0902.png', 
    'incubator_super': 'EggIncubatorSuper_Empty.png',
    'incubator_infinite': 'EggIncubatorUnlimited_Activated.png',
    'incubator_iap': 'EggIncubatorIAP_Activated.png',
    'incubator_timed': 'EggIncubatorTimed_Activated.png',

    // --- KEY ITEMS & RESOURCES ---
    'gift_box': 'GiftBox.png',
    'stardust': 'Item_Currency_0201.png',
    'stardust_painted': 'stardust_painted.png',
    'stardust_vector': 'stardust_vector.png',
    'poke_coin': 'Item_COIN_01.png',
    'candy_rare': 'Item_1301.png',
    'candy_xl_rare': 'RareXLCandy_PSD.png',
    'zygarde_cell': 'item_route_cell.png',
    'zygarde_cube': 'item_route_cube.png',
    'meteorite': 'Item_Meteorite.png',
    'shadow_gem': 'Item_ShadowGem.png',
    'shadow_fragment': 'Item_ShadowFragment.png',
    'giovanni_radar': 'Item_Giovanni_MapCompass.png',
    'leader_radar': 'Item_Leader_MapCompass.png',
    'postcard_storage': 'Item_postcardstorageupgrade.1.png',
    'item_storage': 'itemstorageupgrade.1.png',
    'pokemon_storage': 'pokemonstorageupgrade.1.png',
    
    // --- TECH / NEW MECHANICS ---
    'bottle_cap': 'single_stat_increase.png',
    'bottle_cap_gold': 'triple_stat_increase.png',
    'kyurem_black_fuse': 'item_kyuremBlackFusionResource.png',
    'kyurem_white_fuse': 'item_kyuremWhiteFusionResource.png',
    'lucky_applicator': 'lucky_friend_applicator.png',
    'mp_pack': 'mp_pack.png',
    'ar_camera': 'tx_ar_photo_camera.png',
    'converter': 'tx_converter.png',
    'pass_point': 'item_pass_point_01.png',
    
    // --- UNKNOWN / NUMBERED ---
    'item_0704': 'Item_0704.png',
    'item_0706': 'Item_0706.png',
    'item_0707': 'Item_0707.png',
    'item_1600': 'item_1600.png',
    'item_1601': 'item_1601.png',
    'item_1602': 'item_1602.png',
    'item_1606': 'item_1606.png',
    'item_1607': 'item_1607.png',
};

export const getPokemonAsset = (id: number, shiny: boolean = false): string => {
    // PokeMiners Naming Convention:
    // pokemon_icon_{ID_3_DIGITS}_{FORM_2_DIGITS}{_shiny}.png
    
    const paddedId = id.toString().padStart(3, '0');
    const form = '00'; 
    const suffix = shiny ? '_shiny' : '';
    
    return `${POKEMON_ASSETS_BASE}/pokemon_icon_${paddedId}_${form}${suffix}.png`;
};

export const getTypeIcon = (type: string): string => {
    if (!type) return `${TYPE_ICON_BASE}/POKEMON_TYPE_NORMAL.png`;

    // PokeMiners naming convention: POKEMON_TYPE_{TYPE_UPPERCASE}.png
    // Example: POKEMON_TYPE_FIRE.png
    const formattedType = type.toUpperCase();
    
    return `${TYPE_ICON_BASE}/POKEMON_TYPE_${formattedType}.png`;
};

export const getItemIcon = (key: keyof typeof ITEM_MAP): string => {
    const val = ITEM_MAP[key];
    if (!val) return 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg';
    
    // If we manually mapped a full URL (like for Eggs), use it directly
    if (val.startsWith('http')) {
        return val;
    }
    return `${ITEMS_BASE_URL}/${val}`;
};

export const getRaidEggIcon = (tier: string): string => {
    if (tier === '1') return `${POGO_ASSETS_BASE}/Raids/raid_egg_pink.png`;
    if (tier === '3') return `${POGO_ASSETS_BASE}/Raids/raid_egg_yellow.png`;
    if (tier === '5') return `${POGO_ASSETS_BASE}/Raids/raid_egg_legendary.png`;
    if (tier === 'Mega') return `${POGO_ASSETS_BASE}/Raids/raid_egg_mega.png`;
    if (tier === 'Shadow') return `${POGO_ASSETS_BASE}/Raids/raid_egg_shadow_tier_5.png`; 
    // Fallback for others or if assets are missing
    return `${POGO_ASSETS_BASE}/Raids/raid_egg_legendary.png`;
};
