
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
    'poke_ball': 'pokeball_sprite.png',
    'great_ball': 'greatball_sprite.png',
    'ultra_ball': 'ultraball_sprite.png',
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
    'other_stone_a': 'Bag_Other_Stone_A_Sprite.png',

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

    // --- SHOP / GIFTS ---
    // 'gift_box' already exists above, ensuring it uses the verified path if not
    'max_mushroom': 'mp_pack.png', // Max Particles / Dynamax resource
};

// --- STATUS ICONS ---
// Updated based on direct repo inspection
export const STATUS_ICONS: Record<string, string> = {
    'shiny': `${POGO_ASSETS_BASE}/Filters/ic_shiny_white.png`,
    'shadow': `${POGO_ASSETS_BASE}/Rocket/ic_shadow.png`,
    'purified': `${POGO_ASSETS_BASE}/Rocket/ic_purified.png`,
    'lucky': `${POGO_ASSETS_BASE}/Filters/pokemon_filter_lucky.png`,
    'hundo': `${POGO_ASSETS_BASE}/Menu%20Icons/icon_shiny_3star.png`, // 4* Perfect
    'xxl': `${POGO_ASSETS_BASE}/Filters/pokemon_filter_xxl.png`, // Using standard filter naming if available
    'xxs': `${POGO_ASSETS_BASE}/Filters/pokemon_filter_xxs.png`,
    'best_buddy': `${POGO_ASSETS_BASE}/Filters/pokemon_filter_best_buddy.png`,
    'pokedex_shiny': `${POGO_ASSETS_BASE}/Pokedex/ic_shiny.png`,
    'pokedex_lucky': `${POGO_ASSETS_BASE}/Filters/ic_lucky_icon.png`,
};

// --- UI ICONS ---
export const UI_ICONS: Record<string, string> = {
    'collection_challenge': `${POGO_ASSETS_BASE}/Menu%20Icons/btn_challenge.png`,
    'raid': `${POGO_ASSETS_BASE}/Menu%20Icons/raid_icon.png`,
    'wild_encounter': `${POGO_ASSETS_BASE}/Quests/QuestPokemonReward.png`,
    'showcase': `${POGO_ASSETS_BASE}/Pokestops/ic_showcase.png`,
    'battle': `${POGO_ASSETS_BASE}/Menu%20Icons/btn_battle.png`,
    'league_great': `${POGO_ASSETS_BASE}/Combat/pogo_great_league.png`,
    'league_ultra': `${POGO_ASSETS_BASE}/Combat/pogo_ultra_league.png`,
    'league_master': `${POGO_ASSETS_BASE}/Combat/pogo_master_league.png`,
};

export const getStatusIcon = (status: keyof typeof STATUS_ICONS): string => {
    return STATUS_ICONS[status] || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
};

export const getUIIcon = (icon: keyof typeof UI_ICONS): string => {
    return UI_ICONS[icon] || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
};

export const getPokemonAsset = (id: number, options?: { shiny?: boolean, form?: string, costume?: string }): string => {
    // PokeMiners Naming Convention:
    // pokemon_icon_{ID_3_DIGITS}_{FORM_2_DIGITS}_{COSTUME_2_DIGITS}{_shiny}.png
    // Verified: pokemon_icon_001_00.png

    const paddedId = id.toString().padStart(3, '0');
    const form = options?.form || '00';
    const costume = options?.costume ? `_${options.costume}` : '';
    const suffix = options?.shiny ? '_shiny' : '';

    return `${POKEMON_ASSETS_BASE}/pokemon_icon_${paddedId}_${form}${costume}${suffix}.png`;
};

export const getTypeIcon = (type: string): string => {
    if (!type) return `${TYPE_ICON_BASE}/POKEMON_TYPE_NORMAL.png`;
    // Verified Types folder exists
    const formattedType = type.toUpperCase();
    return `${TYPE_ICON_BASE}/POKEMON_TYPE_${formattedType}.png`;
};

export const getItemIcon = (key: keyof typeof ITEM_MAP): string => {
    const val = ITEM_MAP[key];
    if (!val) return 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg';

    if (val.startsWith('http')) {
        return val;
    }
    return `${ITEMS_BASE_URL}/${val}`;
};

/**
 * Global helper to fix known broken sprite URLs (e.g. Mega Diancie on PokemonDB).
 */
export const fixPokemonSpriteUrl = (url: string): string => {
    if (!url) return '';

    const lowerUrl = url.toLowerCase();

    // Fix: Mega Diancie (PokemonDB is missing this asset, use Serebii art)
    // Also catches PokeMiners ID 719 (Diancie) which is missing/broken for Shiny
    if (
        (lowerUrl.includes('diancie') && (lowerUrl.includes('mega') || lowerUrl.includes('10075'))) ||
        /[\/_]719[\/_.]/.test(lowerUrl)
    ) {
        return "https://www.serebii.net/pokemon/art/719-m.png";
    }

    return url;
};

export const getRaidEggIcon = (tier: string): string => {
    // Verified filenames in Images/Raids
    if (tier === '1') return `${POGO_ASSETS_BASE}/Raids/ic_raid_egg_normal.png`;
    if (tier === '3') return `${POGO_ASSETS_BASE}/Raids/ic_raid_egg_rare.png`;
    if (tier === '5') return `${POGO_ASSETS_BASE}/Raids/ic_raid_egg_legendary.png`;
    if (tier === 'Mega') return `${POGO_ASSETS_BASE}/Raids/raid_egg_3_icon.png`; // Mega Egg
    if (tier === 'Shadow') return `${POGO_ASSETS_BASE}/Raids/raid_egg_shadow_icon.png`; // Assuming shadow exists or using fallback
    if (tier === 'Primal') return `${POGO_ASSETS_BASE}/Raids/raid_egg_primal_icon.png`;

    // Fallback
    return `${POGO_ASSETS_BASE}/Raids/ic_raid_egg_legendary.png`;
};

