import { useState, useEffect, useRef } from 'react';
import { BookOpen, Calendar, Play, ChevronLeft, ChevronRight, Megaphone, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { getImageUrl } from '../../lib/utils';
import SEO from '../../components/SEO';
import Skeleton from '../../components/ui/Skeleton';
import type { HomeData } from '../../types';

const RevealOnScroll = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay);
        if (ref.current) observer.unobserve(ref.current);
      }
    }, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });

    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.disconnect(); };
  }, [delay]);

  return (
    <div ref={ref} className={`transition-all duration-[1200ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'} ${className}`}>
      {children}
    </div>
  );
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: leadersData = [] } = useQuery<any[]>({
    queryKey: ['public-leaders'],
    queryFn: async () => {
      const response = await api.get('/public/leaders');
      return response.data;
    },
  });

  const { data, isLoading } = useQuery<HomeData>({
    queryKey: ['home-data'],
    queryFn: async () => {
      const response = await api.get('/public/home');
      return response.data;
    },
  });

  useEffect(() => {
    if (data?.banners?.length && data.banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % data.banners.length);
      }, 7000);
      return () => clearInterval(timer);
    }
  }, [data?.banners?.length]);

  const nextSlide = () => {
    if (data?.banners?.length) {
      setCurrentSlide((prev) => (prev + 1) % data.banners.length);
    }
  };
  
  const prevSlide = () => {
    if (data?.banners?.length) {
      setCurrentSlide((prev) => (prev - 1 + data.banners.length) % data.banners.length);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white">
        {/* Hero Skeleton */}
        <div className="h-[600px] bg-primary relative overflow-hidden flex items-center justify-center">
           <div className="max-w-5xl mx-auto w-full px-4 text-center space-y-6">
              <Skeleton width="120px" height="30px" className="mx-auto rounded-full bg-white/10" />
              <Skeleton width="80%" height="60px" className="mx-auto rounded-xl bg-white/10" />
              <Skeleton width="60%" height="24px" className="mx-auto rounded-lg bg-white/10" />
              <div className="flex justify-center gap-4">
                 <Skeleton width="160px" height="48px" className="rounded-xl bg-white/10" />
                 <Skeleton width="160px" height="48px" className="rounded-xl bg-white/10" />
              </div>
           </div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
           <div className="bg-white rounded-3xl p-10 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} height="80px" className="rounded-2xl" />)}
           </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-24 grid grid-cols-1 lg:grid-cols-3 gap-16">
           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" className="rounded-2xl" />)}
           </div>
           <div className="space-y-6">
              <Skeleton height="400px" className="rounded-3xl" />
           </div>
        </div>
      </div>
    );
  }

  const banners = data?.banners || [];
  const posts = data?.latest_posts || [];
  const agendas = data?.agendas || [];
  const announcements = data?.announcements || [];
  const video = data?.featured_video;

  return (
    <div className="bg-white w-full">
      <SEO 
        title="Beranda" 
        description="Portal Resmi Pesantren - Cerdas Berakal, Mulia Beradab, Teguh Beriman."
      />
      {/* Hero Section (Slider) */}
      <section className="bg-primary text-white px-4 relative overflow-hidden h-[500px] sm:h-[600px] flex items-center justify-center">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        
        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all border border-white/20 active:scale-90">
               <ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={nextSlide} className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all border border-white/20 active:scale-90">
               <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Content Wrapper for Absolute Cross-Fade */}
        <div className="absolute inset-0 w-full h-full flex flex-col justify-center">
            {banners.length > 0 ? banners.map((banner: any, index: number) => (
                <div 
                    key={banner.id} 
                    className={`absolute inset-0 flex flex-col justify-center transition-all duration-1000 ease-in-out ${
                        index === currentSlide 
                        ? 'opacity-100 translate-y-0 z-20 scale-100' 
                        : 'opacity-0 translate-y-12 z-0 scale-95 pointer-events-none'
                    }`}
                >
                    {banner.image_path && (
                        <div className="absolute inset-0 z-0">
                             <img 
                                src={getImageUrl(banner.image_path)} 
                                alt={banner.title} 
                                loading={index === 0 ? "eager" : "lazy"}
                                className="w-full h-full object-cover opacity-70 transition-transform duration-[10s]" 
                             />
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/95 via-primary/50 to-transparent"></div>
                        </div>
                    )}
                    <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
                        {banner.link_url && (
                             <div className="inline-block bg-secondary text-primary font-black text-[10px] uppercase px-5 py-2 rounded-full mb-8 shadow-2xl shadow-secondary/40 tracking-[0.2em]">
                                Info Terkini
                            </div>
                        )}
                        <h1 className="text-3xl md:text-6xl font-black mb-8 leading-tight tracking-tighter drop-shadow-2xl uppercase italic">
                            {banner.title}
                        </h1>
                        <p className="text-gray-200 mb-12 max-w-3xl mx-auto text-sm md:text-lg leading-relaxed font-medium opacity-90 italic">
                            {banner.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            {banner.link_url && (
                                <a 
                                  href={banner.link_url || '#'} 
                                  className="bg-white text-primary font-black px-12 py-4 rounded-xl hover:bg-secondary hover:text-primary transition-all text-xs uppercase tracking-widest shadow-xl active:scale-95 text-center"
                                >
                                  Selengkapnya
                                </a>
                            )}
                            <Link to="/profil" className="bg-primary-light/30 border border-white/20 backdrop-blur-md text-white font-black px-12 py-4 rounded-xl hover:bg-white/20 transition-all text-xs uppercase tracking-widest shadow-xl active:scale-95 text-center">
                                Profil Kami
                            </Link>
                        </div>
                    </div>
                </div>
            )) : (
              <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
                <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase italic tracking-tighter text-white">Selamat Datang</h1>
                <p className="opacity-80 italic text-white md:text-xl font-medium">Cerdas Berakal, Mulia Beradab, Teguh Beriman.</p>
              </div>
            )}
        </div>

        {/* Dots Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-30">
             {banners.map((_: any, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-secondary shadow-lg shadow-secondary/50' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                />
             ))}
          </div>
        )}
      </section>

      {/* Stats Section with sleek card overlap */}
      <section className="bg-white py-12 -mt-16 relative z-40 px-4">
        <RevealOnScroll className="max-w-7xl mx-auto">
          <div className="bg-primary-dark rounded-3xl p-10 shadow-2xl shadow-primary/40 border border-white/5 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl text-left"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
              {[
                { val: data?.stats?.santri || '3.275', label: 'Santri Aktif' },
                { val: data?.stats?.asatidz || '214', label: 'Asatidz/ah' },
                { val: data?.stats?.alumni || '12.4k', label: 'Alumni' },
                { val: data?.stats?.institusi || '6', label: 'Institusi' }
              ].map((stat, idx) => (
                <div key={idx} className="group text-center">
                  <div className="text-4xl lg:text-5xl font-black text-secondary mb-3 group-hover:scale-110 transition-transform tracking-tight">{stat.val}</div>
                  <div className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Sambutan Pengasuh (New Section) */}
      {(() => {
        const activeLeader = [...leadersData].sort((a, b) => {
          if (b.sort_order !== a.sort_order) return b.sort_order - a.sort_order;
          return b.id - a.id;
        })[0];

        if (!activeLeader) return null;

        return (
          <section className="bg-white py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <RevealOnScroll className="bg-gray-50 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100 relative group">
                <div className="flex flex-col lg:flex-row items-stretch">
                  <div className="lg:w-1/3 min-h-[400px] relative overflow-hidden">
                    <img 
                      src={getImageUrl(activeLeader.photo)} 
                      alt={activeLeader.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8">
                      <h3 className="text-white font-black text-lg uppercase tracking-tight mb-1">{activeLeader.name}</h3>
                      <span className="text-secondary font-black text-[9px] uppercase tracking-[0.3em]">Pengasuh Saat Ini</span>
                    </div>
                  </div>
                  <div className="lg:w-2/3 p-12 lg:p-16 flex flex-col justify-center">
                    <div className="w-12 h-1 bg-secondary mb-8 rounded-full"></div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tighter uppercase italic leading-none">
                      Sambutan <span className="text-primary">Pengasuh</span>
                    </h2>
                    <div className="relative">
                       <span className="absolute -top-6 -left-4 text-6xl font-serif text-primary/5 select-none">“</span>
                       <p className="text-gray-500 font-medium leading-relaxed italic text-base md:text-lg relative z-10">
                          {activeLeader.message || "Pesantren bukan sekadar tempat menimba ilmu, melainkan kawah candradimuka bagi pembentukan karakter dan akhlak mulia. Mari bersama-sama menjaga nyala api keilmuan dan spiritualitas demi kejayaan umat."}
                       </p>
                    </div>
                    <div className="mt-10">
                       <Link to="/profil" className="text-[10px] font-black text-primary hover:text-secondary uppercase tracking-[0.2em] flex items-center gap-2 group/link">
                          BACA PROFIL LENGKAP <span className="group-hover/link:translate-x-2 transition-transform">→</span>
                       </Link>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </section>
        );
      })()}

      {/* Main Content: Announcements & Agendas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Announcements Grid */}
          <div className="lg:w-2/3 text-left">
            <RevealOnScroll delay={100} className="flex items-center mb-10 border-l-8 border-secondary pl-6">
              <div>
                <h2 className="font-black text-gray-900 text-2xl uppercase tracking-tighter">Pengumuman & Layanan</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Updates & Quick Links</p>
              </div>
            </RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.length > 0 ? announcements.map((item: any, i: number) => (
                <RevealOnScroll key={item.id} delay={150 + (i * 100)}>
                  <div 
                    className="bg-gray-50 hover:bg-secondary transition-all p-6 rounded-2xl border border-gray-100 flex items-start gap-5 group shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full"
                  >
                    <div className={`p-3 rounded-xl shrink-0 transition-all ${item.priority === 'high' ? 'bg-secondary/20 text-primary-dark border border-secondary/30 group-hover:bg-primary group-hover:text-white' : 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug group-hover:text-primary-dark transition-colors">{item.title}</h3>
                      <p className="text-[11px] text-gray-500 font-medium group-hover:text-primary-dark/70 italic text-left">Klik untuk rincian &rarr;</p>
                    </div>
                  </div>
                </RevealOnScroll>
              )) : (
                <RevealOnScroll delay={150} className="col-span-full py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 italic text-sm">Belum ada pengumuman terbaru.</p>
                </RevealOnScroll>
              )}
            </div>
          </div>

          {/* Agendas Sidebar */}
          <div className="lg:w-1/3 text-left">
            <RevealOnScroll delay={300} className="bg-white rounded-3xl shadow-2xl shadow-black/5 p-8 border border-gray-100 h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                <Calendar className="w-32 h-32" />
              </div>
              <h3 className="font-black text-gray-900 mb-8 border-l-8 border-primary pl-4 text-sm uppercase tracking-widest">Kalender Agenda</h3>
              <div className="space-y-6 relative z-10">
                {agendas.length > 0 ? agendas.map((p: any) => (
                  <div key={p.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0 hover:translate-x-2 transition-transform cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                            {new Date(p.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="text-sm font-bold text-gray-800 hover:text-primary transition-colors leading-relaxed block text-left uppercase italic">{p.title}</div>
                  </div>
                )) : (
                  <p className="text-gray-400 italic text-sm">Tidak ada agenda mendatang.</p>
                )}
              </div>
              <div className="inline-flex mt-10 text-[10px] font-black text-secondary uppercase tracking-[0.2em] hover:text-primary-dark items-center gap-2 group/btn cursor-pointer">
                SEMUA AGENDA 
                <span className="group-hover/btn:translate-x-2 transition-transform">→</span>
              </div>
            </RevealOnScroll>
          </div>
          
        </div>
      </section>

      {/* Featured Berita & Video Section */}
      <section className="bg-gray-50/50 py-24 border-y border-gray-100 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-20">
            
            {/* Berita List */}
            <div className="lg:w-2/3">
                <RevealOnScroll className="flex justify-between items-end mb-12 border-l-8 border-primary pl-6">
                    <div>
                        <h2 className="font-black text-gray-900 text-3xl uppercase tracking-tighter">Warta Pesantren</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Insight & Achievement</p>
                    </div>
                    <Link to="/berita" className="text-[10px] font-black text-primary hover:text-secondary uppercase tracking-widest bg-white px-5 py-2 rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all mb-1 hidden sm:block">
                        Eksplorasi Semua Berita →
                    </Link>
                </RevealOnScroll>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {posts.map((b, i) => (
                    <RevealOnScroll key={b.id} delay={i * 150}>
                        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full">
                            <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                {b.cover_image ? (
                                    <img 
                                      src={getImageUrl(b.cover_image)} 
                                      alt={b.title} 
                                      loading="lazy"
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                ) : (
                                    <div className="text-primary/20 opacity-50"><BookOpen className="w-16 h-16" /></div>
                                )}
                                <span className="bg-secondary text-primary text-[9px] font-black px-3 py-1.5 absolute top-4 left-4 rounded-lg uppercase z-10 shadow-lg tracking-widest">
                                    {b.category?.name || 'UMUM'}
                                </span>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">
                                    <Calendar className="w-3.5 h-3.5 text-secondary" />
                                    <span>{new Date(b.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-4 line-clamp-2 hover:text-primary cursor-pointer transition-colors leading-snug uppercase italic">{b.title}</h3>
                                <div className="mt-auto pt-6 border-t border-gray-50">
                                    <Link to={`/berita/${b.slug}`} className="text-[11px] font-black text-primary hover:text-primary-dark uppercase tracking-widest flex items-center gap-2 group/more">
                                        BACA SELENGKAPNYA 
                                        <span className="group-hover/more:translate-x-2 transition-transform">→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>
                ))}
                </div>
            </div>

            {/* Video Section */}
            <div className="lg:w-1/3">
                <RevealOnScroll delay={300}>
                    <h2 className="font-black text-gray-900 text-xl uppercase mb-10 border-l-8 border-primary-dark pl-6 tracking-tighter">Sinema Pesantren</h2>
                    <div className="bg-white rounded-3xl shadow-2xl shadow-black/5 p-8 border border-gray-100 sticky top-32 group">
                    <div className="aspect-video bg-gray-900 rounded-2xl mb-8 relative flex items-center justify-center cursor-pointer overflow-hidden border-2 border-primary/5 shadow-inner">
                        {video ? (
                            <>
                                <img 
                                    src={`https://img.youtube.com/vi/${(video.youtube_url || video.video_url || '').split('v=')[1]?.split('&')[0] || ''}/maxresdefault.jpg`} 
                                    alt="Video cover" 
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" 
                                />
                                <a href={video.youtube_url || video.video_url} target="_blank" rel="noreferrer" className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center z-10 text-primary shadow-2xl shadow-secondary/50 hover:scale-110 active:scale-95 transition-all outline outline-8 outline-secondary/10">
                                    <Play className="w-8 h-8 ml-1 fill-primary" />
                                </a>
                            </>
                        ) : (
                            <div className="text-white/20"><Play className="w-12 h-12" /></div>
                        )}
                    </div>
                    <h3 className="font-black text-base text-gray-900 mb-3 leading-tight uppercase italic">{video?.title || 'Dokumentasi Video'}</h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed italic">{video?.description || 'Cuplikan kegiatan eksklusif dari kanal resmi pesantren.'}</p>
                    
                    <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">LIVE UPDATES</span>
                        </div>
                    </div>
                    </div>
                </RevealOnScroll>
            </div>
            
            </div>
        </div>
      </section>

      {/* Galeri Section (Bottom Polish) */}
      <section className="bg-white py-32 overflow-hidden relative text-center">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll className="inline-block mb-16 relative">
            <h2 className="font-black text-gray-900 text-5xl uppercase tracking-tighter mb-4 italic">Lensa Pesantren</h2>
            <div className="w-32 h-2.5 bg-secondary mx-auto rounded-full shadow-lg shadow-secondary/20"></div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] mt-8">Capture the Essence & Vision</p>
          </RevealOnScroll>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(data?.gallery && data.gallery.length > 0) ? data.gallery.map((item: any, i: number) => (
              <RevealOnScroll key={item.id} delay={i * 100}>
                  <div className="aspect-square bg-gray-50 rounded-3xl relative overflow-hidden group cursor-pointer border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                    <img 
                      src={getImageUrl(item.file_path)} 
                      alt={item.file_name || 'Galeri'} 
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                    />
                    <div className="absolute inset-x-4 bottom-4 bg-primary/90 backdrop-blur-md opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex flex-col items-center justify-center py-3 rounded-2xl border border-white/10">
                       <span className="text-white font-black text-[10px] tracking-widest uppercase mb-0.5">{item.file_name?.split('.')[0] || 'Media'}</span>
                       <span className="text-secondary font-bold text-[8px] tracking-[0.2em] uppercase">Klik Perbesar</span>
                    </div>
                  </div>
              </RevealOnScroll>
            )) : [1, 2, 3, 4, 5, 6, 7, 8].map((item, i) => (
              <RevealOnScroll key={item} delay={i * 100}>
                  <div className="aspect-square bg-gray-50 rounded-3xl relative overflow-hidden group cursor-pointer border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 h-full">
                    <div className="absolute inset-0 bg-primary opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                        <ImageIcon className="w-10 h-10 text-primary opacity-5 group-hover:scale-125 transition-transform" />
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Media Pesantren</span>
                    </div>
                  </div>
              </RevealOnScroll>
            ))}
          </div>
          
          <div className="mt-20">
            <Link to="/galeri" className="inline-block bg-primary text-white font-black px-14 py-5 rounded-2xl hover:bg-secondary hover:text-primary transition-all text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95">
                Galeri Lengkap &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
