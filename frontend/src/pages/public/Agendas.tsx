import { useEffect, useState } from 'react';
import { Calendar, MapPin, Search, ChevronRight, Loader2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import type { Agenda, PaginatedResponse } from '../../types';

export default function Agendas() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');

  const { data, isLoading } = useQuery<PaginatedResponse<Agenda>>({
    queryKey: ['public-agendas', page, triggerSearch],
    queryFn: async () => {
      const response = await api.get('/public/agendas', {
        params: { 
          page,
          search: triggerSearch
        }
      });
      return response.data;
    },
  });

  const agendas = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    total: data?.total || 0
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Kalender Kegiatan - Pesantren CMS';
    return () => { document.title = 'Pesantren CMS'; };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTriggerSearch(searchTerm);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header Section */}
      <section className="bg-primary pt-24 md:pt-28 pb-12 md:pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center py-4 md:py-0">
            <div className="inline-block bg-secondary/20 border border-secondary/30 text-secondary px-6 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] mb-6 animate-fade-in">
                Kalender Kegiatan
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase italic">Agenda Pesantren</h1>
            <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed italic">
                Ikuti berbagai rangkaian kegiatan, pengajian, dan acara penting di lingkungan Pondok Pesantren kami.
            </p>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="py-12 border-b border-gray-100 bg-gray-50/50 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-none uppercase italic tracking-tighter">Daftar Agenda</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{pagination.total} Kegiatan Ditemukan</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
                <div className="relative flex-grow">
                    <input 
                        type="text" 
                        placeholder="Cari kegiatan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium text-gray-700"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95">
                    Cari
                </button>
            </form>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-20 px-4 text-left">
        <div className="max-w-7xl mx-auto">
            
            <Breadcrumbs items={[{ label: 'Agenda & Kegiatan' }]} />

            {isLoading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-gray-400 font-black text-xs uppercase tracking-widest animate-pulse">Menghimpun Jadwal...</p>
                </div>
            ) : agendas.length > 0 ? (
                <div className="space-y-8">
                        <Link 
                            key={item.id}
                            to={`/agenda/${item.slug}`}
                            className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 group hover:shadow-2xl hover:shadow-black/5 transition-all hover:-translate-y-1 relative overflow-hidden text-left"
                        >
                            {/* Date Block */}
                            <div className="w-full md:w-32 flex flex-col items-center justify-center shrink-0 border-r-0 md:border-r border-gray-100 pr-0 md:pr-8 py-2">
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-1">
                                    {new Date(item.event_date).toLocaleDateString('id-ID', { month: 'short' })}
                                </span>
                                <span className="text-5xl font-black text-primary group-hover:scale-110 transition-transform">
                                    {new Date(item.event_date).toLocaleDateString('id-ID', { day: '2-digit' })}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                    {new Date(item.event_date).getFullYear()}
                                </span>
                            </div>

                            {/* Content Block */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <Clock className="w-3 h-3 text-secondary" /> {new Date(item.event_date).toLocaleDateString('id-ID', { weekday: 'long' })}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <MapPin className="w-3 h-3 text-primary" /> {item.location || 'Tempat Ditentukan'}
                                    </div>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors italic uppercase">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
                                    {item.content ? item.content.replace(/<[^>]*>?/gm, '').substring(0, 150) : 'Informasi lebih lanjut silakan klik tombol selengkapnya untuk detail acara.'}...
                                </p>
                            </div>

                            {/* Action Block */}
                            <div className="shrink-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-45 shadow-inner">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-2 h-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-40 text-center space-y-6">
                    <Calendar className="w-20 h-20 text-gray-100 mx-auto" />
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-400">Belum Ada Agenda</h3>
                        <p className="text-sm text-gray-400 font-medium italic">Silakan periksa kembali nanti untuk pembaruan kegiatan pesantren kami.</p>
                    </div>
                </div>
            )}

            {/* Pagination Section */}
            {(pagination.last_page ?? 0) > 1 && (
                <div className="mt-20 flex justify-center gap-3">
                    {[...Array(pagination.last_page ?? 0)].map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${pagination.current_page === i + 1 ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'}`}
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
