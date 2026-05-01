import { useEffect, useState } from 'react';
import { Users, History, Loader2 } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import api from '../../lib/api';
import { getImageUrl } from '../../lib/utils';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { useSettingsStore } from '../../store/settingsStore';

interface Leader {
  id: number;
  name: string;
  photo: string | null;
  period: string;
  sort_order: number;
}

export default function Leaders() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettingsStore();
  const siteName = settings?.site_name || 'Portal Pesantren';

  useSeoMeta({
    title: `Silsilah Pengasuh — ${siteName}`,
    description: `Mengenal silsilah kepemimpinan dan perjuangan para Masyayikh ${siteName} dari masa ke masa.`,
    type: 'website',
    siteName,
  });

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await api.get('/public/leaders');
        setLeaders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching leaders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaders();
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">Menyusun Silsilah...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] w-full pb-32">
      {/* Page Header */}
      <section className="bg-primary pt-24 md:pt-28 pb-32 md:pb-40 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white py-4 md:py-0">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-8 border border-white/10">
               <History className="w-4 h-4 text-secondary" /> Jejak Kepemimpinan
            </div>
            <h1 className="text-3xl md:text-6xl font-black mb-6 tracking-tighter uppercase drop-shadow-2xl italic leading-none">Silsilah Pengasuh</h1>
            <p className="text-gray-200 max-w-2xl mx-auto text-sm md:text-lg font-medium opacity-80 italic">
               Untaian sanad perjuangan dan kepemimpinan para Masyayikh yang telah mendedikasikan hidupnya demi tegaknya panji Islam di bumi nusantara.
            </p>
        </div>
        {/* Decorative Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-[#fcfcfc]" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
      </section>

      {/* Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
         <div className="mb-12">
            <Breadcrumbs items={[{ label: 'Profil', path: '/profil' }, { label: 'Silsilah Pengasuh' }]} />
         </div>

         {leaders.length === 0 ? (
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-12 md:p-20 text-center shadow-2xl shadow-black/5 border border-gray-100">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200"><Users className="w-8 h-8 md:w-10 md:h-10" /></div>
               <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">Data pengasuh belum tersedia.</p>
            </div>
         ) : (
            <div className="flex overflow-x-auto overflow-y-hidden pb-16 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 snap-x snap-mandatory scrollbar-hide">
               {leaders.map((leader, idx) => (
                  <div key={leader.id} className="group flex flex-col items-center text-center min-w-[300px] md:min-w-0 snap-center">
                     {/* Photo Frame */}
                     <div className="relative w-full max-w-[320px] mb-10">
                        {/* Decorative background circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-[3rem] rotate-6 group-hover:rotate-12 transition-transform duration-1000"></div>
                        
                        {/* Main Image Container */}
                        <div className="relative z-10 aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl shadow-black/10 border-8 border-white group-hover:shadow-primary/20 transition-all duration-700 bg-slate-50">
                           <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/20 to-transparent opacity-80 z-10"></div>
                           {leader.photo ? (
                              <img 
                                 src={getImageUrl(leader.photo)} 
                                 alt={leader.name} 
                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0" 
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                 <Users className="w-24 h-24 text-slate-200" />
                              </div>
                           )}

                           {/* Floating Badge */}
                           <div className="absolute top-6 right-6 w-14 h-14 bg-secondary rounded-2xl shadow-xl z-20 flex items-center justify-center text-primary font-black text-xl rotate-[-12deg] group-hover:rotate-0 transition-transform">
                              {idx + 1}
                           </div>
                        </div>

                        {/* Order Text Floating below */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white px-8 py-3 rounded-2xl shadow-xl border border-gray-100 min-w-[200px]">
                            <span className="text-primary font-black text-[11px] uppercase tracking-[0.3em]">Pengasuh Ke-{leader.sort_order || idx + 1}</span>
                        </div>
                     </div>

                     {/* Text Info */}
                     <div className="mt-8 px-4">
                        <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tighter uppercase leading-tight group-hover:text-primary transition-colors duration-500">{leader.name}</h2>
                        <div className="inline-flex items-center gap-3 text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-gray-50 px-5 py-2 rounded-full border border-gray-100">
                           <History className="w-3.5 h-3.5 text-secondary" /> Masa Jabatan: {leader.period}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Footer Quote Section */}
         <div className="mt-24 md:mt-40 text-center max-w-3xl mx-auto px-4">
            <div className="w-16 md:w-20 h-1 bg-secondary mx-auto mb-8 md:mb-10 rounded-full opacity-30"></div>
            <p className="text-lg md:text-2xl font-bold text-gray-500 italic leading-relaxed font-serif">
               "Masyayikh adalah lentera yang takkan pernah padam cahayanya, meski raganya tak lagi di depan kita, sanad ilmunya terus mengalir menjaga kita."
            </p>
         </div>
      </section>
    </div>
  );
}
