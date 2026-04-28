import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Megaphone, Calendar, Clock, ChevronLeft, Share2, Printer, Loader2, Bell, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Breadcrumbs from '../../components/Breadcrumbs';
import api from '../../lib/api';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { useSettingsStore } from '../../store/settingsStore';
import type { Announcement } from '../../types';

export default function AnnouncementDetail() {
  const { slug } = useParams();
  const { settings } = useSettingsStore();
  const siteName = settings?.site_name || 'Portal Pesantren';

  const { data: announcement, isLoading, error } = useQuery<Announcement>({
    queryKey: ['public-announcement', slug],
    queryFn: async () => {
      const response = await api.get(`/public/announcements/${slug}`);
      return response.data;
    },
  });

  // ── Inject SEO + OpenGraph meta for this announcement ────────
  useSeoMeta({
    title: announcement ? `${announcement.title} — ${siteName}` : siteName,
    description: announcement?.content
      ? announcement.content.replace(/<[^>]+>/g, '').slice(0, 160)
      : 'Pengumuman resmi dari pesantren kami.',
    type: 'article',
    siteName,
    keywords: `pengumuman pesantren, ${siteName}`,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-gray-50">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <p className="text-gray-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Menghimpun Informasi...</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 bg-gray-50 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-primary/5 text-primary rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-primary/10 rotate-12 transition-all">
            <Megaphone className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter italic uppercase text-center">Pengumuman Tidak Ditemukan</h1>
        <p className="text-gray-500 max-w-md mb-10 font-medium italic text-center text-sm leading-relaxed">Informasi yang Anda cari mungkin telah berkalu atau dihapus oleh administrator.</p>
        <Link to="/pengumuman" className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95">
          Lihat Semua Pengumuman
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header Section */}
      <section className={`pt-8 pb-32 px-4 relative overflow-hidden transition-colors duration-500 text-left ${announcement.priority === 'high' ? 'bg-primary-dark' : 'bg-primary'}`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: 'Beranda', path: '/' },
                    { label: 'Pengumuman', path: '/pengumuman' },
                    { label: announcement.title }
                ]} className="text-white/60" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 animate-fade-in">
                <Link to="/pengumuman" className="inline-flex items-center gap-3 text-white/60 hover:text-white font-bold text-xs uppercase tracking-widest group transition-all">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 border border-white/10 group-hover:translate-x-[-4px] transition-all">
                      <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span>Berita & Pengumuman</span>
                </Link>
                <div className="flex gap-4">
                    <button onClick={() => window.print()} className="p-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                        <Printer className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl space-y-4">
                <div className={`inline-flex items-center gap-2 font-black text-[10px] uppercase px-5 py-2 rounded-full tracking-[0.2em] shadow-xl ${announcement.priority === 'high' ? 'bg-secondary text-primary shadow-secondary/10' : 'bg-primary-light text-white shadow-primary-light/20'}`}>
                    {announcement.priority === 'high' ? <AlertTriangle className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                    {announcement.priority === 'high' ? 'Pemberitahuan Penting' : 'Pengumuman Resmi'}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter uppercase italic drop-shadow-2xl">
                    {announcement.title}
                </h1>
            </div>
        </div>
        
        {/* Slant Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-white clip-path-slant-up"></div>
      </section>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 pb-40">
        <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Column: Sidebar Info */}
            <div className="lg:w-1/3 order-2 lg:order-1">
                <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 flex flex-col gap-10 sticky top-32 group text-left">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                        <Bell className="w-40 h-40" />
                    </div>
                    
                    <div className="space-y-8 relative z-10">
                        {/* Publication Date */}
                        <div className="flex items-start gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shrink-0 ${announcement.priority === 'high' ? 'bg-secondary/10 text-secondary border border-secondary/20 font-bold' : 'bg-primary/5 text-primary shadow-primary/10'}`}>
                                <Calendar className="w-6 h-6 text-current" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Tanggal Rilis</p>
                                <p className="text-lg font-black text-gray-800 leading-tight">
                                    {new Date(announcement.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Status / Category */}
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Waktu Berlaku</p>
                                <p className="text-lg font-black text-gray-800 leading-tight italic uppercase tracking-tighter">Hingga Informatif</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400 italic">Pusat Data & Informasi Pesantren</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Main Content */}
            <div className="lg:w-2/3 order-1 lg:order-2 text-left">
                <div className="bg-white rounded-[40px] p-8 md:p-16 border border-gray-100 shadow-sm min-h-[600px] relative overflow-hidden group">
                    <div className="prose prose-lg prose-primary max-w-none">
                        <h2 className="text-3xl font-black text-gray-900 mb-10 border-b-8 border-secondary pb-4 inline-block italic uppercase tracking-tighter">
                            Rincian Pengumuman
                        </h2>
                        <div className="text-gray-700 leading-relaxed font-serif text-lg md:text-xl italic">
                            {announcement.content ? (
                                <div dangerouslySetInnerHTML={{ __html: announcement.content }} />
                            ) : (
                                <p className="text-gray-400">Pemberitahuan resmi ini sedang dalam tahap diseminasi oleh sekretariat pesantren.</p>
                            )}
                        </div>
                    </div>

                    {announcement.priority === 'high' && (
                        <div className="mt-20 p-10 bg-primary/5 rounded-3xl border border-primary/20 italic transition-all group-hover:shadow-xl group-hover:shadow-primary/5">
                            <p className="text-sm text-primary font-bold leading-relaxed flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-secondary" /> Perhatian: Pengumuman ini bersifat sangat penting dan membutuhkan tindakan atau perhatian segera.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </section>
      
      {/* Footer Decoration Slant */}
      <div className="h-24 bg-gray-50 clip-path-slant-down"></div>
    </div>
  );
}
