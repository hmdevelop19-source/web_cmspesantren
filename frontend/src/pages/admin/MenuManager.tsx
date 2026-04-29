import { 
  Menu as MenuIcon, Plus, Trash2, Loader2, Save, X, Edit2, 
  ExternalLink, Globe, ChevronUp, ChevronDown, RefreshCw 
} from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Menu } from '../../types';

export default function MenuManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  
  // Form State
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('settings'); // Settings permission for menus

  const { data: menus = [], isLoading } = useQuery<Menu[]>({
    queryKey: ['admin-menus'],
    queryFn: async () => {
      const response = await api.get('/menus');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/menus', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menus'] });
      resetForm();
    },
    onError: () => alert('Gagal menyimpan menu.')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => api.put(`/menus/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menus'] });
      resetForm();
    },
    onError: () => alert('Gagal memperbarui menu.')
  });

  const reorderMutation = useMutation({
    mutationFn: (reorderedMenus: any[]) => api.post('/menus/reorder', { menus: reorderedMenus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menus'] });
    },
    onError: () => alert('Gagal memperbarui urutan menu.')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/menus/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-menus'] }),
    onError: () => alert('Gagal menghapus menu.')
  });

  const handleMove = (index: number, direction: 'up' | 'down', isChild = false, parentIndex?: number) => {
    let items = [...menus];
    
    if (isChild && parentIndex !== undefined) {
      const parent = { ...items[parentIndex] };
      const children = [...(parent.children || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= children.length) return;
      
      [children[index], children[targetIndex]] = [children[targetIndex], children[index]];
      
      const updatedChildren = children.map((c, i) => ({ id: c.id, order: i + 1 }));
      reorderMutation.mutate(updatedChildren);
    } else {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return;
      
      [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
      
      const updatedMenus = items.map((m, i) => ({ id: m.id, order: i + 1 }));
      reorderMutation.mutate(updatedMenus);
    }
  };

  const resetForm = () => {
    setLabel('');
    setUrl('');
    setParentId(undefined);
    setIsActive(true);
    setEditingMenu(null);
    setShowForm(false);
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setLabel(menu.label);
    setUrl(menu.url);
    setParentId(menu.parent_id);
    setIsActive(menu.is_active);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { label, url, parent_id: parentId, is_active: isActive };
    
    if (editingMenu) {
      updateMutation.mutate({ id: editingMenu.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Hapus menu ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Navigasi</h1>
          <p className="text-sm text-slate-500 mt-1">Atur struktur menu, tautan, dan urutan navigasi utama website</p>
        </div>

        {hasWriteAccess && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10"
          >
            <Plus className="w-4 h-4" /> Tambah Menu Baru
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 mb-8 animate-in slide-in-from-top-4 duration-300">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-slate-800">
                {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-slate-50 rounded-lg"><X className="w-5 h-5" /></button>
           </div>
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Label Menu</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Tentang Kami" 
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">URL / Tautan</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Contoh: /profil atau https://google.com" 
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50/50 rounded-lg pl-12 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                    <Globe className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Menu Induk</label>
                  <select 
                    value={parentId || ''}
                    onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Menu Utama --</option>
                    {menus.filter(m => m.id !== editingMenu?.id).map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-semibold text-slate-600">Aktifkan Menu</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending || !label.trim()}
                  className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingMenu ? 'Perbarui Menu' : 'Simpan Menu'}
                </button>
              </div>
           </form>
        </div>
      )}

      {/* Menu List */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center gap-4">
             <RefreshCw className="w-8 h-8 text-primary animate-spin" />
             <span className="text-slate-400 font-medium text-sm">Memuat struktur navigasi...</span>
          </div>
        ) : (
          <div>
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex-1">Struktur Navigasi</div>
              <div className="w-24">Urutan</div>
              <div className="w-32">Status</div>
              <div className="w-28 text-right">Aksi</div>
            </div>
            
            <div className="divide-y divide-slate-50">
              {menus.length > 0 ? menus.map((menu, index) => (
                <div key={menu.id} className="group">
                  <div className="flex items-center px-6 py-4 hover:bg-slate-50/50 transition-all">
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <MenuIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{menu.label}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-[10px] text-slate-400 font-mono">{menu.url}</code>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-24 flex items-center gap-1">
                       <button 
                        disabled={index === 0 || reorderMutation.isPending}
                        onClick={() => handleMove(index, 'up')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all"
                       >
                         <ChevronUp className="w-3.5 h-3.5" />
                       </button>
                       <button 
                        disabled={index === menus.length - 1 || reorderMutation.isPending}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all"
                       >
                         <ChevronDown className="w-3.5 h-3.5" />
                       </button>
                    </div>

                    <div className="w-32">
                      {menu.is_active ? (
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
                    </div>

                    <div className="w-28 flex justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(menu)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(menu.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Children Render */}
                  {menu.children && menu.children.length > 0 && (
                    <div className="bg-slate-50/30 ml-8 border-l-2 border-slate-100 divide-y divide-slate-50">
                      {menu.children.map((child, cIndex) => (
                        <div key={child.id} className="flex items-center px-6 py-3 hover:bg-white transition-all group/child">
                           <div className="flex-1 flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/child:bg-secondary"></div>
                              <span className="font-semibold text-slate-600 text-xs">{child.label}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({child.url})</span>
                           </div>
                           
                           <div className="w-24 flex items-center gap-1">
                              <button 
                                disabled={cIndex === 0 || reorderMutation.isPending}
                                onClick={() => handleMove(cIndex, 'up', true, index)}
                                className="p-1 rounded-md border border-slate-100 text-slate-300 hover:text-secondary disabled:opacity-20 transition-all"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button 
                                disabled={cIndex === (menu.children?.length || 0) - 1 || reorderMutation.isPending}
                                onClick={() => handleMove(cIndex, 'down', true, index)}
                                className="p-1 rounded-md border border-slate-100 text-slate-300 hover:text-secondary disabled:opacity-20 transition-all"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                           </div>

                           <div className="w-28 flex justify-end gap-1">
                              <button onClick={() => handleEdit(child)} className="p-2 text-slate-300 hover:text-primary transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(child.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                   <Globe className="w-12 h-12 text-slate-200" />
                   <p className="text-slate-400 font-semibold text-sm">Struktur navigasi masih kosong</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-primary/5 border border-primary/10 rounded-xl p-6 flex items-start gap-4">
          <div className="bg-primary text-white p-2.5 rounded-lg shadow-sm"><ExternalLink className="w-5 h-5" /></div>
          <div>
             <h4 className="font-bold text-primary text-sm mb-1">Tips Navigasi</h4>
             <p className="text-primary/70 text-xs leading-relaxed">
               Gunakan link internal seperti <code className="bg-primary/10 px-1 rounded">/berita</code> atau <code className="bg-primary/10 px-1 rounded">/profil/sejarah</code> untuk halaman dalam website. Untuk link luar, pastikan menggunakan awalan <code className="bg-primary/10 px-1 rounded">https://</code>.
             </p>
          </div>
      </div>
    </div>
  );
}
