import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Breadcrumbs from '../../components/Breadcrumbs';
import api from '../../lib/api';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { useSettingsStore } from '../../store/settingsStore';
import Skeleton from '../../components/ui/Skeleton';
import OptimizedImage from '../../components/ui/OptimizedImage';
import type { Post, PaginatedResponse } from '../../types';
import { getImageUrl } from '../../lib/utils';

export default function Berita() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const { settings } = useSettingsStore();
  const siteName = settings?.site_name || 'Portal Pesantren';

  const location = useLocation();
  const isNews = location.pathname.startsWith('/news-pesantren');
  const isArtikel = location.pathname.startsWith('/artikel');
  const isKajian = location.pathname.startsWith('/kajian');

  const pageTitle = isNews ? 'News Pesantren' : isArtikel ? 'Kumpulan Artikel' : isKajian ? 'Kajian Keislaman' : 'Publikasi Pesantren';
  const pageSubtitle = isNews
    ? `Ikuti kabar terbaru, prestasi santri, dan aktivitas kegiatan di lingkungan ${siteName}.`
    : isArtikel
      ? 'Temukan berbagai tulisan inspiratif dan wawasan bermanfaat dari para pengajar dan santri.'
      : isKajian
        ? 'Materi kajian keagamaan, tafsir, dan fiqh untuk memperdalam pemahaman keislaman.'
        : 'Berbagai publikasi dan informasi terbaru dari kami.';

  useSeoMeta({
    title: `${pageTitle} — ${siteName}`,
    description: pageSubtitle,
    type: 'website',
    siteName,
    keywords: `berita pesantren, artikel, kajian, ${siteName}`,
  });

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse<Post>>({
    queryKey: ['public-posts', location.pathname, page, searchParams.get('search'), searchParams.get('category')],
    queryFn: async () => {
      const categoryFromUrl = searchParams.get('category');

      // Default category mapping based on path
      let defaultCategory = null;
      if (isNews) defaultCategory = 'news-pesantren';
      else if (isArtikel) defaultCategory = 'artikel';
      else if (isKajian) defaultCategory = 'kajian';

      const categoryToFilter = categoryFromUrl || defaultCategory;

      const response = await api.get('/public/posts', {
        params: {
          search: searchParams.get('search'),
          page: page,
          category: categoryToFilter
        }
      });
      return response.data;
    },
    retry: 1,
  });

  const posts = data?.data || [];
  const meta = data;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ ...Object.fromEntries(searchParams), search: searchTerm, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: newPage.toString() });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="bg-primary pt-28 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block bg-secondary/20 border border-secondary/30 text-secondary px-6 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] mb-6 shadow-xl shadow-secondary/5">
            {isArtikel ? 'Literasi Pesantren' : isKajian ? 'Khazanah Keilmuan' : 'Kabar Pesantren'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase italic">{pageTitle}</h1>
          <p className="text-gray-200 text-sm md:text-base font-medium max-w-2xl mx-auto opacity-80 italic leading-relaxed">{pageSubtitle}</p>
        </div>
      </div>

      {/* Search Bar Only */}
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

        <Breadcrumbs items={[{ label: pageTitle }]} />

        {isError ? (
          <div className="py-24 text-center">
            <div className="bg-red-50 text-red-500 p-8 rounded-[40px] border border-red-100 max-w-xl mx-auto">
              <h3 className="font-black uppercase tracking-tighter text-xl mb-2">Gagal Memuat Berita</h3>
              <p className="text-sm font-medium italic opacity-70 mb-6">Terjadi kendala saat menghubungkan ke server. Silakan coba sesaat lagi.</p>
              <button
                onClick={() => refetch()}
                className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 active:scale-95"
              >
                Coba Lagi Sekarang
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden p-0">
                <Skeleton height="14rem" className="w-full" />
                <div className="p-8 space-y-4">
                  <div className="flex gap-4">
                    <Skeleton width="40%" height="1rem" />
                    <Skeleton width="30%" height="1rem" />
                  </div>
                  <Skeleton height="2rem" width="90%" />
                  <Skeleton height="1rem" />
                  <Skeleton height="1rem" />
                  <Skeleton height="1rem" width="60%" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 pb-8 px-4 -mx-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:mx-0 md:px-0 md:gap-10">
              {posts.map((post) => (
                <div key={post.id} className="flex-none w-[85vw] md:w-auto snap-center bg-white rounded-[32px] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col">
                  <div className="h-56 relative group">
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
                      <div className="h-full w-full bg-gray-50 flex items-center justify-center text-primary/10 opacity-30"><BookOpen className="w-20 h-20" /></div>
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
                      <Link to={`/news-pesantren/${post.slug}`} className="text-[11px] font-black text-primary hover:text-primary-dark uppercase tracking-widest flex items-center gap-2 group/more">
                        BACA SELENGKAPNYA
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && (meta.last_page ?? 0) > 1 && (
              <div className="mt-20 flex justify-center gap-3">
                {Array.from({ length: meta.last_page ?? 0 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
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
