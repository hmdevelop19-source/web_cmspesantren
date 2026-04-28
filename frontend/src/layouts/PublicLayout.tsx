import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { getImageUrl } from '../lib/utils';
import { useSeoMeta } from '../hooks/useSeoMeta';
import {
  Camera, Globe, Play, Send, Mail, Phone, MapPin,
  ArrowRight, LayoutDashboard, Heart, Menu as MenuIcon, Search, X as CloseIcon, Calendar, Megaphone, Newspaper, Loader2, AlertCircle, ChevronDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Menu } from '../types';

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
  }, [settings]);

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

            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className={`transition-all duration-500 flex items-center justify-center rounded-2xl ${isTransparent ? 'w-12 h-12 bg-secondary/10' : 'w-10 h-10 bg-primary/5'} p-1.5 group-hover:scale-110 group-hover:rotate-3 shadow-2xl shadow-black/5 ring-1 ring-white/20 whitespace-nowrap`}>
                <img src={settings?.site_logo ? getImageUrl(settings.site_logo) : "/logo-kemenag.png"} alt="Logo" className="w-full h-full object-contain filter drop-shadow-md" />
              </div>
              <div className="flex flex-col">
                <span className={`font-black text-xl leading-none tracking-tighter uppercase italic transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-primary'}`}>{settings?.site_name || 'Al-Hikmah Portal'}</span>
                {!isScrolled && <span className={`text-[9px] mt-1 font-black uppercase tracking-[0.3em] transition-all duration-300 ${isTransparent ? 'text-secondary/80' : 'text-secondary'}`}>{settings?.site_tagline || 'Pusat Pendidikan Generasi Rabbani'}</span>}
              </div>
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
                    <div className={`absolute top-full left-0 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 transition-all duration-300 origin-top-left ${activeDropdown === item.id ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                      <div className="absolute top-0 left-6 w-3 h-3 bg-white border-t border-l border-gray-100 -translate-y-1.5 rotate-45"></div>
                      {item.children.map(child => (
                        <Link 
                          key={child.id} 
                          to={child.url}
                          className="block px-6 py-2.5 text-[10px] font-black text-gray-500 hover:text-primary hover:bg-gray-50 uppercase tracking-widest transition-all"
                        >
                          {child.label}
                        </Link>
                      ))}
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

              <Link to="/login" className="text-[11px] font-black text-primary-dark bg-secondary hover:bg-yellow-400 px-5 py-3 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-secondary/20 active:scale-95 ml-2">
                Portal Admin
              </Link>
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
          <div className="p-6 flex flex-col gap-2 flex-grow overflow-y-auto">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest ${location.pathname === '/' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}`}>Beranda</Link>
            
            {menus.map((item) => (
              <div key={item.id} className="space-y-2">
                <Link 
                  to={item.url} 
                  onClick={() => !item.children?.length && setIsMobileMenuOpen(false)} 
                  className={`px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-between ${location.pathname === item.url ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}`}
                >
                  {item.label}
                  {item.children && item.children.length > 0 && <ChevronDown className="w-4 h-4" />}
                </Link>
                {item.children && item.children.length > 0 && (
                  <div className="pl-6 space-y-2">
                    {item.children.map(child => (
                      <Link 
                        key={child.id} 
                        to={child.url} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${location.pathname === child.url ? 'text-primary' : 'text-gray-400 bg-gray-50/50'}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-gray-100">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center block text-xs font-black text-primary-dark bg-secondary px-6 py-4 rounded-2xl uppercase tracking-widest shadow-xl shadow-secondary/20">
              Akses Admin
            </Link>
          </div>
        </div>
      </div>

      <main className={`flex-grow bg-white ${isHomepage ? '' : 'pt-[64px]'}`}>
        <Outlet />
      </main>

      <footer className="bg-primary-dark pt-24 pb-12 text-white relative overflow-hidden">
        {/* ... existing footer code ... */}
        {/* (I'll keep the same footer structure but I need to close the div correctly in a single chunk) */}
        {/* Since I am just appending the Search Modal, I will target the end of the file */}
        {/* I'll use a larger block to ensure it lands after footer but before closing div of PublicLayout */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-5">
              <div className="flex items-center gap-5 mb-10">
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
              </div>
              <p className="text-sm text-white/50 mb-10 leading-relaxed max-w-md font-medium italic">
                {settings?.site_description || 'Pusat keunggulan pendidikan berbasis nilai-nilai keislaman dan inovasi teknologi untuk melahirkan generasi yang bertakwa dan kompetitif.'}
              </p>

              <div className="flex space-x-4">
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

            <div className="md:col-span-3">
              <h3 className="text-secondary font-black mb-10 text-[11px] uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-3 h-0.5 bg-secondary rounded-full"></span>
                Links
              </h3>
              <ul className="space-y-5 text-[13px] text-white/40 font-black uppercase tracking-widest italic font-mono">
                <li>
                  <Link to="/" className="hover:text-secondary transition-all flex items-center gap-3 group">
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-secondary" />
                    Beranda
                  </Link>
                </li>
                {menus.map(item => (
                  <li key={item.id}>
                    <Link to={item.url} className="hover:text-secondary transition-all flex items-center gap-3 group">
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-secondary" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4">
              <h3 className="text-secondary font-black mb-10 text-[11px] uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-3 h-0.5 bg-secondary rounded-full"></span>
                Official
              </h3>
              <ul className="space-y-8">
                <li className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-secondary group-hover:bg-secondary group-hover:text-primary-dark transition-all duration-500 shadow-inner">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] block mb-1.5 font-mono">LOKASI</span>
                    <span className="text-[12px] leading-relaxed font-bold text-white/80 block max-w-xs">{settings?.site_address || 'Jl. PP. Miftahul Ulum Bettet Pamekasan, Jawa Timur'}</span>
                  </div>
                </li>
                <li className="flex gap-6 items-center group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-secondary group-hover:bg-secondary group-hover:text-primary-dark transition-all duration-500 shadow-inner">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] block mb-1.5 font-mono">EMAIL</span>
                    <span className="text-[13px] font-black text-white/90">{settings?.contact_email || 'info@lembaga.ac.id'}</span>
                  </div>
                </li>
                <li className="flex gap-6 items-center group">
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
              <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em]">
                &copy; {new Date().getFullYear()} {settings?.site_name || 'CMS Pesantren'} . Hak Cipta Dilindungi
              </p>
              <div className="flex items-center gap-3 text-[9px] font-bold text-white/10 uppercase tracking-widest">
                <span>Heritage Engine v2.0</span>
                <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                <span>Optimized Production Build</span>
              </div>
            </div>

            <div className="flex items-center gap-10">
              <Link to="/admin" target="_blank" className="flex items-center gap-2.5 text-[10px] font-black text-secondary/40 hover:text-secondary transition-all uppercase tracking-[0.2em] group">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Buka Dashboard
              </Link>
              <div className="flex items-center gap-2 text-[10px] font-black text-white/10 uppercase tracking-widest group">
                Made with <Heart className="w-3 h-3 text-red-900/50 fill-red-900/30 group-hover:text-red-600 group-hover:fill-red-500 transition-all duration-700" /> by HmDevelop
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modern Search Overlay (Glassmorphism) */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 flex items-start justify-center p-4 sm:p-8 ${isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-[#0B1120]/80 backdrop-blur-2xl" onClick={() => setIsSearchOpen(false)}></div>

        <div className={`relative w-full max-w-2xl transition-all duration-500 ease-out transform ${isSearchOpen ? 'translate-y-0 scale-100' : '-translate-y-8 scale-95'}`}>
          {/* Close Button */}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute -top-10 sm:-top-12 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 uppercase text-[9px] font-black tracking-[0.3em] group"
          >
            Close <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 group-hover:rotate-90 transition-all duration-500"><CloseIcon className="w-3 h-3" /></div>
          </button>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative flex items-center bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="pl-6 text-white/30">
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin text-secondary" /> : <Search className="w-5 h-5" />}
              </div>
              <input
                autoFocus={isSearchOpen}
                type="text"
                placeholder="Cari berita atau agenda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-white px-5 py-5 sm:py-6 text-lg font-bold placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Results Area */}
          <div className="mt-8 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {searchQuery.trim() === '' ? (
              <div className="text-center py-20">
                <p className="text-white/20 text-xs font-black uppercase tracking-[0.5em]">Tuliskan kata kunci untuk memulai pencarian</p>
              </div>
            ) : isSearching ? (
              <div className="text-center py-20 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-secondary" />
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Menelusuri semesta data...</p>
              </div>
            ) : (!searchResults || (searchResults.posts.length === 0 && searchResults.agendas.length === 0 && searchResults.announcements.length === 0)) ? (
              <div className="text-center py-20 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5">
                  <AlertCircle className="w-10 h-10 text-white/10" />
                </div>
                <div>
                  <p className="text-white font-black text-xl uppercase italic tracking-tight">Tidak Ditemukan</p>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-2">Maaf, kata kunci "{searchQuery}" tidak cocok dengan data apapun</p>
                </div>
              </div>
            ) : (
              <div className="space-y-12 pb-20">
                {/* Berita Results */}
                {searchResults.posts.length > 0 && (
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <h4 className="text-secondary text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                      <span className="w-8 h-px bg-secondary/30"></span> Warta / Berita
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.posts.map((post: any) => (
                        <Link
                          key={post.id}
                          to={`/berita/${post.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="group flex items-center gap-6 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                            <Newspaper className="w-6 h-6 text-white/20 group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <h5 className="text-white font-bold group-hover:text-secondary transition-colors line-clamp-1">{post.title}</h5>
                            <p className="text-white/40 text-[11px] mt-1 line-clamp-1">{post.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agenda Results */}
                {searchResults.agendas.length > 0 && (
                  <div className="animate-in slide-in-from-bottom-4 duration-700">
                    <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                      <span className="w-8 h-px bg-blue-400/30"></span> Agenda Kegiatan
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.agendas.map((item: any) => (
                        <Link
                          key={item.id}
                          to={`/agenda/${item.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="group flex items-center gap-6 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                            <Calendar className="w-6 h-6 text-blue-400/40 group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <h5 className="text-white font-bold group-hover:text-blue-400 transition-colors line-clamp-1">{item.title}</h5>
                            <p className="text-blue-400/40 text-[10px] font-black uppercase tracking-widest mt-1">{item.location}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pengumuman Results */}
                {searchResults.announcements.length > 0 && (
                  <div className="animate-in slide-in-from-bottom-4 duration-1000">
                    <h4 className="text-red-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                      <span className="w-8 h-px bg-red-400/30"></span> Pengumuman
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.announcements.map((item: any) => (
                        <Link
                          key={item.id}
                          to={`/pengumuman/${item.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="group flex items-center gap-6 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                            <Megaphone className="w-6 h-6 text-red-400/40 group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <h5 className="text-white font-bold group-hover:text-red-400 transition-colors line-clamp-1">{item.title}</h5>
                            <p className="text-white/40 text-[11px] mt-1 line-clamp-1">{item.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
