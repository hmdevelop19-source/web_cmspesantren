import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Plus, Edit3, Trash2, ArrowLeft, Link as LinkIcon, RefreshCw, Save } from 'lucide-react';
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
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isEditing ? (editingId ? 'Edit Spanduk' : 'Tambah Spanduk Baru') : 'Spanduk Utama (Slider)'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditing ? 'Konfigurasikan judul, teks, dan latar belakang visual untuk slide ini' : 'Kelola barisan spanduk geser yang tampil di halaman depan website'}
          </p>
        </div>
        
        {!isEditing ? (
          <button 
            onClick={handleCreate} 
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10"
          >
            <Plus className="w-4 h-4" /> Tambah Spanduk Baru
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(false)} 
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
          </button>
        )}
      </div>

      {isLoading && !isEditing ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-xl">
           <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
           <p className="text-slate-400 font-medium">Memuat data spanduk...</p>
        </div>
      ) : !isEditing ? (
        /* LIST VIEW */
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                       <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tampilan</th>
                       <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Judul & Headline</th>
                       <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Urutan</th>
                       <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {banners.length > 0 ? banners.map((item) => (
                       <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                             <div className="w-20 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                <img src={item.image_path} alt="Banner" className="w-full h-full object-cover" />
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">{item.title || '(Tanpa Judul)'}</span>
                                {item.link_url && (
                                   <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                                      <LinkIcon className="w-3 h-3" /> {item.link_url}
                                   </span>
                                )}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-sm font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">#{item.order}</span>
                          </td>
                          <td className="px-6 py-4">
                             {item.is_active ? (
                                <div className="flex items-center gap-1.5">
                                   <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                   <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider">Aktif</span>
                                </div>
                             ) : (
                                <div className="flex items-center gap-1.5">
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Draft</span>
                                </div>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm italic">
                             Belum ada spanduk hero. Klik "Tambah Spanduk Baru" untuk memulai.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      ) : (
        /* FORM VIEW */
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 animate-in slide-in-from-bottom-4 duration-300">
           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status Spanduk</label>
                    <select 
                       value={formData.is_active ? 'true' : 'false'}
                       onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                       className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    >
                       <option value="true">Aktif (Tampil di Beranda)</option>
                       <option value="false">Draf (Sembunyikan)</option>
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Urutan Tampil</label>
                    <input 
                       type="number" 
                       value={formData.order}
                       onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                       className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                    />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Label Teks (Kecil)</label>
                    <input 
                       type="text" 
                       value={formData.subtitle}
                       onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                       placeholder="Contoh: Penerimaan Santri Baru"
                       className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Judul Utama (Headline)</label>
                    <textarea 
                       rows={3} 
                       value={formData.title}
                       onChange={(e) => setFormData({...formData, title: e.target.value})}
                       placeholder="Masukkan judul besar banner..."
                       className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none"
                    ></textarea>
                 </div>

                 <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2 space-y-3">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Latar Belakang Visual</label>
                       <div 
                          onClick={() => setIsMediaSelectorOpen(true)}
                          className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group relative overflow-hidden"
                       >
                          {formData.image_path ? (
                             <>
                                <img src={formData.image_path} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                   <span className="bg-white text-slate-800 px-4 py-2 rounded-lg text-xs font-bold shadow-sm">Ganti Gambar</span>
                                </div>
                             </>
                          ) : (
                             <div className="text-center space-y-2">
                                 <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                                 <p className="text-[11px] font-bold text-slate-400">Pilih Visual Banner</p>
                                 <p className="text-[9px] text-slate-300 uppercase tracking-widest">1920 x 800 PX</p>
                             </div>
                          )}
                       </div>
                    </div>
                    <div className="md:w-1/2 flex flex-col justify-end">
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tautan / Link (Opsional)</label>
                          <div className="relative">
                             <input 
                                type="text" 
                                value={formData.link_url}
                                onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                                placeholder="/halaman-pendaftaran"
                                className="w-full border border-slate-200 bg-slate-50/50 rounded-lg pl-10 pr-4 py-3 text-xs font-mono text-slate-500 focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                             />
                             <LinkIcon className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                          <p className="text-[10px] text-slate-400 italic mt-2">Tombol "Selengkapnya" akan muncul jika link terisi.</p>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="pt-8 border-t border-slate-100 flex justify-end gap-3">
                 <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all"
                 >
                    Batal
                 </button>
                 <button 
                    type="submit" 
                    disabled={isSaving || !formData.image_path}
                    className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                 >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
            setFormData({...formData, image_path: `${api.defaults.baseURL?.replace('/api', '')}${media.file_path}`});
            setIsMediaSelectorOpen(false);
         }}
      />
    </div>
  );
}
