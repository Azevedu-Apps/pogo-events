import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0b0e14] border-t border-white/5 py-4 px-6 mt-auto z-40">
      <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center gap-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider text-center">
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
