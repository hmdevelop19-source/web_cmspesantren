import { Tag, Plus, Trash2, Loader2, Save, X, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Category } from '../../types';
import Skeleton from '../../components/ui/Skeleton';

export default function Categories() {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState('');
  const [showForm, setShowForm] = useState(false);

  // States for inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState('');

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('posts'); // Reuse posts permission for categories

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => api.post('/categories', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setNewCatName('');
      setShowForm(false);
    },
    onError: () => {
      alert('Gagal menambahkan kategori. Mungkin nama sudah ada.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number, name: string }) => api.put(`/categories/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setEditingId(null);
      setEditCatName('');
    },
    onError: () => {
      alert('Gagal memperbarui kategori. Mungkin nama sudah digunakan.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: () => {
      alert('Gagal menghapus kategori.');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    createMutation.mutate(newCatName);
  };

  const handleUpdate = (id: number) => {
    if (!editCatName.trim()) return;
    updateMutation.mutate({ id, name: editCatName });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Hapus kategori ini? Pos yang menggunakan kategori ini mungkin perlu disesuaikan.')) {
      deleteMutation.mutate(id);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditCatName(cat.name);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kategori Konten</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola kategori untuk mengorganisir berita, artikel, dan pengumuman pesantren</p>
        </div>

        {hasWriteAccess && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Batal Tambah' : 'Tambah Kategori'}
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 animate-in slide-in-from-top-4 duration-300">
           <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Tambah Kategori Baru</h2>
           </div>
           <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Contoh: Kegiatan Santri, Warta Utama..." 
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSaving || !newCatName.trim()}
                className="bg-primary text-white px-8 py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-primary/10"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Kategori
              </button>
           </form>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
        {isLoading ? (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nama Kategori</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Identitas Slug</th>
                    <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                         <td className="px-8 py-5"><Skeleton variant="text" width="60%" height={20} /></td>
                         <td className="px-8 py-5"><Skeleton variant="text" width="40%" /></td>
                         <td className="px-8 py-5 text-right"><Skeleton variant="rectangular" width={80} height={32} className="rounded-lg inline-block" /></td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nama Kategori</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Identitas Slug</th>
                  <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.length > 0 ? categories.map((cat) => (
                  <tr key={cat.id} className="group hover:bg-slate-50/50 transition-all">
                    {editingId === cat.id ? (
                      <td colSpan={2} className="px-8 py-5">
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-primary/20">
                          <input 
                            type="text" 
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                          />
                          <div className="flex gap-1">
                             <button onClick={() => handleUpdate(cat.id)} className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-all"><Save className="w-4 h-4" /></button>
                             <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-500 p-2 rounded-md hover:bg-slate-300 transition-all"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-primary transition-colors"></div>
                             <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <code className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">{cat.slug}</code>
                        </td>
                      </>
                    )}
                    
                    <td className="px-8 py-5 text-right">
                      {hasWriteAccess && editingId !== cat.id && (
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => startEdit(cat)}
                            className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            title="Edit Kategori"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={3} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                           <Tag className="w-12 h-12 opacity-20" />
                           <p className="text-sm font-medium italic">Belum ada kategori ditemukan</p>
                        </div>
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
