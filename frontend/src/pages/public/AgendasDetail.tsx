import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Share2, Printer, Loader2, ArrowRight, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Breadcrumbs from '../../components/Breadcrumbs';
import api from '../../lib/api';
import SEO from '../../components/SEO';
import { useSettingsStore } from '../../store/settingsStore';
import type { Agenda } from '../../types';

export default function AgendasDetail() {
  const { slug } = useParams();
  const { settings } = useSettingsStore();
  const siteName = settings?.site_name || 'Portal Pesantren';

  const { data: agenda, isLoading, error } = useQuery<Agenda>({
    queryKey: ['public-agenda', slug],
    queryFn: async () => {
      const response = await api.get(`/public/agendas/${slug}`);
      return response.data;
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-gray-50">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <p className="text-gray-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Menghimpun Detail Kegiatan...</p>
      </div>
    );
  }

  if (error || !agenda) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 bg-gray-50 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-red-600/10 rotate-12">
            <Calendar className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter italic uppercase text-center">Agenda Tidak Ditemukan</h1>
        <p className="text-gray-500 max-w-md mb-10 font-medium italic text-center">Informasi kegiatan yang Anda cari mungkin telah berkalu atau dihapus oleh administrator.</p>
        <Link to="/agenda" className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95">
          Kembali ke Semua Agenda
        </Link>
      </div>
    );
  }

  const eventSchema = agenda ? {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": agenda.title,
    "description": agenda.meta_description || agenda.content?.replace(/<[^>]+>/g, '').slice(0, 160),
    "startDate": agenda.event_date,
    "location": {
      "@type": "Place",
      "name": agenda.location || "Pesantren",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": settings?.site_address || "",
        "addressLocality": "Indonesia"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": siteName,
      "url": window.location.origin
    }
  } : undefined;

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title={agenda.meta_title || agenda.title}
        description={agenda.meta_description || agenda.content?.replace(/<[^>]+>/g, '').slice(0, 160) || `Kegiatan pesantren di ${agenda.location}.`}
        type="article"
        structuredData={eventSchema}
      />

      {/* Hero Header Section */}
      <section className="bg-primary pt-28 pb-32 px-4 relative overflow-hidden text-left">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 animate-fade-in">
                <div className="text-white/80">
                    <Breadcrumbs items={[
                        { label: 'Agenda', path: '/agenda' },
                        { label: agenda.title }
                    ]} />
                </div>
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
                <div className="inline-flex items-center gap-2 bg-secondary text-black font-black text-[10px] uppercase px-5 py-2 rounded-full tracking-[0.2em] shadow-xl shadow-secondary/20">
                    Kegiatan Terjadwal
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter uppercase italic drop-shadow-2xl">
                    {agenda.title}
                </h1>
            </div>
        </div>
        
        {/* Slant Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-white clip-path-slant-up"></div>
      </section>

      {/* Main Detail Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-20 md:-mt-32 relative z-20 pb-20 md:pb-40">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
            {/* Left Column: Meta & Sidebar */}
            <div className="lg:w-1/3 order-2 lg:order-1">
                <div className="bg-white rounded-[2.5rem] md:rounded-[40px] shadow-2xl p-6 md:p-10 border border-gray-100 flex flex-col gap-8 md:gap-10 sticky top-32 group text-left">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                        <Home className="w-40 h-40" />
                    </div>
                    
                    <div className="space-y-8 relative z-10">
                        {/* Event Date Block */}
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 shrink-0">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Waktu Kegiatan</p>
                                <p className="text-lg font-black text-gray-800 leading-tight">
                                    {new Date(agenda.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-gray-400 font-bold italic mt-1 uppercase tracking-wider">{new Date(agenda.event_date).toLocaleDateString('id-ID', { weekday: 'long' })}</p>
                            </div>
                        </div>

                        {/* Location Block */}
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-secondary text-black rounded-2xl flex items-center justify-center shadow-xl shadow-secondary/20 shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Lokasi Acara</p>
                                <p className="text-lg font-black text-gray-800 leading-tight uppercase italic">{agenda.location || 'Tempat Ditentukan'}</p>
                            </div>
                        </div>

                        {/* Time Info Block (Mockup info as we only have date) */}
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Jam Pelaksanaan</p>
                                <p className="text-lg font-black text-gray-800 leading-tight italic">08:00 WIB - Selesai</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-gray-50">
                        <button className="w-full bg-primary hover:bg-primary-dark text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3">
                            Ingatkan Saya <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Main Content */}
            <div className="lg:w-2/3 order-1 lg:order-2 text-left">
                <div className="bg-white rounded-[2.5rem] md:rounded-[40px] p-6 md:p-16 border border-gray-100 shadow-sm min-h-[400px] md:min-h-[600px]">
                    <div className="prose prose-lg prose-primary max-w-none">
                        <h2 className="text-3xl font-black text-gray-900 mb-10 border-b-8 border-secondary pb-4 inline-block italic uppercase tracking-tighter">
                            Rincian Kegiatan
                        </h2>
                        <div className="text-gray-700 leading-relaxed font-serif text-lg md:text-xl italic">
                            {agenda.content ? (
                                <div dangerouslySetInnerHTML={{ __html: agenda.content }} />
                            ) : (
                                <p className="text-gray-400">Rincian kegiatan sedang dalam tahap finalisasi oleh pihak panitia pesantren.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-20 p-10 bg-gray-50/50 rounded-3xl border border-gray-100 italic transition-all hover:shadow-xl hover:shadow-gray-100/50">
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            *Catatan: Jadwal kegiatan dapat berubah sewaktu-waktu tergantung kesiapan panitia atau faktor lingkungan lainnya. Mohon untuk memantau halaman ini secara berkala.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>
      
      {/* Footer Decoration Slant */}
      <div className="h-24 bg-gray-50 clip-path-slant-down"></div>
    </div>
  );
}
