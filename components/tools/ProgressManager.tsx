
import React, { useState, useRef } from 'react';
import { PogoEvent } from '../../types';
import { Button, SectionTitle, CustomSelect } from '../ui/Shared';

interface ProgressManagerProps {
    events: PogoEvent[];
}

export const ProgressManager: React.FC<ProgressManagerProps> = ({ events }) => {
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error' | 'loading', message: string }>({ type: 'idle', message: '' });
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showStatus = (type: 'success' | 'error', message: string) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: 'idle', message: '' }), 5000);
    };

    const exportAll = () => {
        const backup: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('pogo_catalog_progress_')) {
                try {
                    backup[key] = JSON.parse(localStorage.getItem(key) || '{}');
                } catch (e) {}
            }
        }

        if (Object.keys(backup).length === 0) {
            showStatus('error', 'Nenhum progresso encontrado para exportar.');
            return;
        }

        downloadJson(backup, `backup-pogohub-geral-${new Date().toISOString().split('T')[0]}.json`);
        showStatus('success', 'Backup geral exportado com sucesso.');
    };

    const exportIndividual = () => {
        if (!selectedEventId) {
            showStatus('error', 'Selecione um evento para exportar.');
            return;
        }

        const key = `pogo_catalog_progress_${selectedEventId}`;
        const data = localStorage.getItem(key);

        if (!data) {
            showStatus('error', 'Nenhum progresso salvo para este evento.');
            return;
        }

        const event = events.find(e => e.id === selectedEventId);
        const fileName = `progresso-${event?.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        
        downloadJson(JSON.parse(data), fileName);
        showStatus('success', 'Progresso individual exportado.');
    };

    const downloadJson = (data: any, fileName: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                processImport(json);
            } catch (err) {
                showStatus('error', 'O arquivo selecionado não é um JSON válido.');
            }
        };
        reader.readAsText(file);
        // Clear input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processImport = (data: any) => {
        if (typeof data !== 'object' || data === null) {
            showStatus('error', 'Formato de dados inválido.');
            return;
        }

        // Check if it's a GENERAL backup
        const keys = Object.keys(data);
        const isGeneral = keys.every(k => k.startsWith('pogo_catalog_progress_'));

        if (isGeneral) {
            // General backup apply
            keys.forEach(k => {
                localStorage.setItem(k, JSON.stringify(data[k]));
            });
            showStatus('success', `${keys.length} protocolos de progresso sincronizados com sucesso.`);
        } else {
            // Individual progress apply
            if (!selectedEventId) {
                showStatus('error', 'Para importar progresso individual, selecione o evento de destino primeiro.');
                return;
            }
            localStorage.setItem(`pogo_catalog_progress_${selectedEventId}`, JSON.stringify(data));
            showStatus('success', 'Progresso aplicado ao evento selecionado.');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Status Alert */}
            {status.type !== 'idle' && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-bounce ${
                    status.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-400' : 'bg-red-900/20 border-red-500 text-red-400'
                }`}>
                    <i className={`fa-solid ${status.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
                    <span className="font-bold text-sm uppercase tracking-wide font-rajdhani">{status.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* EXPORT SECTION */}
                <div className="bg-[#151a25] border border-white/5 rounded-3xl p-8 shadow-xl space-y-6">
                    <SectionTitle title="Exportar Dados" icon="fa-solid fa-download" colorClass="text-blue-400" />
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                            <h4 className="text-white font-bold mb-2 uppercase text-xs tracking-widest font-rajdhani">Backup Geral</h4>
                            <p className="text-slate-500 text-xs mb-4">Gera um único arquivo com o progresso de TODOS os eventos salvos localmente.</p>
                            <Button onClick={exportAll} className="w-full">Exportar Tudo (.json)</Button>
                        </div>

                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                            <h4 className="text-white font-bold mb-2 uppercase text-xs tracking-widest font-rajdhani">Exportação Individual</h4>
                            <p className="text-slate-500 text-xs mb-4">Escolha um evento específico para extrair apenas o progresso dele.</p>
                            <div className="flex flex-col gap-4">
                                <CustomSelect 
                                    value={selectedEventId}
                                    onChange={setSelectedEventId}
                                    options={events.map(e => ({ value: e.id, label: e.name }))}
                                    placeholder="Selecionar evento..."
                                />
                                <Button onClick={exportIndividual} variant="secondary" className="w-full" disabled={!selectedEventId}>Exportar Selecionado</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* IMPORT SECTION */}
                <div className="bg-[#151a25] border border-white/5 rounded-3xl p-8 shadow-xl space-y-6">
                    <SectionTitle title="Importar Dados" icon="fa-solid fa-upload" colorClass="text-emerald-400" />
                    
                    <div className="flex-1 flex flex-col justify-center border-2 border-dashed border-slate-800 rounded-2xl p-10 text-center group hover:border-emerald-500/50 transition-colors">
                        <i className="fa-solid fa-cloud-arrow-up text-5xl text-slate-700 mb-4 group-hover:text-emerald-500 transition-colors"></i>
                        <h4 className="text-white font-bold uppercase text-sm tracking-widest font-rajdhani mb-2">Restaurar Backup</h4>
                        <p className="text-slate-500 text-xs mb-6 max-w-xs mx-auto">Selecione um arquivo de backup (.json) gerado anteriormente para sincronizar o progresso.</p>
                        
                        <input 
                            type="file" 
                            accept=".json" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        
                        <Button onClick={() => fileInputRef.current?.click()} variant="success" className="mx-auto">
                            Selecionar Arquivo
                        </Button>
                    </div>

                    <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl">
                        <div className="flex gap-3 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                            <i className="fa-solid fa-circle-info"></i>
                            <span>Nota de Importação</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed italic">
                            O sistema detecta automaticamente se o arquivo é um backup geral ou individual. 
                            Ao importar progresso individual, certifique-se de ter selecionado o evento correto no menu de exportação acima, pois ele será usado como alvo da sincronização.
                        </p>
                    </div>
                </div>
            </div>

            {/* SECURITY WARNING */}
            <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-shield-halved text-red-500 text-xl"></i>
                </div>
                <div>
                    <h3 className="text-white font-bold uppercase tracking-widest font-rajdhani mb-1">Aviso de Sobrescrita</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        A importação de dados irá <strong className="text-red-400">sobrescrever permanentemente</strong> qualquer progresso atual para os eventos correspondentes. 
                        Recomendamos fazer um backup geral antes de realizar qualquer importação.
                    </p>
                </div>
            </div>
        </div>
    );
};
