import { ArrowLeft, Save, ImageIcon, LayoutList, Type, Info, RefreshCw } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import MediaSelector from '../../components/admin/MediaSelector';

export default function FacilitiesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    image_id: null as number | null,
    icon: 'Building2',
    order: 0,
    is_active: true
  });

  const { data: facility, isLoading } = useQuery({
    queryKey: ['admin-facility', id],
    queryFn: async () => {
      const response = await api.get(`/facilities/${id}`);
      return response.data;
    }
  });

  useEffect(() => {
    if (facility) {
      setFormData({
        title: facility.title,
        slug: facility.slug,
        description: facility.description || '',
        image_id: facility.image_id,
        icon: facility.icon || 'Building2',
        order: facility.order || 0,
        is_active: facility.is_active
      });
      if (facility.image_id) {
        setSelectedImage({ 
            id: facility.image_id, 
            file_path: facility.image_url.replace(import.meta.env.VITE_STORAGE_URL, '') 
        });
      }
    }
  }, [facility]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.put(`/facilities/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-facilities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-facility', id] });
      navigate('/admin/facilities');
    },
    onError: (error: any) => {
      alert('Gagal memperbarui fasilitas: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    },
    onSettled: () => setLoading(false)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    mutation.mutate(formData);
  };

  const commonIcons = ['Building2', 'Book', 'Home', 'Coffee', 'Wifi', 'Dorm', 'Library', 'Users', 'Shield', 'School'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Memuat Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b border-slate-200 pb-8 text-left">
        <div className="flex items-center gap-4">
          <Link to="/admin/facilities" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Edit Fasilitas</h1>
            <p className="text-sm text-slate-500 mt-1">Perbarui informasi sarana atau prasarana pesantren</p>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Type className="w-3.5 h-3.5" /> Judul Fasilitas
              </label>
              <input 
                required
                type="text" 
                placeholder="Contoh: Gedung Perpustakaan Pusat"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> Deskripsi Singkat
              </label>
              <textarea 
                rows={5}
                placeholder="Jelaskan mengenai fasilitas ini..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Foto Fasilitas
            </label>
            
            {selectedImage ? (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-video">
                <img 
                  src={`${import.meta.env.VITE_STORAGE_URL}${selectedImage.file_path}`} 
                  alt="Preview" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button 
                    type="button"
                    onClick={() => setIsMediaSelectorOpen(true)}
                    className="bg-white text-slate-800 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all"
                  >
                    Ganti
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setSelectedImage(null); setFormData({ ...formData, image_id: null }); }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 transition-all"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => setIsMediaSelectorOpen(true)}
                className="w-full p-12 border-2 border-dashed border-slate-100 hover:border-primary/30 hover:bg-primary/5 rounded-3xl transition-all flex flex-col items-center gap-4 group text-slate-400"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold group-hover:text-primary transition-colors">Pilih Foto Fasilitas</span>
                  <span className="block text-[10px] mt-1 uppercase tracking-widest opacity-60">Rekomendasi: 16:9 Aspect Ratio</span>
                </div>
              </button>
            )}

            <MediaSelector 
              isOpen={isMediaSelectorOpen}
              onClose={() => setIsMediaSelectorOpen(false)}
              onSelect={(media) => {
                setSelectedImage(media);
                setFormData({ ...formData, image_id: media.id });
                setIsMediaSelectorOpen(false);
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <LayoutList className="w-3.5 h-3.5" /> Atribut & Urutan
              </label>
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Urutan Tampil</span>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/5"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pilih Ikon (Lucide)</span>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/5 mb-3"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Nama Ikon..."
                />
                <div className="flex flex-wrap gap-2">
                   {commonIcons.map(icon => (
                     <button 
                       key={icon}
                       type="button"
                       onClick={() => setFormData({ ...formData, icon })}
                       className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${formData.icon === icon ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-200 hover:border-primary hover:text-primary'}`}
                     >
                       {icon}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <div className={`w-10 h-6 rounded-full transition-all ${formData.is_active ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-primary transition-colors">Aktifkan di Website</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
