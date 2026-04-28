import { Palette, Image as ImageIcon, MapPin, Loader2, Save, CheckCircle2, LayoutPanelTop, Megaphone, Plus, X, Settings as SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../lib/utils';
import MediaSelector from '../../components/admin/MediaSelector';

interface SettingsData {
  site_name: string;
  site_tagline: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  site_logo: string;
  site_address?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  stats_santri?: string;
  stats_asatidz?: string;
  stats_alumni?: string;
  stats_institusi?: string;
  site_description?: string;
  site_full_name: string;
  site_favicon: string;
  header_right_text: string;
  hide_top_bar: string;
  sidebar_banner_label: string;
  sidebar_banner_title: string;
  sidebar_banner_image: string;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'umum' | 'header' | 'sidebar'>('umum');
  const [settings, setSettings] = useState<SettingsData>({
    site_name: '',
    site_tagline: '',
    primary_color: '#0B5C3B',
    secondary_color: '#F4C41B',
    contact_email: '',
    contact_phone: '',
    site_logo: '',
    site_address: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: '',
    stats_santri: '3,275',
    stats_asatidz: '214',
    stats_alumni: '12.4k',
    stats_institusi: '6',
    site_description: '',
    site_full_name: '',
    site_favicon: '',
    header_right_text: '',
    hide_top_bar: 'false',
    sidebar_banner_label: 'Heritage V3',
    sidebar_banner_title: 'Membangun Masa Depan Berbasis Tradisi',
    sidebar_banner_image: '',
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [activeMediaField, setActiveMediaField] = useState<'site_logo' | 'site_favicon' | 'sidebar_banner_image' | null>(null);
  
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  const { data: initialSettings, isLoading } = useQuery<SettingsData>({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    },
    enabled: isAdmin()
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({
        ...prev,
        ...initialSettings
      }));
    }
  }, [initialSettings]);

  const saveMutation = useMutation({
    mutationFn: (data: SettingsData) => api.post('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: () => {
      alert('Gagal menyimpan pengaturan.');
    }
  });

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    saveMutation.mutate(settings);
  };

  const isSaving = saveMutation.isPending;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked.toString() : value;
    setSettings((prev) => ({ ...prev, [name]: finalValue }));
  };

  const openMediaSelector = (field: 'site_logo' | 'site_favicon' | 'sidebar_banner_image') => {
    setActiveMediaField(field);
    setIsMediaSelectorOpen(true);
  };

  const onMediaSelect = (media: any) => {
    if (activeMediaField) {
      setSettings((prev) => ({ ...prev, [activeMediaField]: media.file_path }));
    }
    setIsMediaSelectorOpen(false);
    setActiveMediaField(null);
  };

  const clearImage = (field: 'site_logo' | 'site_favicon' | 'sidebar_banner_image') => {
    setSettings((prev) => ({ ...prev, [field]: '' }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <span className="text-gray-500 font-medium tracking-widest uppercase text-xs">Menyelaraskan Konfigurasi...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-normal text-gray-800 tracking-tight flex items-center gap-2">
               <SettingsIcon className="w-6 h-6 text-primary" /> Pengaturan & Tampilan
            </h1>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-tighter">Kelola identitas merek, header, dan banner sidebar.</p>
        </div>
        <div className="flex items-center gap-4">
            {showSuccess && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 animate-bounce">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Tersimpan</span>
                </div>
            )}
            <button 
              type="button" 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-white hover:bg-primary-dark px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-8 bg-white/50 backdrop-blur-sm sticky top-0 z-10 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('umum')}
          className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative whitespace-nowrap ${activeTab === 'umum' ? 'text-primary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
        >
          <SettingsIcon className={`w-4 h-4 ${activeTab === 'umum' ? 'text-secondary' : 'text-gray-300'}`} />
          Umum & Kontak
          {activeTab === 'umum' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative whitespace-nowrap ${activeTab === 'header' ? 'text-primary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
        >
          <LayoutPanelTop className={`w-4 h-4 ${activeTab === 'header' ? 'text-secondary' : 'text-gray-300'}`} />
          Identitas & Header
          {activeTab === 'header' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sidebar')}
          className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative whitespace-nowrap ${activeTab === 'sidebar' ? 'text-primary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
        >
          <Megaphone className={`w-4 h-4 ${activeTab === 'sidebar' ? 'text-secondary' : 'text-gray-300'}`} />
          Banner Sidebar
          {activeTab === 'sidebar' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* TAB UMUM */}
        <div className={activeTab === 'umum' ? 'block space-y-8' : 'hidden'}>
            {/* Tema & Skema Warna */}
            <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Palette className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Tema & Skema Warna</h2>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label className="font-bold text-gray-800 text-sm">Warna Utama (Primary)</label>
                                <p className="text-gray-400 text-[10px] mt-0.5">Warna navigasi dan blok utama.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <input type="color" name="primary_color" value={settings.primary_color} onChange={handleChange} className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-lg p-0 outline-none ring-1 ring-gray-100" />
                                <input type="text" name="primary_color" value={settings.primary_color} onChange={handleChange} className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-primary" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label className="font-bold text-gray-800 text-sm">Warna Aksen (Secondary)</label>
                                <p className="text-gray-400 text-[10px] mt-0.5">Warna tombol dan sorotan.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <input type="color" name="secondary_color" value={settings.secondary_color} onChange={handleChange} className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-lg p-0 outline-none ring-1 ring-gray-100" />
                                <input type="text" name="secondary_color" value={settings.secondary_color} onChange={handleChange} className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informasi Kontak & Lokasi */}
            <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Informasi Kontak & Lokasi</h2>
                </div>
                <div className="p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
                        <div className="sm:w-1/3">
                            <label className="font-bold text-gray-800 text-sm">Alamat Fisik</label>
                        </div>
                        <div className="sm:w-2/3">
                            <textarea rows={3} name="site_address" value={settings.site_address || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none" placeholder="Masukkan alamat lengkap..."></textarea>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 border-t border-gray-50 pt-8">
                        <div className="sm:w-1/3">
                            <label className="font-bold text-gray-800 text-sm">Saluran Komunikasi</label>
                        </div>
                        <div className="sm:w-2/3 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Resmi</label>
                                <input type="email" name="contact_email" value={settings.contact_email} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" placeholder="info@lembaga.ac.id" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nomor Telepon / WA</label>
                                <input type="text" name="contact_phone" value={settings.contact_phone} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" placeholder="+62 8123 ..." />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 border-t border-gray-50 pt-8">
                        <div className="sm:w-1/3">
                            <label className="font-bold text-gray-800 text-sm">Media Sosial</label>
                            <p className="text-gray-400 text-[10px] mt-1">Tautan lengkap ke profil lembaga.</p>
                        </div>
                        <div className="sm:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instagram URL</label>
                                <input type="text" name="instagram_url" value={settings.instagram_url || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary" placeholder="https://instagram.com/..." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Facebook URL</label>
                                <input type="text" name="facebook_url" value={settings.facebook_url || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary" placeholder="https://facebook.com/..." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">YouTube URL</label>
                                <input type="text" name="youtube_url" value={settings.youtube_url || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary" placeholder="https://youtube.com/..." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Twitter/X URL</label>
                                <input type="text" name="twitter_url" value={settings.twitter_url || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary" placeholder="https://twitter.com/..." />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 border-t border-primary/10 pt-8 bg-primary/5 -mx-8 px-8 pb-8 rounded-b-xl mt-4">
                        <div className="sm:w-1/3">
                            <label className="font-bold text-primary text-sm uppercase tracking-tight italic">Statistik Dampak</label>
                            <p className="text-gray-500 text-[10px] mt-1">Angka pencapaian yang tampil menonjol di halaman depan.</p>
                        </div>
                        <div className="sm:w-2/3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Santri Aktif</label>
                                <input type="text" name="stats_santri" value={settings.stats_santri || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-primary focus:border-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Asatidz/ah</label>
                                <input type="text" name="stats_asatidz" value={settings.stats_asatidz || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-primary focus:border-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Alumni</label>
                                <input type="text" name="stats_alumni" value={settings.stats_alumni || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-primary focus:border-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Institusi</label>
                                <input type="text" name="stats_institusi" value={settings.stats_institusi || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-primary focus:border-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* TAB HEADER & IDENTITAS */}
        <div className={activeTab === 'header' ? 'block space-y-8' : 'hidden'}>
            <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ImageIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Logo & Favicon</h2>
                </div>
                <div className="p-8 space-y-8">
                    {/* Logo Section */}
                    <div className="flex flex-col sm:flex-row gap-8">
                        <div className="sm:w-1/3">
                            <span className="font-bold text-gray-800 text-sm block mb-1">Logo Institusi</span>
                            <p className="text-gray-400 text-[11px] leading-relaxed">Muncul di pojok kiri atas navigasi.</p>
                        </div>
                        <div className="sm:w-2/3 flex items-center gap-8">
                            <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden group cursor-pointer" onClick={() => openMediaSelector('site_logo')}>
                                {settings.site_logo ? (
                                    <>
                                        <img src={getImageUrl(settings.site_logo)} alt="Logo Preview" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon className="w-6 h-6 text-white" /></div>
                                    </>
                                ) : (
                                    <Plus className="w-8 h-8 text-gray-200" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => openMediaSelector('site_logo')} className="bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95">Pilih Logo</button>
                                    {settings.site_logo && <button type="button" onClick={() => clearImage('site_logo')} className="text-red-500 hover:text-red-700 transition-colors"><X className="w-4 h-4" /></button>}
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Format PNG transparan sangat disarankan.</p>
                            </div>
                        </div>
                    </div>
                    {/* Favicon Section */}
                    <div className="flex flex-col sm:flex-row gap-8 border-t border-gray-50 pt-8">
                        <div className="sm:w-1/3">
                            <span className="font-bold text-gray-800 text-sm block mb-1">Ikon Situs (Favicon)</span>
                            <p className="text-gray-400 text-[11px] leading-relaxed">Muncul di tab browser. Gunakan ukuran persegi.</p>
                        </div>
                        <div className="sm:w-2/3 flex items-center gap-8">
                            <div className="w-12 h-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-2 relative overflow-hidden group cursor-pointer" onClick={() => openMediaSelector('site_favicon')}>
                                {settings.site_favicon ? (
                                    <>
                                        <img src={getImageUrl(settings.site_favicon)} alt="Favicon Preview" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon className="w-4 h-4 text-white" /></div>
                                    </>
                                ) : (
                                    <Plus className="w-4 h-4 text-gray-200" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => openMediaSelector('site_favicon')} className="bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95">Pilih Ikon</button>
                                    {settings.site_favicon && <button type="button" onClick={() => clearImage('site_favicon')} className="text-red-500 hover:text-red-700 transition-colors"><X className="w-4 h-4" /></button>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <LayoutPanelTop className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Teks & Tata Letak Header</h2>
                </div>
                <div className="p-8 space-y-8">
                    {/* Nama Singkat (Singkatan) */}
                    <div className="flex flex-col sm:flex-row gap-8">
                       <div className="sm:w-1/3">
                          <span className="font-bold text-gray-800 text-sm block mb-1">Nama Singkat Situs</span>
                          <p className="text-gray-400 text-[11px] leading-relaxed">Judul website utama atau singkatan instansi.</p>
                       </div>
                       <div className="sm:w-2/3">
                          <input type="text" name="site_name" value={settings.site_name || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary font-bold uppercase tracking-tight" placeholder="Contoh: CMS PESANTREN" />
                       </div>
                    </div>

                    {/* Nama Lengkap Lembaga */}
                    <div className="flex flex-col sm:flex-row gap-8 border-t border-gray-50 pt-8">
                       <div className="sm:w-1/3">
                          <span className="font-bold text-gray-800 text-sm block mb-1">Nama Lengkap Institusi</span>
                          <p className="text-gray-400 text-[11px] leading-relaxed">Teks di bawah nama singkat (tagline/informasi tambahan).</p>
                       </div>
                       <div className="sm:w-2/3 space-y-4">
                          <textarea rows={2} name="site_full_name" value={settings.site_full_name || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none leading-relaxed" placeholder="Masukkan nama lengkap lembaga..."></textarea>
                          
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slogan / Tagline Pendek</label>
                              <input type="text" name="site_tagline" value={settings.site_tagline} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" placeholder="Deskripsi singkat layanan" />
                          </div>
                       </div>
                    </div>

                    {/* Teks Deskripsi */}
                    <div className="flex flex-col sm:flex-row gap-8 border-t border-gray-50 pt-8">
                        <div className="sm:w-1/3">
                            <span className="font-bold text-gray-800 text-sm block mb-1">Deskripsi & Tentang Kami</span>
                            <p className="text-gray-400 text-[11px] leading-relaxed">Muncul di area footer.</p>
                        </div>
                        <div className="sm:w-2/3">
                            <textarea name="site_description" value={settings.site_description || ''} onChange={handleChange} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none" placeholder="Deskripsi singkat yang tampil di bagian bawah website" />
                        </div>
                    </div>

                    {/* Teks Sebelah Kanan */}
                    <div className="flex flex-col sm:flex-row gap-8 border-t border-gray-50 pt-8">
                       <div className="sm:w-1/3">
                          <span className="font-bold text-gray-800 text-sm block mb-1">Teks Sisi Kanan (Desktop)</span>
                          <p className="text-gray-400 text-[11px] leading-relaxed">Teks kecil di bagian kanan atas bar berwarna putih.</p>
                       </div>
                       <div className="sm:w-2/3">
                          <input type="text" name="header_right_text" value={settings.header_right_text || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary uppercase tracking-widest text-[11px]" placeholder="MASUKKAN TEKS OPSIONAL" />
                       </div>
                    </div>

                    {/* Opsi Tata Letak */}
                    <div className="flex flex-col sm:flex-row gap-8 bg-gray-50/50 border-t border-gray-50 pt-8 -mx-8 px-8 pb-8 rounded-b-2xl mt-4">
                       <div className="sm:w-1/3">
                          <span className="font-bold text-gray-800 text-sm">Opsi Tampilan Header</span>
                       </div>
                       <div className="sm:w-2/3">
                          <label className="flex items-center gap-3 cursor-pointer group">
                             <div className="relative">
                                <input type="checkbox" name="hide_top_bar" checked={settings.hide_top_bar === 'true'} onChange={handleChange} className="sr-only" />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${settings.hide_top_bar === 'true' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.hide_top_bar === 'true' ? 'translate-x-4' : ''}`}></div>
                             </div>
                             <span className="text-sm font-bold text-gray-700">Sembunyikan Bilah Atas Putih (Gaya Minimalis)</span>
                          </label>
                          <p className="text-xs text-gray-400 mt-2 leading-relaxed">Jika aktif, logo akan menyatu dengan navigasi utama di bilah hijau.</p>
                       </div>
                    </div>
                </div>
            </div>
        </div>

        {/* TAB SIDEBAR BANNER */}
        <div className={activeTab === 'sidebar' ? 'block space-y-8' : 'hidden'}>
            <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden transition-all">
                <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                        <Megaphone className="w-5 h-5 text-secondary" />
                    </div>
                    <h2 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Visual & Konten Banner Sidebar</h2>
                </div>
                <div className="p-8 space-y-8">
                    {/* Visual Section */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 border-b border-gray-50 pb-8">
                        <div className="sm:w-1/3">
                            <label className="font-bold text-gray-800 text-sm block mb-1">Pratinjau Visual</label>
                            <p className="text-gray-400 text-[11px] leading-relaxed">Gunakan gambar vertikal (potret) untuk hasil terbaik.</p>
                        </div>
                        <div className="sm:w-2/3 flex gap-8 items-center">
                            <div className="w-32 h-44 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center p-2 group hover:border-secondary transition-colors relative overflow-hidden shadow-inner cursor-pointer" onClick={() => openMediaSelector('sidebar_banner_image')}>
                                {settings.sidebar_banner_image ? (
                                    <>
                                        <img src={getImageUrl(settings.sidebar_banner_image)} alt="Preview" className="w-full h-full object-cover rounded-[1.25rem] transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon className="w-6 h-6 text-white" /></div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <Plus className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                        <span className="text-[9px] font-black text-gray-300 uppercase letter-spacing-widest">Pilih Gambar</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => openMediaSelector('sidebar_banner_image')} className="bg-primary/5 text-primary border border-primary/20 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95">Pilih Dari Media</button>
                                    {settings.sidebar_banner_image && <button type="button" onClick={() => clearImage('sidebar_banner_image')} className="text-red-500 hover:text-red-700 p-2 transition-colors"><X className="w-4 h-4" /></button>}
                                </div>
                                <p className="text-[10px] text-gray-400 italic leading-relaxed">Banner ini akan muncul secara statis di bilah sisi (sidebar) website Anda.</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
                        <div className="sm:w-1/3">
                            <label className="font-bold text-gray-800 text-sm block mb-1">Isi Pesan Promosi</label>
                            <p className="text-gray-400 text-[11px] leading-relaxed">Teks ini akan muncul menimpa gambar di bagian bawah.</p>
                        </div>
                        <div className="sm:w-2/3 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Label Atas (Aksen)</label>
                                <input type="text" name="sidebar_banner_label" value={settings.sidebar_banner_label || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary font-semibold" placeholder="Misal: Heritage V3 atau Info Pendaftaran" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Judul Utama</label>
                                <textarea name="sidebar_banner_title" value={settings.sidebar_banner_title || ''} onChange={handleChange} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary resize-none font-black uppercase italic leading-tight" placeholder="Masukkan kalimat promosi yang menarik..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </form>

      <MediaSelector 
         isOpen={isMediaSelectorOpen}
         onClose={() => setIsMediaSelectorOpen(false)}
         onSelect={onMediaSelect}
      />
    </div>
  );
}
