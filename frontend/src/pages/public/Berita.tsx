import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import api from '../../lib/api';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { useSettingsStore } from '../../store/settingsStore';

export default function Berita() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [meta, setMeta] = useState<any>(null);
  const { settings } = useSettingsStore();
  const siteName = settings?.site_name || 'Portal Pesantren';

  useSeoMeta({
    title: `Warta & Berita Terkini — ${siteName}`,
    description: `Ikuti kabar terbaru, prestasi santri, dan aktivitas kegiatan di lingkungan ${siteName}.`,
    type: 'website',
    siteName,
    keywords: `berita pesantren, warta, kabar, ${siteName}`,
  });

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8000${path}`;
  };

  const fetchPosts = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get('/public/posts', {
        params: {
          search: searchTerm,
          page: page,
          category: searchParams.get('category')
        }
      });
      setPosts(response.data.data);
      setMeta(response.data);
    } catch (error) {
      console.error('Error fetching public posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    window.scrollTo(0, 0);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ ...Object.fromEntries(searchParams), search: searchTerm, page: '1' });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="bg-primary pt-8 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block bg-secondary/20 border border-secondary/30 text-secondary px-6 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] mb-6 shadow-xl shadow-secondary/5">
                Kabar Pesantren
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase italic">Warta & Kabar Terkini</h1>
          <p className="text-gray-200 text-sm md:text-base font-medium max-w-2xl mx-auto opacity-80 italic leading-relaxed">Ikuti perkembangan terbaru, prestasi santri, dan aktivitas edukasi di lingkungan Pesantren Kami.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-[32px] shadow-2xl shadow-primary/20 border border-gray-100 flex flex-col md:flex-row gap-4">
           <div className="flex-1 relative text-left">
              <input 
                type="text" 
                placeholder="Cari kata kunci berita..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary text-sm font-bold placeholder:text-gray-400"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
           </div>
           <button type="submit" className="bg-primary text-secondary font-black px-10 py-4 rounded-2xl hover:bg-primary-dark transition-all text-sm uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95">
              Klik Cari Berita
           </button>
        </form>
      </div>

      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'Berita & Artikel' }]} />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="w-12 h-12 animate-spin text-primary" />
             <p className="text-xs font-black uppercase tracking-widest text-gray-400">Menghimpun Data...</p>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-[32px] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col">
                  <div className="h-56 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {post.cover_image ? (
                        <img src={getImageUrl(post.cover_image)} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                        <div className="text-primary/10 opacity-30"><BookOpen className="w-20 h-20" /></div>
                    )}
                    <span className="bg-secondary text-primary text-[9px] font-black px-4 py-2 absolute top-4 left-4 rounded-lg uppercase z-10 shadow-lg tracking-widest">
                       {post.category?.name || 'UMUM'}
                    </span>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-[11px] font-black text-gray-400 mb-5 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-secondary" /> {new Date(post.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-secondary" /> {post.user?.name || 'Admin'}</div>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-4 line-clamp-2 group-hover:text-primary transition-colors leading-tight tracking-tighter uppercase italic">{post.title}</h3>
                    <p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed font-medium italic">{post.excerpt || 'Klik untuk membaca detail selengkapnya mengenai berita ini dari sumber terpercaya...'}</p>
                    <div className="mt-auto pt-6 border-t border-gray-50">
                        <Link to={`/berita/${post.slug}`} className="text-[11px] font-black text-primary hover:text-primary-dark uppercase tracking-widest flex items-center gap-2 group/more">
                            BACA SELENGKAPNYA 
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="mt-20 flex justify-center gap-3">
                 {Array.from({ length: meta.last_page }).map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => fetchPosts(i + 1)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${meta.current_page === i + 1 ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                 ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 px-8 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
             <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                <Search className="w-8 h-8 text-gray-200" />
             </div>
             <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Tidak ada berita ditemukan untuk kata kunci <span className="text-primary italic">"{searchTerm}"</span></p>
             <button onClick={() => { setSearchTerm(''); setSearchParams({}); }} className="mt-6 text-primary font-black text-[11px] uppercase border-b-2 border-primary pb-1 hover:text-secondary hover:border-secondary transition-all">Reset Pencarian</button>
          </div>
        )}
      </div>
    </div>
  );
}
