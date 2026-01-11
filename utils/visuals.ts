

export const getEggSvg = (color: string) => `
    <svg viewBox="0 0 100 120" class="w-full h-full drop-shadow-xl filter">
        <defs>
            <radialGradient id="eggGrad-${color.replace('#', '')}" cx="30%" cy="30%" r="70%">
                <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
            </radialGradient>
        </defs>
        <path d="M50 5 C 20 5, 5 45, 5 75 C 5 105, 25 115, 50 115 C 75 115, 95 105, 95 75 C 95 45, 80 5, 50 5" fill="#1e293b" stroke="${color}" stroke-width="2"/>
        <circle cx="35" cy="40" r="8" fill="${color}" fill-opacity="0.8"/>
        <circle cx="65" cy="60" r="12" fill="${color}" fill-opacity="0.8"/>
        <circle cx="30" cy="85" r="10" fill="${color}" fill-opacity="0.8"/>
        <circle cx="75" cy="90" r="6" fill="${color}" fill-opacity="0.8"/>
        <circle cx="50" cy="25" r="5" fill="${color}" fill-opacity="0.8"/>
        <path d="M50 5 C 20 5, 5 45, 5 75 C 5 105, 25 115, 50 115 C 75 115, 95 105, 95 75 C 95 45, 80 5, 50 5" fill="url(#eggGrad-${color.replace('#', '')})"/>
    </svg>
`;

export const typeColors: Record<string, string> = { 'Normal': 'bg-gray-400', 'Fire': 'bg-red-500', 'Water': 'bg-blue-500', 'Grass': 'bg-green-500', 'Electric': 'bg-yellow-400', 'Ice': 'bg-cyan-300', 'Fighting': 'bg-orange-700', 'Poison': 'bg-purple-500', 'Ground': 'bg-yellow-700', 'Flying': 'bg-indigo-300', 'Psychic': 'bg-pink-500', 'Bug': 'bg-lime-500', 'Rock': 'bg-yellow-800', 'Ghost': 'bg-indigo-800', 'Dragon': 'bg-indigo-600', 'Steel': 'bg-slate-400', 'Dark': 'bg-slate-800', 'Fairy': 'bg-pink-300' };

export const getEventTheme = (type: string) => {
    const t = (type || '').toLowerCase();

    // Community Day (Cyan/Blue Neon)
    if (t.includes('comunidade') || t.includes('community')) {
        return {
            cardBg: "bg-gradient-to-b from-blue-900/40 via-slate-900/90 to-slate-950",
            gradient: "bg-gradient-to-br from-blue-900 to-slate-900",
            border: "border-cyan-500",
            text: "text-cyan-100",
            accent: "text-cyan-400",
            badge: "bg-gradient-to-r from-blue-600 to-cyan-500",
            icon: "fa-users",
            shadow: "shadow-cyan-500/20"
        };
    }

    // Spotlight Hour (Gold/Orange Neon)
    if (t.includes('destaque') || t.includes('spotlight')) {
        return {
            cardBg: "bg-gradient-to-b from-yellow-900/40 via-slate-900/90 to-slate-950",
            gradient: "bg-gradient-to-br from-yellow-900 to-slate-900",
            border: "border-yellow-500",
            text: "text-yellow-100",
            accent: "text-yellow-400",
            badge: "bg-gradient-to-r from-yellow-600 to-orange-500",
            icon: "fa-lightbulb",
            shadow: "shadow-yellow-500/20"
        };
    }

    // Raids (Red/Rose Neon)
    if (t.includes('reide') || t.includes('raid')) {
        return {
            cardBg: "bg-gradient-to-b from-red-900/40 via-slate-900/90 to-slate-950",
            gradient: "bg-gradient-to-br from-red-900 to-slate-900",
            border: "border-red-500",
            text: "text-red-100",
            accent: "text-red-400",
            badge: "bg-gradient-to-r from-red-600 to-rose-600",
            icon: "fa-dragon",
            shadow: "shadow-red-500/20"
        };
    }

    // Max Battles (Fuchsia/Pink Neon)
    if (t.includes('max') || t.includes('gigamax') || t.includes('dinamax')) {
        return {
            cardBg: "bg-gradient-to-b from-fuchsia-900/40 via-slate-900/90 to-slate-950",
            gradient: "bg-gradient-to-br from-fuchsia-900 to-slate-900",
            border: "border-fuchsia-500",
            text: "text-fuchsia-100",
            accent: "text-fuchsia-400",
            badge: "bg-gradient-to-r from-fuchsia-600 to-pink-600",
            icon: "fa-cloud-bolt",
            shadow: "shadow-fuchsia-500/20"
        };
    }

    // Seasonal / Ticket (Green/Emerald Neon)
    if (t.includes('sazonal') || t.includes('ticket') || t.includes('local') || t.includes('safari')) {
        return {
            cardBg: "bg-gradient-to-b from-emerald-900/40 via-slate-900/90 to-slate-950",
            gradient: "bg-gradient-to-br from-emerald-900 to-slate-900",
            border: "border-emerald-500",
            text: "text-emerald-100",
            accent: "text-emerald-400",
            badge: "bg-gradient-to-r from-emerald-600 to-teal-600",
            icon: "fa-leaf",
            shadow: "shadow-emerald-500/20"
        };
    }

    // Default (Indigo/Purple Neon)
    return {
        cardBg: "bg-gradient-to-b from-indigo-900/40 via-slate-900/90 to-slate-950",
        gradient: "bg-gradient-to-br from-indigo-900 to-slate-900",
        border: "border-indigo-500",
        text: "text-indigo-100",
        accent: "text-indigo-400",
        badge: "bg-gradient-to-r from-indigo-600 to-violet-600",
        icon: "fa-earth-americas",
        shadow: "shadow-indigo-500/20"
    };
};

export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
};
