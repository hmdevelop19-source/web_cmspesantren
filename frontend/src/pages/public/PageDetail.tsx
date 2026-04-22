import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Calendar, BookOpen } from 'lucide-react';
import api from '../../lib/api';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useSettingsStore } from '../../store/settingsStore';
import { getImageUrl } from '../../lib/utils';
import SEO from '../../components/SEO';

export default function PageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings) fetchSettings();
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/public/pages/${slug}`);
        setPage(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Halaman tidak ditemukan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">Memuat Detail Profil...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-4">{error}</h2>
        <Link to="/profil" className="text-primary font-bold hover:underline flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Profil
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      <SEO 
        title={page.title}
        description={page.content?.replace(/<[^>]+>/g, '').slice(0, 160)}
        image={page.image_url}
        type="article"
      />
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end pb-20 overflow-hidden bg-primary">
        {page.image_url ? (
          <>
            <img 
              src={page.image_url} 
              alt={page.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-primary-dark">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
           <div className="inline-flex items-center gap-3 text-secondary font-black text-[10px] tracking-[0.3em] uppercase mb-6 bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <BookOpen className="w-4 h-4" /> Detail Profil
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-2xl max-w-4xl leading-none">
              {page.title}
           </h1>
        </div>
      </section>

      {/* Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-16 border border-gray-100 flex flex-col md:flex-row gap-16">
          
          {/* Main Column */}
          <div className="flex-1">
            <div className="mb-12">
               <Breadcrumbs items={[
                  { label: 'Profil Lembaga', path: '/profil' },
                  { label: page.title }
               ]} />
            </div>

            <article className="prose prose-lg prose-primary max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-3xl prose-img:shadow-2xl">
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </article>

            <div className="mt-20 pt-10 border-t border-gray-100 flex items-center justify-between">
               <Link to="/profil" className="group flex items-center gap-4 text-gray-400 hover:text-primary transition-colors">
                  <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
                     <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">Kembali ke Profil</span>
               </Link>
               
               <div className="flex items-center gap-6 text-gray-300">
                  <div className="flex items-center gap-2">
                     <Calendar className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-tighter">Diperbarui {new Date(page.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Area (Secondary Info) */}
          <div className="md:w-80 shrink-0">
             <div className="sticky top-24 space-y-8">
                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                   <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-2 h-6 bg-secondary rounded-full"></div>
                      Tentang Kami
                   </h3>
                   <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      Lembaga ini didedikasikan untuk keunggulan akademik dan spiritual, membekali generasi masa depan dengan karakter yang kuat dan pengetahuan yang luas.
                   </p>
                </div>

                <div className="relative rounded-[2rem] overflow-hidden group">
                   <img 
                     src={settings?.sidebar_banner_image?.startsWith('http') ? settings.sidebar_banner_image : (settings?.sidebar_banner_image ? getImageUrl(settings.sidebar_banner_image) : "https://images.unsplash.com/photo-1541339907198-e08759dfc3f0?auto=format&fit=crop&q=80&w=800")} 
                     alt="Promo" 
                     className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-80"></div>
                   <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <span className="text-secondary font-black text-[10px] tracking-widest uppercase mb-2">
                         {settings?.sidebar_banner_label || "Heritage V3"}
                      </span>
                      <h4 className="text-white font-black text-xl leading-tight uppercase">
                         {settings?.sidebar_banner_title || "Membangun Masa Depan Berbasis Tradisi"}
                      </h4>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
}
