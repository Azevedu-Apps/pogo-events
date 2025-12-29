
import React, { useState } from 'react';
import { PogoEvent } from '../types';
import { SearchStringGenerator } from './tools/SearchStringGenerator';
import { ProgressManager } from './tools/ProgressManager';

interface ToolsPageProps {
    events: PogoEvent[];
}

type ToolType = 'list' | 'search_strings' | 'progress_manager';

export const ToolsPage: React.FC<ToolsPageProps> = ({ events }) => {
    const [currentTool, setCurrentTool] = useState<ToolType>('list');

    const tools = [
        {
            id: 'search_strings',
            title: 'Strings de Busca',
            desc: 'Gere códigos de busca rápidos para filtrar Pokémon do evento, limpar a bagunça ou encontrar 100%.',
            icon: 'fa-solid fa-magnifying-glass-chart',
            color: 'text-emerald-400',
            bg: 'bg-emerald-900/20',
            border: 'border-emerald-500/30'
        },
        {
            id: 'progress_manager',
            title: 'Gerenciar Dados',
            desc: 'Exportar ou importar seu progresso de capturas para backup ou transferência entre dispositivos.',
            icon: 'fa-solid fa-file-import',
            color: 'text-blue-400',
            bg: 'bg-blue-900/20',
            border: 'border-blue-500/30'
        },
        {
            id: 'coming_soon',
            title: 'Em Breve',
            desc: 'Mais ferramentas estão sendo desenvolvidas para ajudar na sua jornada.',
            icon: 'fa-solid fa-screwdriver-wrench',
            color: 'text-slate-500',
            bg: 'bg-slate-800',
            border: 'border-slate-700',
            disabled: true
        }
    ];

    if (currentTool === 'search_strings') {
        return (
            <div>
                <button 
                    onClick={() => setCurrentTool('list')} 
                    className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition font-bold"
                >
                    <i className="fa-solid fa-arrow-left"></i> Voltar para Ferramentas
                </button>
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <i className="fa-solid fa-magnifying-glass-chart text-emerald-400"></i> Strings de Busca
                    </h1>
                    <p className="text-slate-400">Gere filtros automáticos baseados nos spawns dos eventos ativos.</p>
                </div>
                <SearchStringGenerator events={events} />
            </div>
        );
    }

    if (currentTool === 'progress_manager') {
        return (
            <div>
                <button 
                    onClick={() => setCurrentTool('list')} 
                    className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition font-bold"
                >
                    <i className="fa-solid fa-arrow-left"></i> Voltar para Ferramentas
                </button>
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <i className="fa-solid fa-file-import text-blue-400"></i> Gerenciador de Dados
                    </h1>
                    <p className="text-slate-400">Backup e restauração do progresso do catálogo.</p>
                </div>
                <ProgressManager events={events} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Caixa de Ferramentas</h1>
                <p className="text-slate-400">Utilitários para otimizar sua gameplay no Pokémon GO.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <button 
                        key={tool.id}
                        onClick={() => !tool.disabled && setCurrentTool(tool.id as ToolType)}
                        disabled={tool.disabled}
                        className={`
                            text-left p-6 rounded-2xl border transition-all duration-300 group
                            ${tool.bg} ${tool.border}
                            ${tool.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl cursor-pointer'}
                        `}
                    >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 ${tool.color} bg-slate-900/50 shadow-inner`}>
                            <i className={tool.icon}></i>
                        </div>
                        <h3 className={`text-xl font-bold text-white mb-2 ${!tool.disabled && 'group-hover:text-blue-400 transition'}`}>
                            {tool.title}
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {tool.desc}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};
