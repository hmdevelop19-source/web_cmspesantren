import { useEffect, useState } from 'react';
import { Megaphone, Search, ChevronRight, Loader2, Calendar, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import type { Announcement, PaginatedResponse } from '../../types';

export default function Announcements() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');

  const { data, isLoading } = useQuery<PaginatedResponse<Announcement>>({
    queryKey: ['public-announcements', page, triggerSearch],
    queryFn: async () => {
      const response = await api.get('/public/announcements', {
        params: { 
          page,
          search: triggerSearch
        }
      });
      return response.data;
    },
  });

  const announcements = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    total: data?.total || 0
  };

  useEffect(() => {
    document.title = 'Pengumuman Resmi - Pesantren CMS';
    window.scrollTo(0, 0);
    return () => { document.title = 'Pesantren CMS'; };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTriggerSearch(searchTerm);
    setPage(1);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header Section */}
      <section className="bg-primary pt-8 pb-16 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="inline-block bg-secondary/20 border border-secondary/30 text-secondary px-6 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] mb-6 shadow-xl shadow-secondary/5">
                Informasi & Pengumuman
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase italic">Warta Pusat Informasi</h1>
            <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed italic">
                Akses semua pemberitahuan resmi, edaran, dan informasi penting bagi seluruh keluarga besar pesantren.
            </p>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="py-12 border-b border-gray-100 bg-gray-50/50 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                    <h2 className="text-lg font-black text-gray-900 leading-none">Daftar Pengumuman</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{pagination.total} Informasi Ditemukan</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
                <div className="relative flex-grow">
                    <input 
                        type="text" 
                        placeholder="Cari kata kunci..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium text-gray-700"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
                <button type="submit" className="bg-primary-dark hover:bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
                    Cari
                </button>
            </form>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-left">
            
            <Breadcrumbs items={[{ label: 'Beranda', path: '/' }, { label: 'Pengumuman' }]} />

            {isLoading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-gray-400 font-black text-xs uppercase tracking-widest animate-pulse">Menghimpun Berita...</p>
                </div>
            ) : announcements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    {announcements.map((item) => (
                        <Link 
                            key={item.id}
                            to={`/pengumuman/${item.slug}`}
                            className="group bg-white border border-gray-100 rounded-[32px] p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl hover:shadow-black/5 transition-all hover:-translate-y-2 relative overflow-hidden"
                        >
                            {/* Icon & Decor */}
                            <div className="shrink-0 flex items-start justify-center">
                                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center transition-all ${item.priority === 'high' ? 'bg-secondary/10 text-secondary border border-secondary/20 shadow-xl shadow-secondary/5' : 'bg-primary/5 text-primary shadow-primary/5'}`}>
                                    <Bell className={`w-8 h-8 ${item.priority === 'high' ? 'animate-bounce' : ''}`} />
                                </div>
                            </div>

                            {/* Content Block */}
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <Calendar className="w-3 h-3 text-secondary" /> {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </div>
                                    {item.priority === 'high' && (
                                        <span className="text-[9px] font-black text-primary-dark uppercase tracking-widest bg-secondary/15 px-3 py-1.5 rounded-full border border-secondary/20 italic">Penting</span>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors italic uppercase tracking-tighter">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium">
                                    {item.content ? item.content.replace(/<[^>]*>?/gm, '') : 'Informasi resmi dari pihak pesantren untuk seluruh santri.'}
                                </p>
                            </div>

                            {/* Action Block - Decorative Arrow */}
                            <div className="hidden md:flex shrink-0 items-center">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-45">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Priority Decor */}
                            <div className={`absolute top-0 right-0 w-2 h-full transition-opacity ${item.priority === 'high' ? 'bg-secondary opacity-40' : 'bg-primary opacity-0 group-hover:opacity-10'}`}></div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-40 text-center space-y-6">
                    <Megaphone className="w-20 h-20 text-gray-100 mx-auto" />
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-400 uppercase italic tracking-tighter">Belum Ada Pengumuman</h3>
                        <p className="text-sm text-gray-400 font-medium italic">Silakan periksa kembali nanti untuk pembaruan resmi dari pesantren.</p>
                    </div>
                </div>
            )}

            {/* Pagination Section */}
            {pagination.last_page > 1 && (
                <div className="mt-20 flex justify-center items-center gap-3">
                    {[...Array(pagination.last_page)].map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${pagination.current_page === i + 1 ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
      </section>
    </div>
  );
}