// --- BACKGROUND ASSETS ---

// Location Cards (Cities & Real World Locations)
export const LOCATION_BACKGROUNDS = [
    "lc_AirAdv2024_bali.png", "lc_AirAdv2024_jakarta.png", "lc_AirAdv2024_surabaya.png", "lc_AirAdv2024_yogyakarta.png",
    "lc_CherryBlossomFest2025_yeouido.png",
    "lc_CitySafari2023_barcelona_2023.png", "lc_CitySafari2023_mexicoCity_2023.png", "lc_CitySafari2023_seoul_2023.png",
    "lc_CitySafari2024_hongkong.png", "lc_CitySafari2024_incheon.png", "lc_CitySafari2024_milan.png", "lc_CitySafari2024_mumbai.png",
    "lc_CitySafari2024_santiago.png", "lc_CitySafari2024_saopaulo.png", "lc_CitySafari2024_singapore.png", "lc_CitySafari2024_tainan.png",
    "lc_GOWA_fukuoka.png",
    "lc_GoFest2023_london.png", "lc_GoFest2023_newyork.png", "lc_GoFest2023_osaka.png",
    "lc_GoFest2024_madrid.png", "lc_GoFest2024_newyork.png", "lc_GoFest2024_sendai.png",
    "lc_GoFest2025_jerseycity.png", "lc_GoFest2025_osaka.png", "lc_GoFest2025_paris.png",
    "lc_GoTour2023.png", "lc_GoTour2024_losAngeles.png", "lc_GoTour2025_losAngeles.png", "lc_GoTour2025_newTaipeiCity.png",
    "lc_Jangheung_Water_Festival_2025.png", "lc_JejuAirAdv2023.png",
    "lc_LotteGiants.png",
    "lc_MLB_arizonaDiamondbacks.png", "lc_MLB_baltimoreOrioles.png", "lc_MLB_bostonRedSox.png", "lc_MLB_chicagoWhitesox.png",
    "lc_MLB_clevelandGuardians.png", "lc_MLB_mariners.png", "lc_MLB_marlins.png", "lc_MLB_milwaukeeBrewers.png",
    "lc_MLB_minnesotaTwins.png", "lc_MLB_newyorkMets.png", "lc_MLB_sanFranciscoGiants.png", "lc_MLB_tampaBayRays.png",
    "lc_MLB_texasRangers.png", "lc_MLB_washingtonNationals.png",
    "lc_OsakaEvent2025_01.png", "lc_OsakaEvent2025_02.png", "lc_OsakaEvent2025_03.png",
    "lc_Wcs2024_honolulu.png", "lc_Wcs2025_anaheim.png",
    "lc_roadtrip2025_berlin.png", "lc_roadtrip2025_cologne.png", "lc_roadtrip2025_hague.png",
    "lc_roadtrip2025_london.png", "lc_roadtrip2025_manchester.png", "lc_roadtrip2025_paris.png", "lc_roadtrip2025_valencia.png"
];

// Special & Event Backgrounds (Themed Catch Backgrounds, Global Events, Seasons)
export const SPECIAL_BACKGROUNDS = [
    // Global Events / Catch Backgrounds (from LocationCards folder with 'sb_' prefix)
    "sb_2024_decemberCdRecap.png",
    "sb_9thAnniversary.png",
    "sb_GOWA_fukuoka.png",
    "sb_GoFest2024_radiance.png", "sb_GoFest2024_umbra.png",
    "sb_GoFest2024_wormhole.png", "sb_GoFest2024_wormhole_moon.png", "sb_GoFest2024_wormhole_sun.png",
    "sb_GoFest2025.png",
    "sb_GoFest2025_Eternatus.png",
    "sb_GoTour2025_black.png", "sb_GoTour2025_black_white.png", "sb_GoTour2025_enigma.png", "sb_GoTour2025_white.png",
    "sb_Season17_DuelDestiny.png", "sb_Season18_MightAndMastery.png", "sb_Season19_DelightfulDays.png",
    "sb_TeamLeader_blue.png", "sb_TeamLeader_red.png", "sb_TeamLeader_yellow.png",

    // General Event Backgrounds (from Backgrounds folder)
    "Background_Event.png",
    "Background_Adventure.png",
    "Sky_Stars_GoFest2021.png",
    "background_GOFEST_2021.png",
    "tx_eventsky_gofest2021.png",

    // Quest/Season Specific (from Backgrounds)
    "QuestListBackground_alola.png",
    "QuestListBackground_seasonOfGO.png",
    "QuestListBackground_seasonOfHiddenGems.png",
    "QuestListBackground_seasonOfMythicalWishes.png",
    "QuestListBackground_seasonOfRisingHeros.png",
    "QuestListBg_seasonOfHeritage.png"
];

// Helper to get full URL
export const getBackgroundAsset = (filename: string): string => {
    if (filename.startsWith('lc_') || filename.startsWith('sb_')) {
        return `${ASSET_FOLDERS['Location Cards']}/${filename}`;
    }
    return `${POGO_ASSETS_BASE}/Backgrounds/${filename}`;
};
