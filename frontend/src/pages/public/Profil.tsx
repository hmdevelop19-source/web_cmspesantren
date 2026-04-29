import { Target, Users, BookOpen, Loader2, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { useSettingsStore } from '../../store/settingsStore';
import { getImageUrl } from '../../lib/utils';

export default function Profil() {
   const [sejarah, setSejarah] = useState<any>(null);
   const [visiMisi, setVisiMisi] = useState<any>(null);
   const [misiStrategis, setMisiStrategis] = useState<any>(null);
   const [leaders, setLeaders] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const { settings } = useSettingsStore();
   const siteName = settings?.site_name || 'Portal Pesantren';

   useSeoMeta({
      title: `Profil Lembaga — ${siteName}`,
      description: settings?.site_description || `Mengenal lebih dekat sejarah, visi, misi, dan nilai-nilai unggulan ${siteName}.`,
      type: 'website',
      siteName,
      keywords: `profil pesantren, sejarah, visi misi, ${siteName}`,
   });

   useEffect(() => {
      const fetchPages = async () => {
         try {
            const [sejRes, vmRes, misiRes, leadersRes] = await Promise.all([
               api.get('/public/pages/sejarah').catch(() => ({ data: null })),
               api.get('/public/pages/visi-misi').catch(() => ({ data: null })),
               api.get('/public/pages/misi-strategis').catch(() => ({ data: null })),
               api.get('/public/leaders').catch(() => ({ data: [] }))
            ]);
            setSejarah(sejRes.data);
            setVisiMisi(vmRes.data);
            setMisiStrategis(misiRes.data);
            setLeaders(Array.isArray(leadersRes.data) ? leadersRes.data : []);
         } catch (error) {
            console.error('Error fetching profil pages:', error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchPages();
      window.scrollTo(0, 0);
   }, []);

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 bg-white">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">Menyusun Profil...</p>
         </div>
      );
   }

   return (
      <div className="bg-white w-full pb-32">
         {/* Page Header (Hero Profil) */}
         <section className="bg-primary pt-28 pb-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
               <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter uppercase drop-shadow-2xl">Jejak & Visi</h1>
               <p className="text-gray-200 max-w-2xl mx-auto text-sm md:text-lg font-medium opacity-80 italic italic">
                  Mengenal lebih dekat seputar sejarah, visi yang kami kejar, serta misi teguh kami dalam menciptakan ekosistem pendidikan yang unggul.
               </p>
            </div>
            {/* Decorative Bottom Wave/Slant */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
         </section>

         {/* Main Content Area */}
         <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">

            <div className="mb-8">
               <Breadcrumbs items={[{ label: 'Profil Lembaga' }]} />
            </div>

            {/* Sejarah Singkat */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden mb-24">
               <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 p-12 md:p-20 flex flex-col justify-center">
                     <div className="inline-flex items-center gap-3 text-secondary font-black text-[10px] tracking-[0.3em] uppercase mb-8">
                        <BookOpen className="w-5 h-5" /> Sejarah Institusi
                     </div>
                     <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter leading-tight">
                        {sejarah?.title || 'Pusat Pendidikan & Penelitian Peradaban Umat'}
                     </h2>
                     <div className="prose prose-sm max-w-none text-gray-500 leading-relaxed mb-10 font-medium line-clamp-4">
                        {sejarah?.content ? (
                           <div dangerouslySetInnerHTML={{ __html: sejarah.content }} />
                        ) : (
                           <p>
                              Didirikan sejak puluhan tahun yang lalu, eksistensi institusi ini berangkat dari keyakinan kuat bahwa pendidikan agama dan penerapan IPTEK modern tidak boleh terpisah.
                              Kami didedikasikan untuk menjembatani kearifan ajaran klasik dalam merespon berbagai tantangan global yang berkembang secara dinamis.
                           </p>
                        )}
                     </div>
                     <div>
                        <Link
                           to="/profil/sejarah"
                           className="inline-flex items-center gap-3 font-black text-[11px] uppercase tracking-widest text-primary hover:text-primary-dark transition-all group"
                        >
                           Timeline Perjalanan <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform text-secondary" />
                        </Link>
                     </div>
                  </div>
                  <div className="md:w-1/2 bg-gray-50 relative min-h-[400px] overflow-hidden group">
                     <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
                     {sejarah?.image_url ? (
                        <img
                           src={sejarah.image_url}
                           alt={sejarah.title}
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <div className="text-center group-hover:scale-110 transition-transform duration-700">
                              <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-4 text-primary/10">
                                 <BookOpen className="w-10 h-10" />
                              </div>
                              <span className="text-[10px] font-black tracking-widest text-gray-300 uppercase">Legacy Gallery</span>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Visi & Misi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
               {/* Visi (Dark Green Card) */}
               <div className="bg-primary-dark text-white rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden shadow-2xl shadow-primary/20 border border-white/5 group">
                  <div className="absolute -right-20 -top-20 text-white opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                     <Target className="w-80 h-80" />
                  </div>
                  <div className="relative z-10">
                     <div className="w-16 h-16 bg-secondary rounded-2xl mb-10 flex items-center justify-center shadow-xl shadow-secondary/20">
                        <Target className="w-9 h-9 text-primary-dark" />
                     </div>
                     <h2 className="text-2xl font-black mb-8 uppercase tracking-[0.2em] border-l-8 border-secondary pl-6">Visi Utama</h2>
                     <div className="text-xl md:text-2xl text-gray-200 leading-relaxed font-bold tracking-tight italic opacity-90">
                        {visiMisi?.content ? (
                           <div dangerouslySetInnerHTML={{ __html: visiMisi.content }} className="prose-invert" />
                        ) : (
                           '"Menjadi pusat penelitian dan pengabdian institusi terkemuka di tingkat nasional dan Asia Tenggara yang berwawasan Islam Ahlussunnah wal Jama\'ah dalam melestarikan IPTEKS demi kemaslahatan umat menuju peradaban dunia."'
                        )}
                     </div>
                  </div>
               </div>

               {/* Misi (White Card) */}
               <div className="bg-white rounded-[2.5rem] p-12 md:p-16 shadow-2xl shadow-black/5 border border-gray-100 relative">
                  <div className="w-16 h-16 bg-primary/5 rounded-2xl mb-10 flex items-center justify-center border border-gray-100 shadow-inner">
                     <Compass className="w-9 h-9 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black mb-10 text-gray-900 border-l-8 border-primary pl-6 uppercase tracking-[0.2em]">Misi Strategis</h2>
                  {misiStrategis?.content ? (
                     <div dangerouslySetInnerHTML={{ __html: misiStrategis.content }} className="prose prose-sm text-gray-500 max-w-none" />
                  ) : (
                     <ul className="space-y-6">
                        {[
                           'Mendorong pelaksanaan riset fundamental berbasis nilai Islami yang diakui secara global.',
                           'Menyelenggarakan tata kelola lembaga secara transparan, partisipatif dan dinamis.',
                           'Melaksanakan pengabdian kepada masyarakat secara holistik untuk pengentasan kemiskinan dan ketahanan keluarga.',
                           'Mengembangkan sinergitas internal dan jaringan berkelanjutan di tingkat lokal, nasional dan global.'
                        ].map((misi, i) => (
                           <li key={i} className="flex gap-6 group">
                              <div className="shrink-0 mt-1">
                                 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-secondary group-hover:border-secondary transition-all">
                                    <ShieldCheck className="w-5 h-5 text-secondary group-hover:text-black transition-colors" />
                                 </div>
                              </div>
                              <span className="text-gray-500 font-bold leading-relaxed text-sm md:text-base group-hover:text-gray-900 transition-colors uppercase tracking-tight">{misi}</span>
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
            </div>

            {/* Silsilah Pengasuh (Masa ke Masa) */}
            {leaders.length > 0 && (
               <div className="py-24 border-t border-gray-100">
                  <div className="text-center mb-20">
                     <div className="inline-block bg-secondary/10 border border-secondary/20 text-secondary px-6 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.4em] mb-6 shadow-xl shadow-secondary/5">
                        Masa ke Masa
                     </div>
                     <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tighter uppercase italic leading-none">Silsilah Pengasuh</h2>
                     <p className="text-gray-400 text-sm font-medium italic max-w-xl mx-auto mb-10">Mengenang jasa dan perjuangan para Masyayikh yang telah mendedikasikan hidupnya demi perkembangan Pesantren.</p>
                     <Link 
                        to="/silsilah-pengasuh"
                        className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 group"
                     >
                        Lihat Silsilah Lengkap <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform text-secondary" />
                     </Link>
                  </div>

                  {/* Carousel Container: Scroll on Mobile, Grid on Desktop */}
                  <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 snap-x snap-mandatory scrollbar-hide">
                     {leaders.map((leader, idx) => (
                        <div key={leader.id} className="group relative min-w-[280px] sm:min-w-0 snap-center">
                           <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10 border-4 border-white group-hover:shadow-primary/20 transition-all duration-700 bg-slate-50">
                              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/20 to-transparent opacity-80 z-10"></div>
                              {leader.photo ? (
                                 <img
                                    src={getImageUrl(leader.photo)}
                                    alt={leader.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center">
                                    <Users className="w-20 h-20 text-slate-200" />
                                 </div>
                              )}

                              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                 <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight mb-3">{leader.name}</h3>
                                 <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                       <span className="text-white/70 font-bold text-[10px] uppercase tracking-widest">{leader.period}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <span className="text-secondary font-black text-[11px] uppercase tracking-[0.2em]">Pengasuh Ke-{leader.sort_order || idx + 1}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </section>
      </div>
   );
}
