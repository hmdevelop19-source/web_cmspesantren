import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Calendar, ArrowRight, BookOpen, LayoutGrid } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Breadcrumbs from '../../components/Breadcrumbs';
import api from '../../lib/api';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { useSettingsStore } from '../../store/settingsStore';
import Skeleton from '../../components/ui/Skeleton';
import OptimizedImage from '../../components/ui/OptimizedImage';
import type { Post, PaginatedResponse } from '../../types';
import { getImageUrl } from '../../lib/utils';

export default function Publications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const activeCategory = searchParams.get('category') || '';
  
  const { settings } = useSettingsStore();
  const siteName = settings?.site_name || 'Portal Pesantren';

  useSeoMeta({
    title: `Publikasi & Arsip — ${siteName}`,
    description: 'Jelajahi seluruh kumpulan berita, artikel, dan kajian keislaman dari berbagai kategori.',
    type: 'website',
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const response = await api.get('/public/categories');
      return response.data;
    },
  });

  // Fetch Posts with Filter
  const { data, isLoading, isError } = useQuery<PaginatedResponse<Post>>({
    queryKey: ['publications', page, activeCategory, searchParams.get('search')],
    queryFn: async () => {
      const response = await api.get('/public/posts', {
        params: {
          search: searchParams.get('search'),
          page: page,
          category: activeCategory
        }
      });
      return response.data;
    },
    retry: 1,
  });

  const posts = data?.data || [];
  const meta = data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ ...Object.fromEntries(searchParams), search: searchTerm, page: '1' });
  };

  const setCategory = (slug: string) => {
    setSearchParams({ ...Object.fromEntries(searchParams), category: slug, page: '1' });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="bg-primary pt-28 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block bg-secondary/20 border border-secondary/30 text-secondary px-6 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] mb-6 shadow-xl shadow-secondary/5">
             Pusat Informasi & Literasi
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">
            JELAJAHI <span className="text-secondary">PUBLIKASI</span>
          </h1>
          <p className="text-gray-200 text-sm md:text-lg font-medium max-w-2xl mx-auto opacity-80 italic leading-relaxed">
            Temukan seluruh dokumentasi kegiatan, pemikiran, dan kajian dari berbagai kategori pilihan.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
         {/* Search & Filter Container Sesuai Gambar */}
         <div className="mb-20">
            <form onSubmit={handleSearch} className="bg-white p-3 rounded-[3rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto mb-10 border border-gray-50">
               <div className="flex-1 relative w-full">
                  <Search className="w-6 h-6 text-gray-300 absolute left-6 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Cari kata kunci berita..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50/50 pl-16 pr-6 py-5 rounded-full border-none focus:ring-0 text-sm font-bold text-gray-600 placeholder:text-gray-300"
                  />
               </div>
               <button type="submit" className="w-full md:w-auto bg-[#2D5A48] text-secondary font-black px-10 py-5 rounded-[2.5rem] hover:bg-[#234537] transition-all text-[11px] uppercase tracking-widest shadow-lg active:scale-95 whitespace-nowrap">
                  KLIK CARI BERITA
               </button>
            </form>

            <div className="pt-4">
               <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-6 px-4 -mx-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center snap-x snap-mandatory">
                  <div className="flex-none snap-center">
                    <button
                      onClick={() => setCategory('')}
                      className={`px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${
                        !activeCategory 
                          ? 'bg-secondary text-[#2D5A48] shadow-[0_10px_25px_-5px_rgba(252,213,38,0.6)] scale-105' 
                          : 'bg-white text-gray-400 hover:text-primary hover:shadow-md'
                      }`}
                    >
                      SEMUA
                    </button>
                  </div>
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex-none snap-center">
                      <button
                        onClick={() => setCategory(cat.slug)}
                        className={`px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${
                          activeCategory === cat.slug
                            ? 'bg-secondary text-[#2D5A48] shadow-[0_10px_25px_-5px_rgba(252,213,38,0.6)] scale-105'
                            : 'bg-white text-gray-400 hover:text-primary hover:shadow-md'
                        }`}
                      >
                        {cat.name.toUpperCase()}
                      </button>
                    </div>
                  ))}
               </div>
            </div>
         </div>

        <Breadcrumbs items={[{ label: 'Publikasi & Arsip' }]} />

        {isError ? (
           <div className="py-24 text-center">
              <p className="text-red-500 font-bold uppercase tracking-widest">Gagal memuat data publikasi.</p>
           </div>
        ) : isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => <Skeleton key={i} height="400px" className="rounded-[2.5rem]" />)}
           </div>
        ) : posts.length > 0 ? (
          <>
            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 pb-8 px-4 -mx-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:mx-0 md:px-0 md:gap-10 py-10">
              {posts.map((post) => (
                <div key={post.id} className="flex-none w-[85vw] md:w-auto snap-center bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full">
                  <div className="h-56 relative group overflow-hidden">
                    {post.cover_image_obj ? (
                      <OptimizedImage 
                        src={getImageUrl(post.cover_image_obj.file_path)} 
                        alt={post.title} 
                        aspectRatio="h-full w-full"
                      />
                    ) : post.cover_image ? (
                      <OptimizedImage 
                        src={getImageUrl(post.cover_image)} 
                        alt={post.title} 
                        aspectRatio="h-full w-full"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-50 flex items-center justify-center text-primary/10 opacity-30"><BookOpen className="w-16 h-16" /></div>
                    )}
                    <div className="absolute top-4 left-4">
                       <span className="bg-secondary text-primary text-[9px] font-black px-4 py-2 rounded-xl uppercase shadow-lg tracking-widest">
                          {post.category?.name || 'UMUM'}
                       </span>
                    </div>
                  </div>
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">
                        <Calendar className="w-3.5 h-3.5 text-secondary" />
                        {new Date(post.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-4 line-clamp-2 group-hover:text-primary transition-colors leading-tight tracking-tighter uppercase italic">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-10 line-clamp-3 leading-relaxed font-medium italic opacity-70">
                      {post.excerpt || 'Klik baca selengkapnya untuk mendapatkan informasi detail mengenai publikasi ini...'}
                    </p>
                    <div className="mt-auto pt-6 border-t border-gray-50 text-left">
                        <Link to={`/news-pesantren/${post.slug}`} className="text-[11px] font-black text-primary hover:text-primary-dark uppercase tracking-widest flex items-center gap-2 group/more">
                            BACA DETAIL 
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && (meta.last_page ?? 0) > 1 && (
              <div className="mt-16 flex justify-center gap-3 pb-24">
                 {Array.from({ length: meta.last_page ?? 0 }).map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: (i + 1).toString() })}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${meta.current_page === i + 1 ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                 ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 mb-24">
             <LayoutGrid className="w-16 h-16 text-gray-200 mx-auto mb-6" />
             <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Belum ada publikasi di kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
