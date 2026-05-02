import { Loader2, Save, CheckCircle2, Image as ImageIcon, Plus } from 'lucide-react';
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
  site_google_maps?: string;
  header_logo_style: 'logo_name' | 'landscape';
  site_logo_landscape: string;
  header_button_label: string;
  header_button_url: string;
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
    site_google_maps: '',
    header_logo_style: 'logo_name',
    site_logo_landscape: '',
    header_button_label: 'Portal Admin',
    header_button_url: '/login',
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [activeMediaField, setActiveMediaField] = useState<'site_logo' | 'site_favicon' | 'sidebar_banner_image' | 'site_logo_landscape' | null>(null);
  
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

  const openMediaSelector = (field: 'site_logo' | 'site_favicon' | 'sidebar_banner_image' | 'site_logo_landscape') => {
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

  const clearImage = (field: 'site_logo' | 'site_favicon' | 'sidebar_banner_image' | 'site_logo_landscape') => {
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
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan Sistem</h1>
          <p className="text-sm text-slate-500 mt-1">Konfigurasi identitas, kontak, dan tampilan utama website pesantren</p>
        </div>

        <div className="flex items-center gap-3">
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold">Tersimpan</span>
            </div>
          )}
          <button 
            type="button" 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('umum')}
          className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'umum' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Umum & Kontak
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'header' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Identitas & Header
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sidebar')}
          className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'sidebar' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Banner Sidebar
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* TAB UMUM */}
        <div className={activeTab === 'umum' ? 'block space-y-8' : 'hidden'}>
            {/* Tema & Skema Warna */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
                    <h2 className="text-sm font-bold text-slate-800">Tema & Skema Warna</h2>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700">Warna Utama (Primary)</label>
                                <p className="text-xs text-slate-400 mt-0.5">Warna untuk navigasi dan elemen utama.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <input type="color" name="primary_color" value={settings.primary_color} onChange={handleChange} className="w-12 h-12 rounded-lg cursor-pointer border border-slate-200 p-1" />
                                <input type="text" name="primary_color" value={settings.primary_color} onChange={handleChange} className="w-32 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2 text-xs font-mono font-bold" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700">Warna Aksen (Secondary)</label>
                                <p className="text-xs text-slate-400 mt-0.5">Warna untuk tombol dan sorotan.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <input type="color" name="secondary_color" value={settings.secondary_color} onChange={handleChange} className="w-12 h-12 rounded-lg cursor-pointer border border-slate-200 p-1" />
                                <input type="text" name="secondary_color" value={settings.secondary_color} onChange={handleChange} className="w-32 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2 text-xs font-mono font-bold" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informasi Kontak & Lokasi */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
                    <h2 className="text-sm font-bold text-slate-800">Informasi Kontak & Lokasi</h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Alamat Lengkap</label>
                            <p className="text-xs text-slate-400 mt-1">Alamat fisik kantor atau kampus pesantren.</p>
                        </div>
                        <div className="md:col-span-2">
                            <textarea rows={3} name="site_address" value={settings.site_address || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 transition-all resize-none" placeholder="Masukkan alamat lengkap..."></textarea>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Kontak Resmi</label>
                            <p className="text-xs text-slate-400 mt-1">Informasi komunikasi publik.</p>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                                    <input type="email" name="contact_email" value={settings.contact_email} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/10 transition-all" placeholder="info@lembaga.ac.id" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telepon / WhatsApp</label>
                                    <input type="text" name="contact_phone" value={settings.contact_phone} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/10 transition-all" placeholder="+62 8123 ..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Media Sosial</label>
                            <p className="text-xs text-slate-400 mt-1">Tautan profil lembaga di berbagai platform.</p>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instagram</label>
                                <input type="text" name="instagram_url" value={settings.instagram_url || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/10 transition-all" placeholder="https://instagram.com/..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Facebook</label>
                                <input type="text" name="facebook_url" value={settings.facebook_url || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/10 transition-all" placeholder="https://facebook.com/..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">YouTube</label>
                                <input type="text" name="youtube_url" value={settings.youtube_url || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/10 transition-all" placeholder="https://youtube.com/..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Twitter / X</label>
                                <input type="text" name="twitter_url" value={settings.twitter_url || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/10 transition-all" placeholder="https://twitter.com/..." />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Google Maps Embed</label>
                            <p className="text-xs text-slate-400 mt-1">Sematkan peta lokasi pesantren.</p>
                        </div>
                        <div className="md:col-span-2">
                            <textarea rows={3} name="site_google_maps" value={settings.site_google_maps || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-3 text-[10px] font-mono focus:ring-2 focus:ring-primary/10 transition-all resize-none" placeholder='Contoh: <iframe src="https://www.google.com/maps/embed?..." ...></iframe>'></textarea>
                            <p className="text-[10px] text-slate-400 mt-2 italic text-right">Tips: Cari lokasi di Google Maps &rarr; Bagikan &rarr; Sematkan Peta &rarr; Salin HTML</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistik Dampak */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
                    <h2 className="text-sm font-bold text-slate-800">Statistik Pencapaian</h2>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Santri Aktif</label>
                            <input type="text" name="stats_santri" value={settings.stats_santri || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-bold text-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asatidz/ah</label>
                            <input type="text" name="stats_asatidz" value={settings.stats_asatidz || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-bold text-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Alumni</label>
                            <input type="text" name="stats_alumni" value={settings.stats_alumni || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-bold text-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institusi</label>
                            <input type="text" name="stats_institusi" value={settings.stats_institusi || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-bold text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* TAB HEADER & IDENTITAS */}
        <div className={activeTab === 'header' ? 'block space-y-8' : 'hidden'}>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
                    <h2 className="text-sm font-bold text-slate-800">Logo & Visual</h2>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Logo Utama</label>
                            <p className="text-xs text-slate-400 mt-1">Muncul pada navigasi utama website.</p>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-6">
                            <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-2 relative group overflow-hidden cursor-pointer" onClick={() => openMediaSelector('site_logo')}>
                                {settings.site_logo ? (
                                    <img src={getImageUrl(settings.site_logo)} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-200" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <button type="button" onClick={() => openMediaSelector('site_logo')} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Pilih Logo</button>
                                {settings.site_logo && <button type="button" onClick={() => clearImage('site_logo')} className="block text-[10px] font-bold text-red-500 hover:underline">Hapus Logo</button>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Logo Landscape (Opsi 2)</label>
                            <p className="text-xs text-slate-400 mt-1">Digunakan jika memilih gaya logo penuh.</p>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-6">
                            <div className="w-48 h-20 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-2 relative group overflow-hidden cursor-pointer" onClick={() => openMediaSelector('site_logo_landscape')}>
                                {settings.site_logo_landscape ? (
                                    <img src={getImageUrl(settings.site_logo_landscape)} alt="Logo Landscape" className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-200" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <button type="button" onClick={() => openMediaSelector('site_logo_landscape')} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Pilih Gambar</button>
                                {settings.site_logo_landscape && <button type="button" onClick={() => clearImage('site_logo_landscape')} className="block text-[10px] font-bold text-red-500 hover:underline">Hapus Gambar</button>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Ikon Situs (Favicon)</label>
                            <p className="text-xs text-slate-400 mt-1">Muncul pada tab browser.</p>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-6">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-2 relative group overflow-hidden cursor-pointer" onClick={() => openMediaSelector('site_favicon')}>
                                {settings.site_favicon ? (
                                    <img src={getImageUrl(settings.site_favicon)} alt="Favicon" className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-slate-200" />
                                )}
                            </div>
                            <button type="button" onClick={() => openMediaSelector('site_favicon')} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Ganti Ikon</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
                    <h2 className="text-sm font-bold text-slate-800">Gaya & Tampilan Header</h2>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Gaya Logo Header</label>
                            <p className="text-xs text-slate-400 mt-1">Pilih cara identitas ditampilkan.</p>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${settings.header_logo_style === 'logo_name' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}>
                                <input type="radio" name="header_logo_style" value="logo_name" checked={settings.header_logo_style === 'logo_name'} onChange={handleChange} className="sr-only" />
                                <span className="text-sm font-bold text-slate-800 mb-1">Opsi 1: Logo & Nama</span>
                                <span className="text-[10px] text-slate-500">Logo kecil disandingkan dengan teks nama situs.</span>
                            </label>
                            <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${settings.header_logo_style === 'landscape' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}>
                                <input type="radio" name="header_logo_style" value="landscape" checked={settings.header_logo_style === 'landscape'} onChange={handleChange} className="sr-only" />
                                <span className="text-sm font-bold text-slate-800 mb-1">Opsi 2: Logo Landscape</span>
                                <span className="text-[10px] text-slate-500">Hanya menampilkan satu gambar logo memanjang.</span>
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Nama Situs (Singkatan)</label>
                        </div>
                        <div className="md:col-span-2">
                            <input type="text" name="site_name" value={settings.site_name || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-800" placeholder="Contoh: CMS PESANTREN" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Nama Lengkap Institusi</label>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <textarea rows={2} name="site_full_name" value={settings.site_full_name || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 transition-all resize-none" placeholder="Masukkan nama lengkap lembaga..."></textarea>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slogan / Tagline</label>
                                <input type="text" name="site_tagline" value={settings.site_tagline} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm" placeholder="Deskripsi singkat layanan" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Deskripsi Footer</label>
                            <p className="text-xs text-slate-400 mt-1">Informasi singkat tentang kami di bagian bawah website.</p>
                        </div>
                        <div className="md:col-span-2">
                            <textarea name="site_description" value={settings.site_description || ''} onChange={handleChange} rows={3} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 transition-all resize-none" placeholder="Deskripsi singkat yang tampil di bagian bawah website" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Bilah Atas (Top Bar)</label>
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" name="hide_top_bar" checked={settings.hide_top_bar === 'true'} onChange={handleChange} className="sr-only" />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${settings.hide_top_bar === 'true' ? 'bg-primary' : 'bg-slate-300'}`}></div>
                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.hide_top_bar === 'true' ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">Sembunyikan bilah atas putih (Mode Minimalis)</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Tombol Aksi Utama</label>
                            <p className="text-xs text-slate-400 mt-1">Atur teks dan tujuan tombol di header.</p>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Label Tombol</label>
                                <input type="text" name="header_button_label" value={settings.header_button_label || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-bold" placeholder="Portal Admin" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link Tujuan (URL)</label>
                                <input type="text" name="header_button_url" value={settings.header_button_url || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm" placeholder="/login atau https://..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* TAB SIDEBAR BANNER */}
        <div className={activeTab === 'sidebar' ? 'block space-y-8' : 'hidden'}>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
                    <h2 className="text-sm font-bold text-slate-800">Visual & Konten Banner Sidebar</h2>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Gambar Banner</label>
                            <p className="text-xs text-slate-400 mt-1">Gunakan orientasi potret untuk hasil maksimal.</p>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-8">
                            <div className="w-32 h-44 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-2 relative group overflow-hidden cursor-pointer" onClick={() => openMediaSelector('sidebar_banner_image')}>
                                {settings.sidebar_banner_image ? (
                                    <img src={getImageUrl(settings.sidebar_banner_image)} alt="Banner" className="w-full h-full object-cover rounded" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-200" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button type="button" onClick={() => openMediaSelector('sidebar_banner_image')} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Pilih Gambar</button>
                                {settings.sidebar_banner_image && <button type="button" onClick={() => clearImage('sidebar_banner_image')} className="block text-[10px] font-bold text-red-500 hover:underline">Hapus Gambar</button>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
                        <div className="md:col-span-1">
                            <label className="text-sm font-bold text-slate-700">Konten Teks Banner</label>
                        </div>
                        <div className="md:col-span-2 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Label Aksen</label>
                                <input type="text" name="sidebar_banner_label" value={settings.sidebar_banner_label || ''} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-semibold" placeholder="Misal: Info Pendaftaran" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Judul Utama</label>
                                <textarea name="sidebar_banner_title" value={settings.sidebar_banner_title || ''} onChange={handleChange} rows={3} className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all resize-none" placeholder="Masukkan kalimat promosi..." />
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
