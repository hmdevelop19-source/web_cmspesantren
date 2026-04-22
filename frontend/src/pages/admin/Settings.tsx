import { Palette, Image as ImageIcon, MapPin, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../lib/utils';

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
}

export default function Settings() {
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/dashboard');
      return;
    }
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        // Pluck the values or set them directly if the API returns a key-value pair object
        setSettings((prev: SettingsData) => ({
            ...prev,
            ...response.data
        }));
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/settings', settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev: SettingsData) => ({ ...prev, [name]: value }));
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
            <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Pengaturan Situs & Tampilan</h1>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-tighter">Kelola identitas merek, tema warna, dan informasi kontak publik.</p>
        </div>
        {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Tersimpan</span>
            </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Identitas Situs & Logo */}
        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden transition-all">
            <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-bold text-gray-800 uppercase tracking-tight text-sm">Identitas Situs & Logo</h2>
            </div>
            <div className="p-8 space-y-8">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 border-b border-gray-50 pb-8">
                    <div className="sm:w-1/3">
                        <label className="font-bold text-gray-800 text-sm">Logo Pesantren</label>
                        <p className="text-gray-400 text-[11px] mt-1 leading-relaxed">Format PNG transparan berukuran 512x512px sangat direkomendasikan.</p>
                    </div>
                    <div className="sm:w-2/3 flex gap-8 items-center">
                        <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-3 group hover:border-primary transition-colors cursor-pointer relative overflow-hidden">
                            {settings.site_logo ? (
                                <img src={getImageUrl(settings.site_logo)} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-[10px] font-black text-gray-300 uppercase letter-spacing-widest">Logo</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <input 
                              type="text" 
                              name="site_logo" 
                              value={settings.site_logo} 
                              onChange={handleChange}
                              placeholder="URL Logo (contoh: /storage/logo.png)" 
                              className="w-full sm:w-80 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-primary" 
                            />
                            <p className="text-[10px] text-gray-400 italic">Gunakan URL dari Media Lab</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
                    <div className="sm:w-1/3">
                        <label className="font-bold text-gray-800 text-sm">Informasi Dasar</label>
                    </div>
                    <div className="sm:w-2/3 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Situs</label>
                            <input 
                              type="text" 
                              name="site_name"
                              value={settings.site_name}
                              onChange={handleChange}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-semibold" 
                              placeholder="Judul Website Utama" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slogan / Tagline</label>
                            <input 
                              type="text" 
                              name="site_tagline"
                              value={settings.site_tagline}
                              onChange={handleChange}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" 
                              placeholder="Deskripsi singkat layanan" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deskripsi Footer / Tentang Kami</label>
                            <textarea 
                              name="site_description"
                              value={settings.site_description || ''}
                              onChange={handleChange}
                              rows={3}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none" 
                              placeholder="Deskripsi singkat yang tampil di bagian bawah website" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. Warna & Penampilan */}
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
                            <input 
                              type="color" 
                              name="primary_color"
                              value={settings.primary_color}
                              onChange={handleChange}
                              className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-lg p-0 outline-none ring-1 ring-gray-100" 
                            />
                            <input 
                              type="text" 
                              name="primary_color"
                              value={settings.primary_color}
                              onChange={handleChange}
                              className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-primary" 
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <label className="font-bold text-gray-800 text-sm">Warna Aksen (Secondary)</label>
                            <p className="text-gray-400 text-[10px] mt-0.5">Warna tombol dan sorotan.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <input 
                              type="color" 
                              name="secondary_color"
                              value={settings.secondary_color}
                              onChange={handleChange}
                              className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-lg p-0 outline-none ring-1 ring-gray-100" 
                            />
                            <input 
                              type="text" 
                              name="secondary_color"
                              value={settings.secondary_color}
                              onChange={handleChange}
                              className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-primary" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Kontak & Detail Alamat */}
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
                        <textarea 
                          rows={3} 
                          name="site_address"
                          value={settings.site_address || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                          placeholder="Masukkan alamat lengkap..."
                        ></textarea>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 border-t border-gray-50 pt-8">
                    <div className="sm:w-1/3">
                        <label className="font-bold text-gray-800 text-sm">Saluran Komunikasi</label>
                    </div>
                    <div className="sm:w-2/3 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Resmi</label>
                            <input 
                              type="email" 
                              name="contact_email"
                              value={settings.contact_email}
                              onChange={handleChange}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" 
                              placeholder="info@lembaga.ac.id" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nomor Telepon / WA</label>
                            <input 
                              type="text" 
                              name="contact_phone"
                              value={settings.contact_phone}
                              onChange={handleChange}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" 
                              placeholder="+62 8123 ..." 
                            />
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

        <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-primary text-white hover:bg-primary-dark px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 disabled:opacity-70 group"
            >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>
        </div>
      </form>
    </div>
  );
}
