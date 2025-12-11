export const getEggSvg = (color: string) => `
    <svg viewBox="0 0 100 120" class="w-full h-full drop-shadow-xl filter">
        <defs>
            <radialGradient id="eggGrad-${color.replace('#', '')}" cx="30%" cy="30%" r="70%">
                <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
            </radialGradient>
        </defs>
        <path d="M50 5 C 20 5, 5 45, 5 75 C 5 105, 25 115, 50 115 C 75 115, 95 105, 95 75 C 95 45, 80 5, 50 5" fill="#f8fafc" stroke="#1e293b" stroke-width="3"/>
        <circle cx="35" cy="40" r="8" fill="${color}"/>
        <circle cx="65" cy="60" r="12" fill="${color}"/>
        <circle cx="30" cy="85" r="10" fill="${color}"/>
        <circle cx="75" cy="90" r="6" fill="${color}"/>
        <circle cx="50" cy="25" r="5" fill="${color}"/>
        <path d="M50 5 C 20 5, 5 45, 5 75 C 5 105, 25 115, 50 115 C 75 115, 95 105, 95 75 C 95 45, 80 5, 50 5" fill="url(#eggGrad-${color.replace('#', '')})"/>
    </svg> 
`;

export const typeColors: Record<string, string> = { 'Normal': 'bg-gray-400', 'Fire': 'bg-red-500', 'Water': 'bg-blue-500', 'Grass': 'bg-green-500', 'Electric': 'bg-yellow-400', 'Ice': 'bg-cyan-300', 'Fighting': 'bg-orange-700', 'Poison': 'bg-purple-500', 'Ground': 'bg-yellow-700', 'Flying': 'bg-indigo-300', 'Psychic': 'bg-pink-500', 'Bug': 'bg-lime-500', 'Rock': 'bg-yellow-800', 'Ghost': 'bg-indigo-800', 'Dragon': 'bg-indigo-600', 'Steel': 'bg-slate-400', 'Dark': 'bg-slate-800', 'Fairy': 'bg-pink-300' };
