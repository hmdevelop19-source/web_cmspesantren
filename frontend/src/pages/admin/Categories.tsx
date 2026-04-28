import { Tag, Plus, Trash2, Loader2, Save, X, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Category } from '../../types';

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

  const isSaving = createMutation.isPending;

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-normal text-gray-800 flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" /> Manajemen Kategori
          </h1>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-tighter">Kelola pengelompokan berita dan artikel pesantren.</p>
        </div>

        {hasWriteAccess && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-primary text-white hover:bg-primary-dark px-4 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 font-bold shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Kategori Baru
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-primary/20 shadow-xl rounded-2xl p-6 mb-8 animate-slide-up">
           <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-800 uppercase tracking-widest text-xs">Tambah Kategori Baru</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
           </div>
           <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Nama Kategori (Contoh: Warta Santri)" 
                autoFocus
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all shadow-inner"
              />
              <button 
                type="submit" 
                disabled={isSaving || !newCatName.trim()}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Kategori
              </button>
           </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
             <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Sinkronisasi Data...</span>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[10px] font-black tracking-[0.15em]">
              <tr>
                <th className="px-8 py-5">Nama Kategori</th>
                <th className="px-8 py-5">Slug Penautan</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length > 0 ? categories.map((cat) => (
                <tr key={cat.id} className="group hover:bg-gray-50 transition-colors">
                  {editingId === cat.id ? (
                    <td colSpan={2} className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" 
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          className="flex-1 border border-primary/50 focus:border-primary rounded px-3 py-1.5 text-sm outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                        />
                        <button onClick={() => handleUpdate(cat.id)} className="text-green-600 hover:text-green-800 font-bold text-xs uppercase">Simpan</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xs uppercase">Batal</button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-8 py-5">
                        <span className="font-bold text-gray-900 group-hover:text-primary transition-colors tracking-tight text-sm uppercase italic">{cat.name}</span>
                      </td>
                      <td className="px-8 py-5">
                        <code className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">/berita?cat={cat.slug}</code>
                      </td>
                    </>
                  )}
                  
                  <td className="px-8 py-5 text-right">
                    {hasWriteAccess && editingId !== cat.id && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => startEdit(cat)}
                          className="text-gray-300 hover:text-primary transition-colors p-2"
                          title="Edit Kategori"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-2"
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
                   <td colSpan={3} className="px-8 py-12 text-center text-gray-400 italic text-sm">Belum ada kategori ditambahkan.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
