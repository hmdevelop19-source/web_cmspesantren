import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { getImageUrl } from '../lib/utils';
import { useSeoMeta } from '../hooks/useSeoMeta';
import {
  Camera, Globe, Play, Send, Mail, Phone, MapPin,
  ArrowRight, Heart, Menu as MenuIcon, Search, X as CloseIcon, Calendar, Megaphone, Newspaper, AlertCircle, ChevronDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Menu } from '../types';
import ErrorBoundary from '../components/ErrorBoundary';

export default function PublicLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { settings, fetchSettings } = useSettingsStore();
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const { data: menus = [] } = useQuery<Menu[]>({
    queryKey: ['public-menus'],
    queryFn: async () => {
      const response = await api.get('/public/menus');
      return response.data;
    }
  });

  // Default SEO for the whole site
  useSeoMeta({
    title: settings?.site_name,
    description: settings?.site_description,
    image: settings?.site_logo,
    keywords: 'pesantren, pendidikan islam, portal santri',
    siteName: settings?.site_name,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/search?q=${searchQuery}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (settings) {
      if (settings.site_name && location.pathname === '/') {
        document.title = settings.site_name;
      }
      if (settings.primary_color) {
        document.documentElement.style.setProperty('--color-primary', settings.primary_color);
        document.documentElement.style.setProperty('--color-primary-dark', settings.primary_color);
        // Add a bit of transparency for the light version
        document.documentElement.style.setProperty('--color-primary-light', `${settings.primary_color}dd`);
      }
      if (settings.secondary_color) {
        document.documentElement.style.setProperty('--color-secondary', settings.secondary_color);
        document.documentElement.style.setProperty('--color-accent', settings.secondary_color);
      }
    }
  }, [settings, location.pathname]);

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle search with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      // Close search with ESC
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const isHomepage = location.pathname === '/';
  const isTransparent = isHomepage && !isScrolled;
  const isActive = (path: string) => location.pathname === path
    ? (isTransparent ? "border-b-2 border-secondary text-secondary" : "border-b-2 border-primary text-primary font-black")
    : (isTransparent ? "hover:text-secondary opacity-90" : "text-gray-500 hover:text-primary opacity-90");

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <header className={`w-full fixed top-0 z-50 transition-all duration-500 ease-in-out ${isTransparent ? 'bg-transparent py-2' : 'bg-white/90 backdrop-blur-xl shadow-lg shadow-gray-200/20 py-3 border-b border-gray-100/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">

            <Link to="/" className="flex items-center group">
              {settings?.header_logo_style === 'landscape' && settings?.site_logo_landscape ? (
                <div className={`transition-all duration-500 ${isTransparent ? 'h-10 sm:h-14' : 'h-8 sm:h-12'}`}>
                  <img 
                    src={getImageUrl(settings.site_logo_landscape)} 
                    alt={settings?.site_name || "Logo"} 
                    className="h-full w-auto object-contain transition-transform group-hover:scale-105" 
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`transition-all duration-500 flex items-center justify-center rounded-2xl ${isTransparent ? 'w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10' : 'w-9 h-9 sm:w-10 sm:h-10 bg-primary/5'} p-1.5 group-hover:scale-110 group-hover:rotate-3 shadow-2xl shadow-black/5 ring-1 ring-white/20 whitespace-nowrap`}>
                    <img src={settings?.site_logo ? getImageUrl(settings.site_logo) : "/logo-kemenag.png"} alt="Logo" className="w-full h-full object-contain filter drop-shadow-md" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-black text-lg sm:text-xl leading-none tracking-tighter uppercase italic transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-primary'}`}>{settings?.site_name || 'Al-Hikmah Portal'}</span>
                    {!isScrolled && <span className={`text-[8px] sm:text-[9px] mt-1 font-black uppercase tracking-[0.2em] transition-all duration-300 ${isTransparent ? 'text-secondary/80' : 'text-secondary'}`}>{settings?.site_tagline || 'Pusat Pendidikan Generasi Rabbani'}</span>}
                  </div>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link to="/" className={`px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] transition-all ${isActive('/')}`}>Beranda</Link>
              
              {menus.map((item) => (
                <div 
                  key={item.id} 
                  className="relative group/nav"
                  onMouseEnter={() => item.children && item.children.length > 0 && setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link 
                    to={item.url} 
                    className={`px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1 ${isActive(item.url)}`}
                  >
                    {item.label}
                    {item.children && item.children.length > 0 && <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === item.id ? 'rotate-180' : ''}`} />}
                  </Link>

                  {item.children && item.children.length > 0 && (
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 transform origin-top ${activeDropdown === item.id ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                      <div className="bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 p-2 min-w-[240px] overflow-hidden relative">
                        {/* Decorative Top Arrow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 bg-white border-t border-l border-gray-50 rotate-45"></div>
                        
                        <div className="flex flex-col relative z-10">
                          {item.children.map(child => (
                            <Link 
                              key={child.id} 
                              to={child.url}
                              className="flex items-center justify-between px-5 py-3.5 rounded-xl hover:bg-primary/5 group/item transition-all"
                            >
                              <div className="flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-secondary scale-0 group-hover/item:scale-100 transition-transform"></div>
                                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover/item:text-primary transition-colors whitespace-nowrap italic">
                                   {child.label}
                                 </span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                            </Link>
                          ))}
                        </div>

                        {/* Dropdown Footer Hint */}
                        <div className="mt-1 pt-3 border-t border-gray-50 px-5 pb-2">
                           <div className="flex items-center justify-between">
                              <span className="text-[7px] font-black text-gray-300 uppercase tracking-[0.2em]">Pusat Informasi</span>
                              <div className="flex gap-1">
                                 <div className="w-1 h-1 rounded-full bg-secondary/30"></div>
                                 <div className="w-1 h-1 rounded-full bg-secondary/60"></div>
                                 <div className="w-1 h-1 rounded-full bg-secondary animate-pulse"></div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="w-px h-5 bg-gray-300/50 mx-4"></div>

              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-95 ${isTransparent ? 'text-white bg-white/10 hover:bg-white/20' : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-primary'}`}
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {settings?.header_button_url?.startsWith('http') ? (
                <a 
                  href={settings.header_button_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[11px] font-black text-primary-dark bg-secondary hover:bg-yellow-400 px-5 py-3 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-secondary/20 active:scale-95 ml-2"
                >
                  {settings?.header_button_label || 'Portal Admin'}
                </a>
              ) : (
                <Link 
                  to={settings?.header_button_url || "/login"} 
                  className="text-[11px] font-black text-primary-dark bg-secondary hover:bg-yellow-400 px-5 py-3 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-secondary/20 active:scale-95 ml-2"
                >
                  {settings?.header_button_label || 'Portal Admin'}
                </Link>
              )}
            </nav>

            {/* Mobile Navigation Trigger */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2.5 rounded-xl transition-all ${isTransparent ? 'text-white bg-white/10 hover:bg-white/20' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className={`p-2.5 rounded-xl ${isTransparent ? 'text-white bg-white/10' : 'text-primary bg-primary/5'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <span className="font-black text-gray-900 text-xl tracking-tighter uppercase">Menu Navigasi</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="bg-gray-100 p-2 rounded-xl text-gray-500 hover:bg-gray-200">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-3 flex-grow overflow-y-auto">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${location.pathname === '/' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Beranda</Link>
            
            {menus.map((item) => (
              <div key={item.id} className="space-y-3">
                <div className="flex items-center gap-2">
                   <Link 
                     to={item.url} 
                     onClick={() => !item.children?.length && setIsMobileMenuOpen(false)} 
                     className={`flex-1 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${location.pathname === item.url ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                   >
                     {item.label}
                   </Link>
                   {item.children && item.children.length > 0 && (
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeDropdown === item.id ? 'bg-secondary text-primary' : 'bg-gray-100 text-gray-400'}`}
                      >
                         <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>
                   )}
                </div>
                
                {item.children && item.children.length > 0 && activeDropdown === item.id && (
                  <div className="grid grid-cols-1 gap-2 pl-4 animate-in slide-in-from-top-2 duration-300">
                    {item.children.map(child => (
                      <Link 
                        key={child.id} 
                        to={child.url} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === child.url ? 'bg-primary/5 text-primary' : 'text-gray-500 bg-gray-50/50 hover:bg-gray-100'}`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-gray-100 bg-gray-50/30">
            {settings?.header_button_url?.startsWith('http') ? (
              <a 
                href={settings.header_button_url} 
                target="_blank" 
                rel="noreferrer"
                className="w-full text-center block text-[11px] font-black text-primary-dark bg-secondary px-6 py-5 rounded-2xl uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 active:scale-95 transition-all"
              >
                {settings?.header_button_label || 'Portal Admin'} &rarr;
              </a>
            ) : (
              <Link 
                to={settings?.header_button_url || "/login"} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center block text-[11px] font-black text-primary-dark bg-secondary px-6 py-5 rounded-2xl uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 active:scale-95 transition-all"
              >
                {settings?.header_button_label || 'Portal Admin'} &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className={`flex-grow bg-white ${isHomepage ? '' : 'pt-0'}`}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="bg-primary-dark pt-24 pb-12 text-white relative overflow-hidden">
        {/* ... existing footer code ... */}
        {/* (I'll keep the same footer structure but I need to close the div correctly in a single chunk) */}
        {/* Since I am just appending the Search Modal, I will target the end of the file */}
        {/* I'll use a larger block to ensure it lands after footer but before closing div of PublicLayout */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-16 mb-20">
            <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-5 mb-8">
                {settings?.header_logo_style === 'landscape' && settings?.site_logo_landscape ? (
                  <div className="h-16 sm:h-20 transition-all duration-500 group">
                    <img 
                      src={getImageUrl(settings.site_logo_landscape)} 
                      alt={settings?.site_name || "Logo"} 
                      className="h-full w-auto object-contain transition-transform group-hover:scale-105" 
                    />
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl p-2.5 shadow-2xl shadow-black/40 ring-4 ring-white/5 overflow-hidden group">
                      {settings?.site_logo ? (
                        <img src={getImageUrl(settings.site_logo)} alt="Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-primary/5 flex items-center justify-center rounded-lg">
                          <span className="text-primary font-black text-[10px] uppercase text-center leading-tight">Miftahul<br />Ulum</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-black text-2xl tracking-tighter block leading-tight uppercase italic">{settings?.site_name || 'PORTAL PESANTREN'}</span>
                      <span className="text-[11px] text-secondary font-black uppercase tracking-[0.3em] mt-1.5 block drop-shadow-sm">{settings?.site_tagline || 'Education Excellence'}</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-white/50 mb-10 leading-relaxed max-w-md font-medium italic">
                {settings?.site_description || 'Pusat keunggulan pendidikan berbasis nilai-nilai keislaman dan inovasi teknologi untuk melahirkan generasi yang bertakwa dan kompetitif.'}
              </p>

              <div className="flex justify-center md:justify-start space-x-4">
                {[
                  { name: 'Instagram', url: settings?.instagram_url, icon: <Camera className="w-4 h-4" /> },
                  { name: 'Facebook', url: settings?.facebook_url, icon: <Globe className="w-4 h-4" /> },
                  { name: 'Youtube', url: settings?.youtube_url, icon: <Play className="w-4 h-4" /> },
                  { name: 'Twitter', url: settings?.twitter_url, icon: <Send className="w-4 h-4" /> }
                ].map(social => (
                  <a
                    key={social.name}
                    href={social.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-12 h-12 bg-white/5 hover:bg-secondary hover:text-primary-dark rounded-2xl flex items-center justify-center transition-all border border-white/10 group shadow-lg hover:shadow-secondary/20 hover:-translate-y-1.5"
                    title={social.name}
                  >
                    <div className="group-hover:scale-110 transition-transform duration-300">{social.icon}</div>
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 text-center md:text-left">
              <h3 className="text-secondary font-black mb-8 md:mb-10 text-[11px] uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-3">
                <span className="w-3 h-0.5 bg-secondary rounded-full"></span>
                Links
              </h3>
              <ul className="grid grid-cols-2 md:grid-cols-1 gap-y-4 gap-x-8 md:space-y-5 text-[12px] md:text-[13px] text-white/40 font-black uppercase tracking-widest italic font-mono">
                <li>
                  <Link to="/" className="hover:text-secondary transition-all flex items-center justify-center md:justify-start gap-3 group">
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-6 md:group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-secondary hidden md:block" />
                    Beranda
                  </Link>
                </li>
                {menus.map(item => (
                  <li key={item.id}>
                    <Link to={item.url} className="hover:text-secondary transition-all flex items-center justify-center md:justify-start gap-3 group">
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-6 md:group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-secondary hidden md:block" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4 text-center md:text-left">
              <h3 className="text-secondary font-black mb-8 md:mb-10 text-[11px] uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-3">
                <span className="w-3 h-0.5 bg-secondary rounded-full"></span>
                Official
              </h3>
              <ul className="space-y-6 md:space-y-8">
                <li className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-secondary group-hover:bg-secondary group-hover:text-primary-dark transition-all duration-500 shadow-inner">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] block mb-1.5 font-mono">LOKASI</span>
                    <span className="text-[12px] leading-relaxed font-bold text-white/80 block max-w-sm">{settings?.site_address || 'Jl. PP. Miftahul Ulum Bettet Pamekasan, Jawa Timur'}</span>
                  </div>
                </li>
                <li className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-secondary group-hover:bg-secondary group-hover:text-primary-dark transition-all duration-500 shadow-inner">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] block mb-1.5 font-mono">EMAIL</span>
                    <span className="text-[13px] font-black text-white/90">{settings?.contact_email || 'info@lembaga.ac.id'}</span>
                  </div>
                </li>
                <li className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-secondary group-hover:bg-secondary group-hover:text-primary-dark transition-all duration-500 shadow-inner">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] block mb-1.5 font-mono">TELEPHONE / WA</span>
                    <span className="text-[16px] font-black text-white tracking-widest">{settings?.contact_phone || '081234567890'}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-12 mt-12 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center lg:items-start gap-2">
              <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.5em]">
                &copy; {new Date().getFullYear()} {settings?.site_name || 'CMS Pesantren'} . Hak Cipta Dilindungi
              </p>
              <div className="flex items-center gap-3 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                <span>Heritage Engine v2.0</span>
                <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                <span>Optimized Production Build</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest group">
                Made with <Heart className="w-3 h-3 text-red-600 fill-red-500/30 group-hover:fill-red-500 transition-all duration-700" /> by HmDevelop
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modern Command Center Search (Spotlight Style) */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 flex items-start justify-center p-4 sm:p-24 ${isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" onClick={() => setIsSearchOpen(false)}></div>

        <div className={`relative w-full max-w-xl transition-all duration-500 ease-out transform ${isSearchOpen ? 'translate-y-0 scale-100' : '-translate-y-12 scale-95'}`}>
          
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_32px_128px_rgba(0,0,0,0.2)] border border-white/20 overflow-hidden flex flex-col max-h-[75vh]">
            
            {/* Compact Search Input Area */}
            <div className="relative border-b border-gray-100 p-5 sm:p-6">
              <Search className={`w-5 h-5 absolute left-10 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-secondary animate-pulse' : 'text-gray-300'}`} />
              <input
                autoFocus={isSearchOpen}
                type="text"
                placeholder="Cari berita, agenda, atau info..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-none focus:ring-0 text-gray-900 pl-12 pr-12 py-3.5 rounded-xl text-sm font-bold placeholder:text-gray-300 placeholder:font-medium italic"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <div className="bg-white shadow-sm border border-gray-100 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest hidden sm:block">ESC</div>
                <CloseIcon className="w-4 h-4 sm:hidden" />
              </button>
            </div>

            {/* Compact Results Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">
              {searchQuery.trim() === '' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> Pintasan Cepat
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { label: 'Warta Terbaru', path: '/berita', icon: <Newspaper className="w-4 h-4" />, color: 'bg-blue-50 text-blue-500' },
                      { label: 'Agenda Santri', path: '/agenda', icon: <Calendar className="w-4 h-4" />, color: 'bg-yellow-50 text-yellow-600' },
                      { label: 'Pengumuman', path: '/pengumuman', icon: <Megaphone className="w-4 h-4" />, color: 'bg-red-50 text-red-500' },
                    ].map((link, idx) => (
                      <Link 
                        key={idx} 
                        to={link.path} 
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg hover:shadow-black/5 border border-transparent hover:border-gray-100 transition-all group"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${link.color} group-hover:scale-105 transition-transform shadow-inner`}>
                          {link.icon}
                        </div>
                        <span className="text-xs font-black text-gray-600 uppercase tracking-tight italic group-hover:text-primary">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : isSearching ? (
                <div className="py-12 text-center flex flex-col items-center gap-4">
                   <div className="w-10 h-10 border-4 border-gray-100 border-t-secondary rounded-full animate-spin"></div>
                   <p className="text-gray-400 font-black text-[9px] uppercase tracking-[0.3em] italic">Mencari...</p>
                </div>
              ) : (!searchResults || (searchResults.posts.length === 0 && searchResults.agendas.length === 0 && searchResults.announcements.length === 0)) ? (
                <div className="py-12 text-center flex flex-col items-center gap-6 animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
                    <AlertCircle className="w-8 h-8 text-gray-200" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">Tidak Ditemukan</h5>
                    <p className="text-gray-400 text-[10px] font-medium mt-1">"{searchQuery}" tidak tersedia.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 pb-4">
                  {[
                    { title: 'Berita', data: searchResults.posts, path: '/berita', icon: <Newspaper className="w-3.5 h-3.5" />, color: 'text-blue-500' },
                    { title: 'Agenda', data: searchResults.agendas, path: '/agenda', icon: <Calendar className="w-3.5 h-3.5" />, color: 'text-yellow-600' },
                    { title: 'Informasi', data: searchResults.announcements, path: '/pengumuman', icon: <Megaphone className="w-3.5 h-3.5" />, color: 'text-red-500' }
                  ].filter(cat => cat.data.length > 0).map((cat, idx) => (
                    <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <h4 className={`text-[8px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 ${cat.color}`}>
                        {cat.title}
                        <span className="bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full text-[7px]">{cat.data.length}</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {cat.data.map((item: any) => (
                          <Link
                            key={item.id}
                            to={`${cat.path}/${item.slug}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 group-hover:bg-white group-hover:shadow-md transition-all ${cat.color}`}>
                              {cat.icon}
                            </div>
                            <div className="flex-1">
                              <h5 className="text-gray-900 font-bold text-[13px] group-hover:text-primary transition-colors line-clamp-1 italic uppercase tracking-tight leading-none">{item.title}</h5>
                              <p className="text-gray-400 text-[9px] mt-1 line-clamp-1 font-medium italic opacity-70">{item.content?.replace(/<[^>]*>?/gm, '').substring(0, 80)}</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Compact Footer */}
            <div className="bg-gray-50/80 px-6 py-3 flex items-center justify-between border-t border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <kbd className="bg-white border border-gray-200 rounded px-1 py-0.5 text-[8px] font-black text-gray-400 shadow-sm">Enter</kbd>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Pilih</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="bg-white border border-gray-200 rounded px-1 py-0.5 text-[8px] font-black text-gray-400 shadow-sm">K</kbd>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cari</span>
                    </div>
                </div>
                <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest italic opacity-50">Spotlight Search v2.1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
