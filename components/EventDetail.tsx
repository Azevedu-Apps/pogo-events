
import React, { useState, useEffect } from 'react';
import { PogoEvent } from '../types';
import { HeroSection, InfoGrid, TicketCard, CustomSectionsDisplay, RaidDisplay, AttackDisplay, FeaturedDisplay, FreeResearchDisplay } from './detail/DetailSections';
import { EggDetailDisplay } from './detail/EggDetail';
import { EventInfographic } from './detail/EventInfographic';
import { toPng } from 'html-to-image';

interface EventDetailProps {
  event: PogoEvent;
  onBack: () => void;
  onOpenCatalog: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onBack, onOpenCatalog }) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [inlineCss, setInlineCss] = useState('');

  // Fetch External CSS (FontAwesome, Google Fonts) to embed in the capture
  useEffect(() => {
      const loadStyles = async () => {
          try {
              const faUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
              const fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap';

              // Fetch concurrently but handle failures individually if needed
              const [faRes, fontRes] = await Promise.all([
                  fetch(faUrl).catch(e => { console.warn('Failed FA fetch', e); return null; }),
                  fetch(fontUrl).catch(e => { console.warn('Failed Font fetch', e); return null; })
              ]);

              let cssCombined = '';

              if (fontRes && fontRes.ok) {
                  const fontCss = await fontRes.text();
                  cssCombined += fontCss + '\n';
              }

              if (faRes && faRes.ok) {
                  let faCss = await faRes.text();
                  // Fix relative font paths in FontAwesome CSS to be absolute CDN paths
                  // Usually they are '../webfonts/fa-solid-900.woff2'
                  faCss = faCss.replace(/\.\.\/webfonts\//g, 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/');
                  cssCombined += faCss;
              }

              setInlineCss(cssCombined);
          } catch (e) {
              console.error('Error loading remote styles for export', e);
          }
      };
      loadStyles();
  }, []);

  // Filter Raids vs Max Battles
  const maxBattles = event.raidsList?.filter(r => 
    r.tier.startsWith('Max') || r.tier === 'Gigamax' || r.tier === 'Dinamax'
  ) || [];
  
  const standardRaids = event.raidsList?.filter(r => 
    !r.tier.startsWith('Max') && r.tier !== 'Gigamax' && r.tier !== 'Dinamax'
  ) || [];

  const handleExportImage = async () => {
      setExporting(true);
      const node = document.getElementById('event-infographic-capture');
      if (node) {
          try {
              // Ensure images are fully loaded before capture
              const imgs = node.querySelectorAll('img');
              await Promise.all(Array.from(imgs).map(img => {
                  if (img.complete) return Promise.resolve();
                  return new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
              }));

              // Configuration to ignore external stylesheets (we injected them manually)
              const options = { 
                  quality: 0.95, 
                  pixelRatio: 2,
                  cacheBust: true,
                  filter: (domNode: HTMLElement) => {
                      // CRITICAL: Exclude external link tags from the capture.
                      // html-to-image tries to read cssRules from them, which fails due to CORS.
                      // We have already injected the necessary CSS via the <style> tag in EventInfographic.
                      return domNode.tagName !== 'LINK';
                  }
              };

              // First render pass (helps with layout stabilization/font loading)
              try { await toPng(node, options); } catch(e) { /* ignore first pass error */ }
              
              // Actual Capture
              const dataUrl = await toPng(node, options);
              
              const link = document.createElement('a');
              link.download = `evento-${event.name.replace(/\s+/g, '-').toLowerCase()}.png`;
              link.href = dataUrl;
              link.click();
          } catch (err) {
              console.error('Failed to export image', err);
              alert('Erro ao gerar imagem. Verifique se os assets (imagens) estão acessíveis.');
          }
      }
      setExporting(false);
  };

  return (
    <div className="animate-fade-in relative">
       {/* Lightbox */}
       {lightboxImg && (
           <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setLightboxImg(null)}>
               <img src={lightboxImg} className="max-w-full max-h-full object-contain rounded-lg" />
               <button className="absolute top-4 right-4 text-white/50 hover:text-white"><i className="fa-solid fa-xmark text-4xl"></i></button>
           </div>
       )}

       {/* Hidden Infographic for Capture */}
       <div className="fixed top-0 left-[-9999px] pointer-events-none">
           <EventInfographic event={event} id="event-infographic-capture" inlineStyles={inlineCss} />
       </div>

       <div className="mb-4 flex justify-between items-center">
           <button onClick={onBack} className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm font-bold">
               <i className="fa-solid fa-arrow-left"></i> Voltar para Lista
           </button>
           <button 
                onClick={handleExportImage} 
                disabled={exporting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition disabled:opacity-50"
           >
               {exporting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-share-nodes"></i>}
               {exporting ? 'Gerando...' : 'Exportar Imagem'}
           </button>
       </div>

       <div className="bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
           
           {/* 1. Informações Gerais (Hero + Info) */}
           <HeroSection event={event} onOpenCatalog={onOpenCatalog} />
           
           <div className="p-8 space-y-12">
                <InfoGrid event={event} />

                {/* 2. Bônus Gerais */}
                {event.bonuses?.length > 0 && (
                    <section>
                        <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><i className="fa-solid fa-gift"></i> Bônus</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {event.bonuses.map((b, i) => (
                                <li key={i} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center text-yellow-100">
                                    <i className="fa-solid fa-star text-yellow-400 mr-3"></i> {b}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* 3. Bônus Pago */}
                {event.payment?.type === 'free_ticket' && event.payment.ticket && (
                    <TicketCard ticket={event.payment.ticket} />
                )}

                {/* 4. Pesquisas Gratuitas */}
                {event.research && <FreeResearchDisplay research={event.research} />}

                {/* 5. Pesquisa Paga */}
                {event.paidResearch?.name && (
                    <section>
                         <h3 className="text-xl font-bold text-orange-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><i className="fa-solid fa-scroll"></i> Pesquisa Paga</h3>
                         <div className="bg-orange-900/20 border border-orange-700/30 p-6 rounded-xl">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-lg font-bold text-white">{event.paidResearch.name}</h4>
                                <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">{event.paidResearch.cost}</span>
                            </div>
                            <p className="text-orange-200 text-sm whitespace-pre-line leading-relaxed">{event.paidResearch.details}</p>
                         </div>
                    </section>
                )}

                {/* 6. Sessões Personalizadas */}
                {event.customTexts?.length > 0 && (
                    <CustomSectionsDisplay sections={event.customTexts} onImageClick={setLightboxImg} />
                )}

                {/* 7. Pokemon em Destaque */}
                {event.featured && <FeaturedDisplay featured={event.featured} />}

                {/* 8. Categorias e Pokemons */}
                {event.spawnCategories?.map(cat => (
                    <section key={cat.id}>
                         <h3 className="text-xl font-bold text-green-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><i className="fa-solid fa-leaf"></i> {cat.name}</h3>
                         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                             {cat.spawns.map((s, idx) => (
                                 <div key={idx} className="bg-slate-900 border border-slate-700 rounded-xl aspect-square flex flex-col items-center justify-center p-2 relative group hover:border-blue-500 transition">
                                     <img src={s.image} className="w-16 h-16 object-contain drop-shadow-lg" />
                                     {s.shiny && <div className="absolute top-1 right-1 text-yellow-400 text-xs"><i className="fa-solid fa-star"></i></div>}
                                     <span className="text-xs font-bold text-slate-300 mt-2 text-center capitalize">{s.name}</span>
                                 </div>
                             ))}
                         </div>
                    </section>
                ))}

                {/* 9. Reides */}
                {standardRaids.length > 0 && <RaidDisplay raids={standardRaids} />}

                {/* 10. Batalhas Max */}
                {maxBattles.length > 0 && <RaidDisplay raids={maxBattles} title="Batalhas Max" icon="fa-cloud-bolt" colorClass="text-fuchsia-400" />}

                {/* 11. Ovos */}
                {event.eggs?.length > 0 && (
                    <EggDetailDisplay groups={event.eggs} title={event.eggTitle} desc={event.eggDesc} />
                )}

                {/* 12. Ataques em Destaque */}
                {event.attacks?.length > 0 && <AttackDisplay attacks={event.attacks} />}

                {/* 13. Galeria de Imagem */}
                {event.images?.length > 0 && (
                    <section>
                        <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><i className="fa-solid fa-images"></i> Galeria</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {event.images.map((img, i) => (
                                <img key={i} src={img} onClick={() => setLightboxImg(img)} className="w-full h-32 object-cover rounded-lg border border-slate-700 cursor-zoom-in hover:opacity-80 transition" />
                            ))}
                        </div>
                    </section>
                )}
           </div>
       </div>
    </div>
  );
};

export default EventDetail;
