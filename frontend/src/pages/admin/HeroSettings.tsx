import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Image as ImageIcon, Plus, Edit3, Trash2, ArrowLeft, GripVertical, Loader2, Link as LinkIcon, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import MediaSelector from '../../components/admin/MediaSelector';
import type { Banner } from '../../types';

export default function HeroSettings() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_path: '',
    link_url: '',
    order: 1,
    is_active: true
  });

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const response = await api.get('/banners');
      return response.data;
    },
    enabled: isAdmin()
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingId) {
        return api.put(`/banners/${editingId}`, data);
      }
      return api.post('/banners', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Error saving banner:', error);
      alert('Gagal menyimpan spanduk. Pastikan semua data terisi dengan benar.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: () => {
      alert('Gagal menghapus spanduk.');
    }
  });

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_path: banner.image_path || '',
      link_url: banner.link_url || '',
      order: banner.order || 1,
      is_active: banner.is_active === 1 || banner.is_active === true
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      image_path: '',
      link_url: '',
      order: banners.length + 1,
      is_active: true
    });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus spanduk ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const isSaving = saveMutation.isPending;

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-normal text-gray-800 flex items-center gap-2 mb-1">
              <Layout className="w-6 h-6 text-primary" /> 
              {isEditing ? (editingId ? 'Edit Spanduk' : 'Tambah Spanduk Baru') : 'Daftar Spanduk Utama (Slider)'}
           </h1>
           <p className="text-sm text-gray-500">
              {isEditing ? 'Konfigurasikan judul, teks, dan background visual untuk slide ini.' : 'Kelola barisan spanduk geser (slider) yang tampil di beranda.'}
           </p>
        </div>
        
        {!isEditing ? (
           <button onClick={handleCreate} className="bg-primary text-white hover:bg-primary-dark px-4 py-1.5 rounded text-sm transition-all focus:outline-none flex items-center gap-2 font-bold shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" /> Tambah Baru
           </button>
        ) : (
           <button onClick={() => setIsEditing(false)} className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1 shadow-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
           </button>
        )}
      </div>

      {isLoading && !isEditing ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded">
           <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
           <p className="text-gray-500 font-medium">Memuat data spanduk...</p>
        </div>
      ) : !isEditing ? (
        /* LIST VIEW */
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
           <table className="w-full text-sm text-left">
              <thead className="bg-[#f6f7f7] border-b border-gray-200 text-gray-700">
                 <tr>
                    <th className="w-10 px-4 py-3"></th>
                    <th className="px-4 py-3 font-semibold">Tampilan</th>
                    <th className="px-4 py-3 font-semibold">Judul Spanduk (Headline)</th>
                    <th className="px-4 py-3 font-semibold">Urutan</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right text-xs">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                 {banners.length > 0 ? banners.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 group">
                       <td className="px-4 py-3 text-gray-400"><GripVertical className="w-4 h-4" /></td>
                       <td className="px-4 py-3">
                          <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden border border-gray-200 shadow-inner">
                             <img src={item.image_path} alt="Thumb" className="w-full h-full object-cover" />
                          </div>
                       </td>
                       <td className="px-4 py-3">
                          <div className="flex flex-col">
                             <span className="font-bold text-gray-900 line-clamp-1">{item.title || '(Tanpa Judul)'}</span>
                             <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 line-clamp-1">
                                <LinkIcon className="w-2.5 h-2.5" /> {item.link_url || '—'}
                             </span>
                          </div>
                       </td>
                       <td className="px-4 py-3 font-mono font-bold text-primary">{item.order}</td>
                       <td className="px-4 py-3">
                          {item.is_active ? (
                             <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100">
                                <CheckCircle2 className="w-3 h-3" /> AKTIF
                             </span>
                          ) : (
                             <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-100">
                                <XCircle className="w-3 h-3" /> NON-AKTIF
                             </span>
                          )}
                       </td>
                       <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                             <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit"><Edit3 className="w-4 h-4" /></button>
                             <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                 )) : (
                    <tr>
                       <td colSpan={6} className="px-4 py-16 text-center text-gray-400 italic">
                          Belum ada spanduk hero. Klik "Tambah Baru" untuk memulai.
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      ) : (
        /* FORM VIEW */
        <div className="bg-white border border-gray-200 shadow-sm p-6 mb-6 rounded-lg">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status Spanduk</label>
                    <select 
                       value={formData.is_active ? 'true' : 'false'}
                       onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                       className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                       <option value="true">Aktif (Tampil di Frontend)</option>
                       <option value="false">Draf (Sembunyikan)</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Urutan Penampilan</label>
                    <input 
                       type="number" 
                       value={formData.order}
                       onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                       className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    />
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Teks Label (Kecil)</label>
                    <input 
                       type="text" 
                       value={formData.subtitle}
                       onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                       placeholder="Contoh: Pengumuman Terbaru"
                       className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium" 
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Judul Utama (Headline)</label>
                    <textarea 
                       rows={2} 
                       value={formData.title}
                       onChange={(e) => setFormData({...formData, title: e.target.value})}
                       placeholder="Masukkan judul banner..."
                       className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-lg font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    ></textarea>
                 </div>

                 <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gambar Background</label>
                       <div 
                          onClick={() => setIsMediaSelectorOpen(true)}
                          className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group relative overflow-hidden"
                       >
                          {formData.image_path ? (
                             <>
                                <img src={formData.image_path} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                   <span className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold">Ganti Gambar</span>
                                </div>
                             </>
                          ) : (
                             <>
                                 <ImageIcon className="w-8 h-8 text-gray-300 mb-2 group-hover:text-primary group-hover:scale-110 transition-all" />
                                 <span className="text-[11px] font-bold text-gray-400 group-hover:text-primary">Pilih Visual</span>
                                 <div className="flex flex-col items-center mt-2 space-y-1">
                                    <span className="text-[9px] text-gray-400 font-medium">Ukuran Rekomendasi: 1920 x 800 px</span>
                                    <span className="text-[9px] text-primary/50 italic opacity-0 group-hover:opacity-100 transition-opacity">Maksimal file: 2 MB</span>
                                 </div>
                             </>
                          )}
                       </div>
                    </div>
                    <div className="md:w-2/3 flex flex-col justify-center">
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tautan URL (Optional)</label>
                       <div className="relative">
                          <input 
                             type="text" 
                             value={formData.link_url}
                             onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                             placeholder="/berita/pengumuman-pendaftaran"
                             className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-xs font-mono text-gray-500 focus:ring-2 focus:ring-primary/20 outline-none" 
                          />
                          <LinkIcon className="w-4 h-4 text-gray-300 absolute left-3 top-3.5" />
                       </div>
                       <p className="text-[10px] text-gray-400 mt-2 italic">Kosongkan jika tombol tidak ingin ditampilkan.</p>
                    </div>
                 </div>
              </div>
              
              <div className="pt-8 border-t border-gray-100 mt-6 flex justify-end gap-3">
                 <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    disabled={isSaving}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl shadow-sm text-sm font-bold transition-all disabled:opacity-50"
                 >
                    Batal
                 </button>
                 <button 
                    type="submit" 
                    disabled={isSaving || !formData.image_path}
                    className="bg-primary text-white hover:bg-primary-dark px-10 py-2.5 rounded-xl shadow-lg shadow-primary/20 text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                 >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    {editingId ? 'Simpan Perubahan' : 'Tambah Spanduk'}
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* Media Selector integration */}
      <MediaSelector 
         isOpen={isMediaSelectorOpen}
         onClose={() => setIsMediaSelectorOpen(false)}
         onSelect={(media) => {
            setFormData({...formData, image_path: `http://localhost:8000${media.file_path}`});
            setIsMediaSelectorOpen(false);
         }}
      />
    </div>
  );
}
