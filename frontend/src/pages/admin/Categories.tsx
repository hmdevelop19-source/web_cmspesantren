import { Tag, Plus, Trash2, Loader2, Save, X, Edit2, Search, Filter, CheckCircle2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Category } from '../../types';
import Skeleton from '../../components/ui/Skeleton';

export default function Categories() {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  // States for inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState('');

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('posts');

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    }
  });

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const triggerSuccess = (message: string) => {
    setShowSuccess(message);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const createMutation = useMutation({
    mutationFn: (name: string) => api.post('/categories', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setNewCatName('');
      setShowForm(false);
      triggerSuccess('Kategori berhasil ditambahkan!');
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
      triggerSuccess('Kategori berhasil diperbarui!');
    },
    onError: () => {
      alert('Gagal memperbarui kategori. Mungkin nama sudah digunakan.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      triggerSuccess('Kategori berhasil dihapus!');
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

        <div className="flex items-center gap-3">
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold">{showSuccess}</span>
            </div>
          )}
          {hasWriteAccess && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Batal' : 'Tambah Kategori'}
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari kategori berdasarkan nama atau slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Total: {filteredCategories.length}</span>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-xl rounded-2xl p-8 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
           <div className="relative z-10">
              <div className="mb-6">
                 <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Kategori Baru</h2>
                 <p className="text-xs text-slate-400">Pastikan nama kategori belum pernah digunakan sebelumnya.</p>
              </div>
              <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1">
                   <input 
                     type="text" 
                     placeholder="Contoh: Kegiatan Santri, Warta Utama..." 
                     autoFocus
                     value={newCatName}
                     onChange={(e) => setNewCatName(e.target.value)}
                     className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                   />
                 </div>
                 <button 
                   type="submit" 
                   disabled={isSaving || !newCatName.trim()}
                   className="bg-primary text-white px-10 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                 >
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   Simpan
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
        {isLoading ? (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Kategori</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Slug ID</th>
                    <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                         <td className="px-8 py-6"><Skeleton variant="text" width="60%" height={24} /></td>
                         <td className="px-8 py-6"><Skeleton variant="text" width="40%" /></td>
                         <td className="px-8 py-6 text-right"><Skeleton variant="rectangular" width={80} height={36} className="rounded-xl inline-block" /></td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Kategori</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Slug ID</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                  <tr key={cat.id} className="group hover:bg-primary/[0.02] transition-all">
                    {editingId === cat.id ? (
                      <td colSpan={3} className="px-8 py-5 bg-primary/5">
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-xl border border-primary/20 animate-in zoom-in-95 duration-200">
                          <div className="flex-1 w-full relative">
                            <Tag className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                            <input 
                              type="text" 
                              value={editCatName}
                              onChange={(e) => setEditCatName(e.target.value)}
                              className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm font-black text-slate-700 focus:ring-2 focus:ring-primary/20"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                            />
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                             <button 
                               onClick={() => handleUpdate(cat.id)} 
                               disabled={updateMutation.isPending}
                               className="flex-1 sm:flex-none bg-primary text-white px-6 py-3 rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2"
                             >
                               {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                               Simpan
                             </button>
                             <button 
                               onClick={() => setEditingId(null)} 
                               className="flex-1 sm:flex-none bg-slate-100 text-slate-500 px-6 py-3 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                             >
                               <X className="w-3 h-3" />
                               Batal
                             </button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-300">
                                <Tag className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-700 group-hover:text-primary transition-colors uppercase tracking-tight italic">{cat.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium">Ditambahkan pada {new Date(cat.created_at).toLocaleDateString('id-ID')}</span>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <code className="text-[10px] font-black text-primary/50 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 tracking-widest uppercase">{cat.slug}</code>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {hasWriteAccess && (
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                              <button 
                                onClick={() => startEdit(cat)}
                                className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                title="Edit Kategori"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(cat.id)}
                                className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Hapus Kategori"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={3} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center gap-6 text-slate-200">
                           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-4 border-dashed border-slate-100">
                              <Tag className="w-10 h-10 opacity-20" />
                           </div>
                           <div className="max-w-xs mx-auto">
                              <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Belum ada kategori</p>
                              <p className="text-xs text-slate-300 mt-2">Gunakan tombol "Tambah Kategori" untuk membuat grup konten baru.</p>
                           </div>
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
