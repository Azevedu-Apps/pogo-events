export const generatePokemonId = (pokemon: { name: string, form?: string, costume?: string, background?: string }): string => {
    const parts = [
        pokemon.name.toLowerCase().replace(/\s+/g, '-')
    ];

    if (pokemon.form && pokemon.form !== '00') {
        parts.push(`f-${pokemon.form.toLowerCase().replace(/\s+/g, '-')}`);
    }

    if (pokemon.costume) {
        parts.push(`c-${pokemon.costume.toLowerCase().replace(/\s+/g, '-')}`);
    }

    if (pokemon.background) {
        parts.push(`bg-${pokemon.background.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-')}`);
    }

    return parts.join('-');
};
