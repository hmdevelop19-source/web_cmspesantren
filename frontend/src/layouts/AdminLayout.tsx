import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, FileText, Settings, User, Menu, Image, Edit3, Bell, ExternalLink, X, 
  CalendarDays, Megaphone, PlaySquare, Users as UsersIcon, ShieldCheck,
  LogOut, Tag, Mail, LayoutPanelTop
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, canAccess } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching admin settings:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/contact-messages/unread-count');
        setUnreadMsgCount(res.data.count || 0);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // auto-refresh per menit
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (settings) {
      if (settings.primary_color) {
        document.documentElement.style.setProperty('--color-primary', settings.primary_color);
        document.documentElement.style.setProperty('--color-primary-dark', settings.primary_color);
        document.documentElement.style.setProperty('--color-primary-light', `${settings.primary_color}dd`);
      }
      if (settings.secondary_color) {
        document.documentElement.style.setProperty('--color-secondary', settings.secondary_color);
        document.documentElement.style.setProperty('--color-accent', settings.secondary_color);
      }
    }
  }, [settings]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isActive = (path: string) => {
    const isMatched = path === '/admin' ? location.pathname === path : location.pathname.startsWith(path);
    return isMatched 
      ? "bg-gradient-to-r from-primary/90 to-primary-dark/90 shadow-lg shadow-black/20 text-white translate-x-1 border-r-4 border-secondary/90 ring-1 ring-white/10" 
      : "text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1 border-r-4 border-transparent";
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navItemClass = "mx-3 flex items-center gap-3 px-4 py-3 text-[13px] font-bold rounded-2xl transition-all duration-300 ease-out";

  return (
    <div className="flex h-screen bg-slate-50 w-full overflow-x-hidden overflow-y-hidden font-sans relative text-gray-800">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Sidebar - Modern Deep Space SaaS Theme */}
      <aside className={`w-[260px] bg-gradient-to-b from-[#0B1120] via-[#101931] to-[#0A0F1D] border-r border-white/5 text-white flex-col flex-shrink-0 z-50 transition-transform duration-500 ease-out shadow-2xl overflow-hidden
        ${isMobileMenuOpen ? 'absolute inset-y-0 left-0 flex translate-x-0' : 'hidden md:flex translate-x-0'}`}>
        
        {/* Fancy Highlight Decor */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mt-16 -mr-16 pointer-events-none"></div>

        <div className="h-16 flex items-center justify-between px-6 bg-white/5 backdrop-blur-sm border-b border-white/5 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-0.5 shadow-lg shadow-primary/20">
                <div className="w-full h-full bg-[#0B1120] rounded-md flex items-center justify-center">
                   <span className="text-secondary font-black text-[10px]">CMS</span>
                </div>
             </div>
             <h1 className="text-sm font-black tracking-widest uppercase text-white drop-shadow-md">Pesantren</h1>
          </div>
          <button onClick={closeMobileMenu} className="md:hidden text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg active:scale-95">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar relative z-10">
          <nav className="space-y-1.5">
            <Link to="/admin" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin')}`}>
              <Home className={`w-[18px] h-[18px] ${location.pathname === '/admin' ? 'text-secondary' : ''}`} />
              Dashboard
            </Link>
            
            {/* GRUP 1: PUBLIKASI */}
            <div className="pt-6 pb-2">
               <p className="px-7 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Publikasi & Berita</p>
            </div>
            
            {canAccess('posts') && (
              <>
                <Link to="/admin/posts" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/posts')}`}>
                  <Edit3 className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/posts') ? 'text-secondary' : ''}`} />
                  Berita / Pos
                </Link>
                <Link to="/admin/categories" onClick={closeMobileMenu} className={`mx-3 ml-12 flex items-center gap-3 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 ease-out ${isActive('/admin/categories')}`}>
                  <Tag className="w-[14px] h-[14px]" />
                  Kategori Berita
                </Link>
              </>
            )}

            {canAccess('pengumumans') && (
              <Link to="/admin/pengumumans" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/pengumumans')}`}>
                <Megaphone className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/pengumumans') ? 'text-secondary' : ''}`} />
                Pengumuman
              </Link>
            )}

            {canAccess('agendas') && (
              <Link to="/admin/agendas" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/agendas')}`}>
                <CalendarDays className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/agendas') ? 'text-secondary' : ''}`} />
                Agenda Kegiatan
              </Link>
            )}

            {/* GRUP 2: PROFIL LEMBAGA */}
            <div className="pt-6 pb-2">
               <p className="px-7 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Profil Lembaga</p>
            </div>

            {canAccess('pages') && (
              <Link to="/admin/pages" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/pages')}`}>
                <FileText className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/pages') ? 'text-secondary' : ''}`} />
                Laman Statis
              </Link>
            )}

            {/* GRUP 3: MEDIA & VISUAL */}
            <div className="pt-6 pb-2">
               <p className="px-7 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Media & Visual</p>
            </div>

            {canAccess('media') && (
              <Link to="/admin/media" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/media')}`}>
                <Image className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/media') ? 'text-secondary' : ''}`} />
                Pustaka Media
              </Link>
            )}

            {canAccess('videos') && (
              <Link to="/admin/videos" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/videos')}`}>
                <PlaySquare className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/videos') ? 'text-secondary' : ''}`} />
                Video Dokumentasi
              </Link>
            )}

            {canAccess('hero') && (
              <Link to="/admin/hero" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/hero')}`}>
                <LayoutPanelTop className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/hero') ? 'text-secondary' : ''}`} />
                Slider Beranda
              </Link>
            )}

            {/* GRUP 4: KOMUNIKASI */}
            <div className="pt-6 pb-2">
               <p className="px-7 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Interaksi & Pesan</p>
            </div>

            <Link to="/admin/contact-messages" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/contact-messages')}`}>
              <span className="relative">
                <Mail className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/contact-messages') ? 'text-secondary' : ''}`} />
                {unreadMsgCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full text-[7px] text-white font-black flex items-center justify-center border-2 border-[#101931]">{unreadMsgCount > 9 ? '9+' : unreadMsgCount}</span>
                )}
              </span>
              <span>Pesan Masuk</span>
              {unreadMsgCount > 0 && (
                <span className="ml-auto bg-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-500/20">{unreadMsgCount}</span>
              )}
            </Link>

            {/* GRUP 5: SISTEM */}
            <div className="pt-6 pb-2">
               <p className="px-7 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Konfigurasi Sistem</p>
            </div>
            
            {canAccess('settings') && (
              <>
                <Link to="/admin/menus" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/menus')}`}>
                  <Menu className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/menus') ? 'text-secondary' : ''}`} />
                  Navigasi Utama
                </Link>
                <Link to="/admin/settings" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/settings')}`}>
                  <Settings className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/settings') ? 'text-secondary' : ''}`} />
                  Pengaturan Umum
                </Link>
              </>
            )}
            
            {canAccess('users') && (
              <Link to="/admin/users" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/users')}`}>
                <UsersIcon className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/users') ? 'text-secondary' : ''}`} />
                Manajemen Admin
              </Link>
            )}

            {canAccess('permissions') && (
              <Link to="/admin/permissions" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/permissions')}`}>
                <ShieldCheck className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/permissions') ? 'text-secondary' : ''}`} />
                Izin & Peranan
              </Link>
            )}

            <div className="pt-6 pb-2">
               <p className="px-7 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Akun Saya</p>
            </div>

            <Link to="/admin/profile" onClick={closeMobileMenu} className={`${navItemClass} ${isActive('/admin/profile')}`}>
              <User className={`w-[18px] h-[18px] ${location.pathname.startsWith('/admin/profile') ? 'text-secondary' : ''}`} />
              Profil Akun
            </Link>

            <div className="mt-8 mb-4 px-3">
               <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-black text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-2xl transition-all duration-300 ring-1 ring-red-500/20 shadow-lg shadow-red-500/5 active:scale-95"
               >
                 <LogOut className="w-4 h-4" />
                 Keluar Sesi
               </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative bg-slate-50">
        
        {/* Topbar Glassmorphic */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-20 shrink-0 flex items-center justify-between px-6 transition-all shadow-sm">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-500 hover:text-gray-900 bg-gray-100 p-2 rounded-xl transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" target="_blank" className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors bg-gray-50 px-4 py-2 rounded-full border border-gray-200 hover:border-primary/30">
              <ExternalLink className="w-3.5 h-3.5" />
              Buka Web Publik
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
             <button className="text-gray-400 hover:text-primary outline-none relative hover:scale-110 transition-transform">
                 <Bell className="w-5 h-5" />
                 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
             </button>
             
             <div className="w-px h-6 bg-gray-200"></div>

             <Link to="/admin/profile" className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 pr-4 rounded-full group transition-all border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black shadow-inner">
                    {user?.name?.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex flex-col hidden sm:flex">
                     <span className="text-[11px] font-black tracking-widest uppercase text-gray-800 leading-tight group-hover:text-primary">{user?.name || 'Admin'}</span>
                     <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user?.role || 'Superuser'}</span>
                 </div>
             </Link>
          </div>
        </header>

        {/* Page Content area with cool gray background */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 md:p-8 relative">
           {/* Subtle background glow */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -mt-48 -mr-48"></div>
           <div className="relative z-10">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
}
