import { Megaphone, Loader2, Save, CheckCircle2, Image as ImageIcon, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../lib/utils';
import MediaSelector from '../../components/admin/MediaSelector';

interface BannerSettings {
  sidebar_banner_label: string;
  sidebar_banner_title: string;
  sidebar_banner_image: string;
}

export default function SidebarBanner() {
  const [settings, setSettings] = useState<BannerSettings>({
    sidebar_banner_label: 'Heritage V3',
    sidebar_banner_title: 'Membangun Masa Depan Berbasis Tradisi',
    sidebar_banner_image: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
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
        setSettings({
          sidebar_banner_label: response.data.sidebar_banner_label || 'Heritage V3',
          sidebar_banner_title: response.data.sidebar_banner_title || 'Membangun Masa Depan Berbasis Tradisi',
          sidebar_banner_image: response.data.sidebar_banner_image || '',
        });
      } catch (error) {
        console.error('Error fetching banner settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [isAdmin, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/settings', settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Gagal menyimpan pengaturan banner.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const onMediaSelect = (media: any) => {
    setSettings(prev => ({ ...prev, sidebar_banner_image: media.file_path }));
    setIsMediaSelectorOpen(false);
  };

  const clearImage = () => {
    setSettings(prev => ({ ...prev, sidebar_banner_image: '' }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <span className="text-gray-500 font-medium tracking-widest uppercase text-xs">Memuat Konfigurasi Banner...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Banner Promosi Sidebar</h1>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-tighter">Kelola visual dan teks kartu promosi yang muncul di bilah sisi halaman publik.</p>
        </div>
        {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Tersimpan</span>
            </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8 text-left">
        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden transition-all text-left">
            <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 flex items-center gap-3 text-left">
                <div className="p-2 bg-secondary/10 rounded-lg">
                    <Megaphone className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="font-bold text-gray-800 uppercase tracking-tight text-sm text-left">Visual & Konten Banner</h2>
            </div>
            <div className="p-8 space-y-8 text-left">
                {/* Visual Section */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 border-b border-gray-50 pb-8 text-left">
                    <div className="sm:w-1/3 text-left">
                        <label className="font-bold text-gray-800 text-sm block mb-1">Pratinjau Visual</label>
                        <p className="text-gray-400 text-[11px] leading-relaxed">Gunakan gambar vertikal (potret) untuk hasil terbaik.</p>
                    </div>
                    <div className="sm:w-2/3 flex gap-8 items-center text-left">
                        <div className="w-32 h-44 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center p-2 group hover:border-secondary transition-colors relative overflow-hidden shadow-inner cursor-pointer"
                             onClick={() => setIsMediaSelectorOpen(true)}>
                            {settings.sidebar_banner_image ? (
                                <>
                                    <img 
                                      src={getImageUrl(settings.sidebar_banner_image)} 
                                      alt="Preview" 
                                      className="w-full h-full object-cover rounded-[1.25rem] transition-transform group-hover:scale-110" 
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <Plus className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                    <span className="text-[9px] font-black text-gray-300 uppercase letter-spacing-widest">Pilih Gambar</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 flex-1 text-left">
                            <div className="flex items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsMediaSelectorOpen(true)}
                                    className="bg-primary/5 text-primary border border-primary/20 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95"
                                >
                                    Pilih Dari Media
                                </button>
                                {settings.sidebar_banner_image && (
                                    <button 
                                        type="button"
                                        onClick={clearImage}
                                        className="text-red-500 hover:text-red-700 p-2 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 italic leading-relaxed">
                                Banner ini akan muncul secara statis di bilah sisi (sidebar) website Anda.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 text-left">
                    <div className="sm:w-1/3 text-left">
                        <label className="font-bold text-gray-800 text-sm block mb-1">Isi Pesan Promosi</label>
                        <p className="text-gray-400 text-[11px] leading-relaxed">Teks ini akan muncul menimpa gambar di bagian bawah.</p>
                    </div>
                    <div className="sm:w-2/3 space-y-6 text-left">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left block">Label Atas (Aksen)</label>
                            <input 
                              type="text" 
                              name="sidebar_banner_label"
                              value={settings.sidebar_banner_label}
                              onChange={handleChange}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary font-semibold" 
                              placeholder="Misal: Heritage V3 atau Info Pendaftaran" 
                            />
                        </div>
                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left block">Judul Utama</label>
                            <textarea 
                              name="sidebar_banner_title"
                              value={settings.sidebar_banner_title}
                              onChange={handleChange}
                              rows={3}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary resize-none font-black uppercase italic leading-tight" 
                              placeholder="Masukkan kalimat promosi yang menarik..." 
                            />
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
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
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
