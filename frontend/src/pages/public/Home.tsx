import { useState, useEffect, useRef } from 'react';
import { BookOpen, Calendar, Play, ChevronLeft, ChevronRight, Megaphone, Image as ImageIcon, Quote, User, MapPin, Phone, Mail, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useSettingsStore } from '../../store/settingsStore';
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
  const { settings } = useSettingsStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonialScrollRef = useRef<HTMLDivElement>(null);

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (testimonialScrollRef.current) {
      const scrollAmount = 400;
      testimonialScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const facilityScrollRef = useRef<HTMLDivElement>(null);

  const scrollFacilities = (direction: 'left' | 'right') => {
    if (facilityScrollRef.current) {
      const scrollAmount = 400;
      facilityScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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

  const { data: testimonials = [] } = useQuery<any[]>({
    queryKey: ['public-testimonials'],
    queryFn: async () => {
      const response = await api.get('/public/testimonials');
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

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": settings?.site_name || "Portal Pesantren",
    "description": settings?.site_description || "Portal Resmi Pesantren - Cerdas Berakal, Mulia Beradab, Teguh Beriman.",
    "url": window.location.origin,
    "logo": settings?.site_logo ? getImageUrl(settings.site_logo) : undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Pamekasan", // Bisa disesuaikan nantinya
      "addressRegion": "Jawa Timur",
      "addressCountry": "ID"
    }
  };

  return (
    <div className="bg-white w-full">
      <SEO 
        title="Beranda" 
        description={settings?.site_description || "Portal Resmi Pesantren - Cerdas Berakal, Mulia Beradab, Teguh Beriman."}
        structuredData={organizationSchema}
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
                    <div className="max-w-5xl mx-auto px-4 relative z-10 text-center pt-10 sm:pt-0">
                        {banner.link_url && (
                             <div className="inline-block bg-secondary text-primary font-black text-[9px] uppercase px-4 py-1.5 rounded-full mb-4 sm:mb-8 shadow-2xl shadow-secondary/40 tracking-[0.2em]">
                                Info Terkini
                            </div>
                        )}
                        <h1 className="text-2xl md:text-6xl font-black mb-4 sm:mb-8 leading-tight tracking-tighter drop-shadow-2xl uppercase italic px-2">
                            {banner.title}
                        </h1>
                        <p className="text-gray-200 mb-6 sm:mb-12 max-w-2xl mx-auto text-[11px] md:text-lg leading-relaxed font-medium opacity-90 italic line-clamp-3 sm:line-clamp-none px-4">
                            {banner.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 px-8 sm:px-0">
                            {banner.link_url && (
                                <a 
                                  href={banner.link_url || '#'} 
                                  className="bg-white text-primary font-black px-8 py-3 sm:px-12 sm:py-4 rounded-xl hover:bg-secondary hover:text-primary transition-all text-[10px] sm:text-xs uppercase tracking-widest shadow-xl active:scale-95 text-center"
                                >
                                  Selengkapnya
                                </a>
                            )}
                            <Link to="/profil" className="bg-primary-light/30 border border-white/20 backdrop-blur-md text-white font-black px-8 py-3 sm:px-12 sm:py-4 rounded-xl hover:bg-white/20 transition-all text-[10px] sm:text-xs uppercase tracking-widest shadow-xl active:scale-95 text-center">
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
          <section className="bg-white py-16 md:py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <RevealOnScroll className="bg-gray-50 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100 relative group">
                <div className="flex flex-col lg:flex-row items-stretch">
                  <div className="lg:w-1/3 min-h-[300px] md:min-h-[400px] relative overflow-hidden">
                    <img 
                      src={getImageUrl(activeLeader.photo)} 
                      alt={activeLeader.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8">
                      <h3 className="text-white font-black text-lg uppercase tracking-tight mb-1">{activeLeader.name}</h3>
                      <span className="text-secondary font-black text-[9px] uppercase tracking-[0.3em]">Pengasuh Saat Ini</span>
                    </div>
                  </div>
                  <div className="lg:w-2/3 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
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

      {/* Facilities Section */}
      {data?.facilities && data.facilities.length > 0 && (
        <section className="bg-gray-50/50 py-16 md:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-16">
              <RevealOnScroll className="text-center md:text-left">
                <div className="inline-block bg-secondary/10 text-primary font-black text-[9px] uppercase px-5 py-1.5 rounded-full mb-4 shadow-sm border border-secondary/20 tracking-[0.2em]">
                  Sarana & Prasarana
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase italic tracking-tighter mb-4">
                  Fasilitas <span className="text-primary">Pesantren</span>
                </h2>
                <div className="w-16 h-1.5 bg-secondary rounded-full mx-auto md:mx-0"></div>
              </RevealOnScroll>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => scrollFacilities('left')}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-primary hover:bg-secondary hover:text-primary transition-all shadow-xl shadow-black/5 active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button 
                  onClick={() => scrollFacilities('right')}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-primary hover:bg-secondary hover:text-primary transition-all shadow-xl shadow-black/5 active:scale-90"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            <div 
              ref={facilityScrollRef}
              className="flex overflow-x-auto overflow-y-hidden pb-10 gap-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {data.facilities.map((facility: any, i: number) => (
                <div key={facility.id} className="min-w-[85%] sm:min-w-[320px] md:min-w-[380px] snap-center">
                  <RevealOnScroll delay={i * 100} className="h-full">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 border border-gray-100 group hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                      <div className="h-56 relative overflow-hidden">
                        {facility.image_url ? (
                          <img 
                            src={facility.image_url} 
                            alt={facility.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary/20">
                            <Building2 className="w-20 h-20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                        
                        {/* Icon Overlay */}
                        <div className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary shadow-lg border border-white/20 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                           <Building2 className="w-6 h-6" />
                        </div>
                      </div>
                      
                      <div className="p-8 flex-1 flex flex-col text-left">
                        <h3 className="text-xl font-black text-gray-900 mb-3 uppercase italic tracking-tight group-hover:text-primary transition-colors leading-tight">
                          {facility.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3 mb-6 flex-1 italic">
                          {facility.description || 'Fasilitas unggulan untuk mendukung proses belajar mengajar dan kenyamanan santri selama di pondok.'}
                        </p>
                        <div className="pt-6 border-t border-gray-50">
                          <Link to="/fasilitas" className="text-[10px] font-black text-primary hover:text-secondary uppercase tracking-[0.2em] flex items-center gap-2 group/link w-fit">
                            LIHAT DETAIL <span className="group-hover/link:translate-x-2 transition-transform">→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <Link to="/fasilitas" className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black text-primary uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/5 active:scale-95">
                Semua Fasilitas Pesantren &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Main Content: Announcements & Agendas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
          
          {/* Announcements Grid */}
          <div className="lg:w-2/3 text-left">
            <RevealOnScroll delay={100} className="flex items-center mb-8 md:mb-10 border-l-8 border-secondary pl-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter">Pengumuman & Layanan</h2>
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
      <section className="bg-gray-50/50 py-16 md:py-24 border-y border-gray-100 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-20">
            
            {/* Berita List */}
            <div className="lg:w-2/3">
                <RevealOnScroll className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-12 border-l-8 border-primary pl-6 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter italic">Warta Pesantren</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Insight & Achievement</p>
                    </div>
                    <Link to="/publikasi" className="text-[10px] font-black text-primary hover:text-secondary uppercase tracking-widest bg-white px-5 py-2 rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all sm:mb-1">
                        LIHAT SEMUA BERITA →
                    </Link>
                </RevealOnScroll>
                
                <div className="flex overflow-x-auto overflow-y-hidden pb-10 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 gap-10 snap-x snap-mandatory scrollbar-hide">
                {posts.map((b, i) => (
                    <RevealOnScroll key={b.id} delay={i * 150} className="min-w-[280px] sm:min-w-0 snap-center">
                        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full">
                            <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                {b.cover_image_obj ? (
                                    <img 
                                      src={getImageUrl(b.cover_image_obj.file_path)} 
                                      alt={b.title} 
                                      loading="lazy"
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                ) : b.cover_image ? (
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
                            <div className="p-8 flex-1 flex flex-col text-left">
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
            <div className="lg:w-1/3 mt-12 lg:mt-0">
                <RevealOnScroll delay={300}>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase mb-8 md:mb-10 border-l-8 border-primary-dark pl-6 tracking-tighter italic">Sinema Pesantren</h2>
                    <div className="bg-white rounded-[2rem] md:rounded-3xl shadow-2xl shadow-black/5 p-6 md:p-8 border border-gray-100 sticky top-32 group">
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

      {/* Alumni Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="bg-primary-dark py-20 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-10">
              <RevealOnScroll className="text-center md:text-left">
                <div className="inline-block bg-secondary text-primary font-black text-[9px] uppercase px-5 py-1.5 rounded-full mb-4 shadow-xl shadow-secondary/20 tracking-[0.2em]">
                  Suara Alumni
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4">
                  Kisah Sukses <span className="text-secondary">Santri</span>
                </h2>
                <div className="w-16 h-1 bg-white/10 rounded-full mx-auto md:mx-0"></div>
              </RevealOnScroll>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => scrollTestimonials('left')}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-secondary hover:text-primary transition-all active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button 
                  onClick={() => scrollTestimonials('right')}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-secondary hover:text-primary transition-all active:scale-90"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            <div 
              ref={testimonialScrollRef}
              className="flex overflow-x-auto overflow-y-hidden pb-4 gap-4 md:gap-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
              {testimonials.map((item, i) => (
                <RevealOnScroll key={item.id} delay={i * 100} className="min-w-[85%] md:min-w-[340px] snap-center">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] h-full flex flex-col group hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
                    <div className="mb-6 relative">
                       <Quote className="w-8 h-8 text-secondary opacity-20 absolute -top-3 -left-3" />
                       <p className="text-white/80 font-medium leading-relaxed italic text-sm relative z-10">
                         "{item.content}"
                       </p>
                    </div>
                    <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 overflow-hidden shrink-0 shadow-inner">
                          {item.avatar ? (
                            <img src={getImageUrl(item.avatar)} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                               <User className="w-5 h-5" />
                            </div>
                          )}
                       </div>
                       <div>
                          <h4 className="text-white font-black text-xs uppercase tracking-tight leading-tight">{item.name}</h4>
                          <span className="text-secondary font-bold text-[9px] uppercase tracking-widest mt-1 block">Mondok: {item.tahun_mondok}</span>
                       </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Galeri Section (Bottom Polish) */}
      <section className="bg-white py-32 overflow-hidden relative text-center">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll className="inline-block mb-16 relative">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4 italic">Lensa Pesantren</h2>
            <div className="w-32 h-2.5 bg-secondary mx-auto rounded-full shadow-lg shadow-secondary/20"></div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] mt-8">Capture the Essence & Vision</p>
          </RevealOnScroll>
          
          <div className="flex overflow-x-auto overflow-y-hidden pb-10 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-6 snap-x snap-mandatory scrollbar-hide">
            {(data?.gallery && data.gallery.length > 0) ? data.gallery.map((item: any, i: number) => (
              <RevealOnScroll key={item.id} delay={i * 100} className="min-w-[240px] md:min-w-0 snap-center">
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
              <RevealOnScroll key={item} delay={i * 100} className="min-w-[240px] md:min-w-0 snap-center">
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

      {/* Map & Contact Section */}
      <section className="bg-gray-50 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="flex flex-col lg:flex-row gap-16 items-stretch">
            
            {/* Maps Column */}
            <div className="lg:w-3/5">
              <div className="mb-10 border-l-8 border-primary pl-6">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter">Lokasi Kami</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Kunjungi & Silaturahmi</p>
              </div>
              <div className="aspect-video lg:aspect-square lg:h-[500px] w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5 border-8 border-white relative group">
                {settings?.site_google_maps ? (
                  <div 
                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                    dangerouslySetInnerHTML={{ __html: settings.site_google_maps }} 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300">
                    <MapPin className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest opacity-40">Peta belum dikonfigurasi</p>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none border-[1px] border-black/5 rounded-[1.5rem]"></div>
              </div>
            </div>

            {/* Contact Info Column */}
            <div className="lg:w-2/5 flex flex-col justify-center">
              <div className="mb-10 border-l-8 border-secondary pl-6">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter">Hubungi Kami</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Layanan & Informasi</p>
              </div>

              <div className="space-y-8">
                {/* Address Card */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-black/5 border border-gray-100 group hover:border-primary/20 transition-all">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Alamat Pusat</h4>
                      <p className="text-sm font-bold text-gray-700 leading-relaxed uppercase italic">
                        {settings?.site_address || 'Jl. Raya Panyepen, Pamekasan, Jawa Timur'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-black/5 border border-gray-100 group hover:border-primary/20 transition-all">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-primary-dark shrink-0 group-hover:bg-secondary group-hover:text-primary transition-all">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Telepon / WhatsApp</h4>
                      <p className="text-lg font-black text-gray-800 tracking-tighter">
                        {settings?.contact_phone || '+62 812-3456-7890'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-black/5 border border-gray-100 group hover:border-primary/20 transition-all">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Email Resmi</h4>
                      <p className="text-sm font-bold text-gray-700 tracking-tight">
                        {settings?.contact_email || 'info@pesantren.ac.id'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-gray-200">
                <Link to="/kontak" className="inline-flex items-center gap-3 bg-primary text-white font-black px-10 py-4 rounded-2xl hover:bg-secondary hover:text-primary transition-all text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 active:scale-95">
                  Kirim Pesan Sekarang →
                </Link>
              </div>
            </div>

          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
