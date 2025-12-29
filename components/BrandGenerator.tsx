
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Button, Input, TextArea, SectionTitle } from './ui/Shared';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface BrandBible {
    name: string;
    slogan: string;
    description: string;
    palette: Array<{ hex: string; name: string; usage: string }>;
    typography: {
        header: string;
        body: string;
    };
    voice: string[];
    logoUrl?: string;
}

export const BrandGenerator: React.FC = () => {
    const [name, setName] = useState('');
    const [mission, setMission] = useState('');
    const [loading, setLoading] = useState(false);
    const [bible, setBible] = useState<BrandBible | null>(null);
    const [error, setError] = useState('');

    const generateBrand = async () => {
        if (!name || !mission) {
            setError('Por favor, preencha o nome e a missão da empresa.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // 1. Generate Brand Text Identity
            const textResponse = await ai.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: `Generate a comprehensive brand identity for a company named "${name}". 
                Mission: "${mission}".
                Return a JSON object following this structure:
                {
                    "slogan": "Short catchy slogan",
                    "description": "2-sentence brand essence",
                    "palette": [{"hex": "#XXXXXX", "name": "Color Name", "usage": "Usage note"}],
                    "typography": {"header": "A popular Google Font for headers", "body": "A popular Google Font for body text"},
                    "voice": ["3 adjectives describing brand voice"]
                }
                The palette must have exactly 5 colors.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            slogan: { type: Type.STRING },
                            description: { type: Type.STRING },
                            palette: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        hex: { type: Type.STRING },
                                        name: { type: Type.STRING },
                                        usage: { type: Type.STRING }
                                    }
                                }
                            },
                            typography: {
                                type: Type.OBJECT,
                                properties: {
                                    header: { type: Type.STRING },
                                    body: { type: Type.STRING }
                                }
                            },
                            voice: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["slogan", "description", "palette", "typography", "voice"]
                    }
                }
            });

            const brandData = JSON.parse(textResponse.text || '{}');

            // 2. Generate Logo Concept
            const logoResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: [{ text: `A professional, minimalist, vector-style logo for a brand named "${name}". Industry context: ${mission}. Clean white background, high contrast, elegant symbol.` }],
                config: {
                    imageConfig: { aspectRatio: "1:1" }
                }
            });

            let logoUrl = '';
            for (const part of logoResponse.candidates[0].content.parts) {
                if (part.inlineData) {
                    logoUrl = `data:image/png;base64,${part.inlineData.data}`;
                }
            }

            setBible({
                ...brandData,
                name,
                logoUrl
            });

            // Dynamically load Google Fonts
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${brandData.typography.header.replace(/\s+/g, '+')}&family=${brandData.typography.body.replace(/\s+/g, '+')}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);

        } catch (err: any) {
            console.error(err);
            setError('Falha ao gerar identidade de marca. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-20">
            <div className="mb-12">
                <h1 className="text-5xl font-black text-white font-rajdhani uppercase italic tracking-tighter mb-2">Architect.<span className="text-blue-500">AI</span></h1>
                <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Protocolo de Criação de Identidade Visual</p>
            </div>

            {!bible ? (
                <div className="bg-[#151a25] border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 max-w-2xl">
                        <SectionTitle title="Configuração Inicial" icon="fa-solid fa-seedling" />
                        <div className="space-y-6">
                            <Input 
                                label="Nome da Marca" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                placeholder="Ex: CyberFlow" 
                            />
                            <TextArea 
                                label="Missão e Visão" 
                                value={mission} 
                                onChange={e => setMission(e.target.value)} 
                                placeholder="Descreva o que sua empresa faz e qual sentimento ela deve passar..." 
                                className="h-40"
                            />
                            {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
                            <Button 
                                onClick={generateBrand} 
                                disabled={loading}
                                className="w-full py-4 text-lg"
                            >
                                {loading ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>}
                                {loading ? 'Sincronizando Neurônios...' : 'Gerar Identidade de Marca'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* DASHBOARD GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Header Info */}
                        <div className="lg:col-span-8 bg-[#151a25] border border-white/5 rounded-3xl p-8 flex flex-col justify-center shadow-xl">
                            <h2 className="text-6xl font-black text-white font-rajdhani uppercase italic mb-2 tracking-tighter">{bible.name}</h2>
                            <p className="text-blue-400 font-bold text-xl font-rajdhani uppercase tracking-widest mb-6">{bible.slogan}</p>
                            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">{bible.description}</p>
                            <div className="flex gap-4 mt-8">
                                {bible.voice.map(v => (
                                    <span key={v} className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                        {v}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Logo Box */}
                        <div className="lg:col-span-4 bg-white rounded-3xl p-8 flex items-center justify-center shadow-2xl relative group">
                            <div className="absolute top-4 left-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Conceito de Logo</div>
                            {bible.logoUrl ? (
                                <img src={bible.logoUrl} className="w-full aspect-square object-contain" alt="Brand Logo" />
                            ) : (
                                <div className="text-slate-200 text-8xl font-black">{bible.name[0]}</div>
                            )}
                        </div>

                        {/* Palette Section */}
                        <div className="lg:col-span-12">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px flex-1 bg-white/10"></div>
                                <h3 className="text-2xl font-black text-white font-rajdhani uppercase tracking-widest">Paleta Cromática</h3>
                                <div className="h-px flex-1 bg-white/10"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {bible.palette.map((color, idx) => (
                                    <div key={idx} className="bg-[#151a25] border border-white/5 rounded-2xl overflow-hidden shadow-lg group hover:border-white/20 transition-all">
                                        <div className="h-32 w-full transition-transform duration-500 group-hover:scale-105" style={{ backgroundColor: color.hex }}></div>
                                        <div className="p-4">
                                            <div className="font-bold text-white mb-1 uppercase tracking-wider">{color.name}</div>
                                            <div className="font-mono text-blue-400 text-sm mb-2">{color.hex}</div>
                                            <p className="text-[10px] text-slate-500 leading-tight">{color.usage}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Typography Section */}
                        <div className="lg:col-span-12 bg-[#151a25] border border-white/5 rounded-3xl p-10 shadow-xl relative overflow-hidden">
                            <div className="absolute -right-20 -bottom-20 text-[20rem] font-black text-white/5 pointer-events-none select-none">Aa</div>
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <div className="text-blue-500 font-bold uppercase text-xs tracking-widest mb-4">Header Font: {bible.typography.header}</div>
                                    <h4 className="text-white text-5xl mb-4" style={{ fontFamily: bible.typography.header }}>
                                        The quick brown fox jumps over the lazy dog.
                                    </h4>
                                    <p className="text-slate-500 text-sm italic">Ideal para títulos, impacto e clareza visual em grandes formatos.</p>
                                </div>
                                <div>
                                    <div className="text-blue-500 font-bold uppercase text-xs tracking-widest mb-4">Body Font: {bible.typography.body}</div>
                                    <p className="text-slate-300 text-xl leading-relaxed" style={{ fontFamily: bible.typography.body }}>
                                        Esta fonte foi selecionada para garantir máxima legibilidade em parágrafos e textos longos. 
                                        Sua estrutura equilibrada comunica profissionalismo e modernidade, mantendo o foco no conteúdo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-12">
                        <Button onClick={() => setBible(null)} variant="secondary" className="px-12">
                            <i className="fa-solid fa-rotate-left mr-2"></i> Criar Nova Identidade
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
