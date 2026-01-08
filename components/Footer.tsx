import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="text-center py-12 bg-[#0b0e14] relative z-10">
      <div className="mb-4">
        <i className="fa-solid fa-dragon text-4xl text-slate-700"></i>
      </div>
      <p className="text-slate-500 text-sm font-rajdhani uppercase tracking-widest mb-8">Vorgex Event Helper</p>

      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center gap-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider text-center opacity-60">
        <div className="flex flex-col gap-1">
          <p>
            Vorgex é um projeto de fã sem fins lucrativos.
          </p>
          <p>
            Pokémon e Pokémon GO são marcas registradas de The Pokémon Company, Niantic, Inc. e Nintendo.
          </p>
          <p>
            Todas as imagens e nomes de ativos são propriedade de seus respectivos donos.
          </p>
        </div>
      </div>
    </footer>
  );
};
