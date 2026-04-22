import { LayoutPanelTop, ImageIcon, Loader2, CheckCircle2, Save, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { getImageUrl } from '../../lib/utils';
import MediaSelector from '../../components/admin/MediaSelector';

export default function HeaderSettings() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  
  const [settings, setSettings] = useState<any>({
    site_name: '',
    site_full_name: '',
    site_logo: '',
    site_favicon: '',
    header_right_text: '',
    hide_top_bar: 'false'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [activeMediaField, setActiveMediaField] = useState<'site_logo' | 'site_favicon' | null>(null);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/dashboard');
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings((prev: any) => ({
          ...prev,
          ...response.data
        }));
      } catch (error) {
        console.error('Error fetching header settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [isAdmin, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked.toString() : value;
    setSettings((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/settings', settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Gagal menyimpan pengaturan header.');
    } finally {
      setIsSaving(false);
    }
  };

  const openMediaSelector = (field: 'site_logo' | 'site_favicon') => {
    setActiveMediaField(field);
    setIsMediaSelectorOpen(true);
  };

  const onMediaSelect = (media: any) => {
    if (activeMediaField) {
      setSettings((prev: any) => ({ ...prev, [activeMediaField]: media.file_path }));
    }
    setIsMediaSelectorOpen(false);
    setActiveMediaField(null);
  };

  const clearImage = (field: 'site_logo' | 'site_favicon') => {
    setSettings((prev: any) => ({ ...prev, [field]: '' }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <span className="text-gray-500 font-medium tracking-widest uppercase text-xs text-left">Menyelaraskan Header...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div className="text-left">
          <h1 className="text-2xl font-normal text-gray-800 flex items-center gap-2 text-left">
             <LayoutPanelTop className="w-6 h-6 text-primary" /> Pengaturan Header & Identitas
          </h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-tighter text-left">Kelola visual identitas yang muncul di bagian atas website.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Tersimpan</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden text-left">
         <form onSubmit={handleSave} className="divide-y divide-gray-100 text-left">
            
            {/* Logo Section */}
            <div className="p-8 flex flex-col sm:flex-row gap-8 text-left">
               <div className="sm:w-1/3 text-left">
                  <span className="font-bold text-gray-800 text-sm block mb-1">Logo Institusi</span>
                  <p className="text-gray-400 text-[11px] leading-relaxed">Muncul di pojok kiri atas. Gunakan format PNG transparan.</p>
               </div>
               <div className="sm:w-2/3 flex items-center gap-8 text-left">
                  <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden group cursor-pointer"
                       onClick={() => openMediaSelector('site_logo')}>
                     {settings.site_logo ? (
                        <>
                           <img src={getImageUrl(settings.site_logo)} alt="Logo Preview" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-white" />
                           </div>
                        </>
                     ) : (
                        <Plus className="w-8 h-8 text-gray-200" />
                     )}
                  </div>
                  <div className="flex-1 flex flex-col gap-3 text-left">
                     <div className="flex items-center gap-2 text-left">
                        <button 
                           type="button"
                           onClick={() => openMediaSelector('site_logo')}
                           className="bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                           Pilih Logo
                        </button>
                        {settings.site_logo && (
                           <button type="button" onClick={() => clearImage('site_logo')} className="text-red-500 hover:text-red-700 transition-colors">
                              <X className="w-4 h-4" />
                           </button>
                        )}
                     </div>
                     <p className="text-[10px] text-gray-400 italic">Format PNG transparan sangat disarankan.</p>
                  </div>
               </div>
            </div>

            {/* Favicon Section */}
            <div className="p-8 flex flex-col sm:flex-row gap-8 text-left">
               <div className="sm:w-1/3 text-left">
                  <span className="font-bold text-gray-800 text-sm block mb-1">Ikon Situs (Favicon)</span>
                  <p className="text-gray-400 text-[11px] leading-relaxed">Muncul di tab browser. Gunakan ukuran persegi (misal: 32x32px).</p>
               </div>
               <div className="sm:w-2/3 flex items-center gap-8 text-left">
                  <div className="w-12 h-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-2 relative overflow-hidden group cursor-pointer"
                       onClick={() => openMediaSelector('site_favicon')}>
                     {settings.site_favicon ? (
                        <>
                           <img src={getImageUrl(settings.site_favicon)} alt="Favicon Preview" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-white" />
                           </div>
                        </>
                     ) : (
                        <Plus className="w-4 h-4 text-gray-200" />
                     )}
                  </div>
                  <div className="flex-1 flex flex-col gap-3 text-left">
                     <div className="flex items-center gap-2 text-left">
                        <button 
                           type="button"
                           onClick={() => openMediaSelector('site_favicon')}
                           className="bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                           Pilih Ikon
                        </button>
                        {settings.site_favicon && (
                           <button type="button" onClick={() => clearImage('site_favicon')} className="text-red-500 hover:text-red-700 transition-colors">
                              <X className="w-4 h-4" />
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Nama Singkat (Singkatan) */}
            <div className="p-8 flex flex-col sm:flex-row gap-8 text-left">
               <div className="sm:w-1/3 text-left">
                  <span className="font-bold text-gray-800 text-sm block mb-1">Nama Singkat (Header)</span>
                  <p className="text-gray-400 text-[11px] leading-relaxed">Teks tebal yang menonjol di sebelah logo.</p>
               </div>
               <div className="sm:w-2/3 text-left">
                  <input 
                    type="text" 
                    name="site_name"
                    value={settings.site_name || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary font-bold uppercase tracking-tight" 
                    placeholder="Contoh: LPPM UIM"
                  />
               </div>
            </div>

            {/* Nama Lengkap Lembaga */}
            <div className="p-8 flex flex-col sm:flex-row gap-8 text-left">
               <div className="sm:w-1/3 text-left">
                  <span className="font-bold text-gray-800 text-sm block mb-1">Nama Lengkap Institusi</span>
                  <p className="text-gray-400 text-[11px] leading-relaxed">Teks di bawah nama singkat (tagline/informasi tambahan).</p>
               </div>
               <div className="sm:w-2/3 text-left">
                  <textarea 
                    rows={2} 
                    name="site_full_name"
                    value={settings.site_full_name || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none leading-relaxed"
                    placeholder="Masukkan nama lengkap lembaga..."
                  ></textarea>
               </div>
            </div>

            {/* Teks Sebelah Kanan */}
            <div className="p-8 flex flex-col sm:flex-row gap-8 text-left">
               <div className="sm:w-1/3 text-left">
                  <span className="font-bold text-gray-800 text-sm block mb-1">Teks Sisi Kanan (Desktop)</span>
                  <p className="text-gray-400 text-[11px] leading-relaxed">Teks kecil di bagian kanan atas bar berrwarna putih.</p>
               </div>
               <div className="sm:w-2/3 text-left">
                  <input 
                    type="text" 
                    name="header_right_text"
                    value={settings.header_right_text || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary uppercase tracking-widest text-[11px]" 
                    placeholder="MASUKKAN TEKS OPSIONAL"
                  />
               </div>
            </div>

            {/* Opsi Tata Letak */}
            <div className="p-8 flex flex-col sm:flex-row gap-8 bg-gray-50/50 text-left">
               <div className="sm:w-1/3 text-left">
                  <span className="font-bold text-gray-800 text-sm">Opsi Tampilan</span>
               </div>
               <div className="sm:w-2/3 text-left">
                  <label className="flex items-center gap-3 cursor-pointer group">
                     <div className="relative">
                        <input 
                            type="checkbox" 
                            name="hide_top_bar"
                            checked={settings.hide_top_bar === 'true'}
                            onChange={handleChange}
                            className="sr-only" 
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${settings.hide_top_bar === 'true' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.hide_top_bar === 'true' ? 'translate-x-4' : ''}`}></div>
                     </div>
                     <span className="text-sm font-bold text-gray-700">Sembunyikan Bilah Atas Putih (Gaya Minimalis)</span>
                  </label>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed text-left">Jika aktif, logo akan menyatu dengan navigasi utama di bilah hijau.</p>
               </div>
            </div>

            <div className="p-8 bg-gray-50 flex justify-end">
               <button 
                type="submit" 
                disabled={isSaving}
                className="bg-primary text-white hover:bg-primary-dark px-10 py-3 rounded-xl shadow-lg shadow-primary/20 text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 disabled:opacity-70 group"
               >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                  {isSaving ? 'Memperbarui...' : 'Perbarui Perubahan'}
               </button>
            </div>
         </form>
      </div>

      <MediaSelector 
         isOpen={isMediaSelectorOpen}
         onClose={() => setIsMediaSelectorOpen(false)}
         onSelect={onMediaSelect}
      />
    </div>
  );
}
