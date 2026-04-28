import { 
  Menu as MenuIcon, Plus, Trash2, Loader2, Save, X, Edit2, 
  ExternalLink, Globe 
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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/menus/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-menus'] }),
    onError: () => alert('Gagal menghapus menu.')
  });

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
    <div className="max-w-5xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-normal text-gray-800 flex items-center gap-3">
            <MenuIcon className="w-7 h-7 text-primary" /> Pengaturan Navigasi
          </h1>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-tighter italic">Kelola struktur menu utama pada halaman depan website.</p>
        </div>

        {hasWriteAccess && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-primary text-white hover:bg-primary-dark px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Tambah Menu
          </button>
        )}
      </div>

      {/* Form Modal/Section */}
      {showForm && (
        <div className="bg-white border border-primary/20 shadow-2xl rounded-3xl p-8 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="flex justify-between items-center mb-8">
              <h2 className="font-black text-gray-900 uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                <div className="w-2 h-6 bg-secondary rounded-full"></div>
                {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-red-500 transition-colors p-2 bg-gray-50 rounded-full"><X className="w-5 h-5" /></button>
           </div>
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Label Menu</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Tentang Kami" 
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">URL / Link Penautan</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Contoh: /profil atau https://google.com" 
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full border border-gray-200 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                    />
                    <Globe className="w-5 h-5 text-gray-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 ml-1 italic font-medium">Gunakan '/' untuk link internal pesantren.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Menu Induk (Opsional)</label>
                  <select 
                    value={parentId || ''}
                    onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="">-- Jadikan Menu Utama --</option>
                    {menus.filter(m => m.id !== editingMenu?.id).map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-xs font-black text-gray-600 uppercase tracking-widest">Aktifkan Menu</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end gap-4 border-t border-gray-50">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-all"
                >
                  Batalkan
                </button>
                <button 
                  type="submit" 
                  disabled={isPending || !label.trim()}
                  className="bg-primary text-white px-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingMenu ? 'Perbarui Menu' : 'Simpan Menu Baru'}
                </button>
              </div>
           </form>
        </div>
      )}

      {/* Menu List */}
      <div className="bg-white border border-gray-200 shadow-2xl shadow-black/5 rounded-[2.5rem] overflow-hidden">
        {isLoading ? (
          <div className="py-32 text-center flex flex-col items-center gap-6">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <MenuIcon className="w-6 h-6 text-primary animate-pulse" />
                </div>
             </div>
             <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em]">Membangun Struktur...</span>
          </div>
        ) : (
          <div className="p-2">
            <div className="bg-gray-50 border-b border-gray-100 px-8 py-4 flex text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <div className="flex-1">Struktur Navigasi</div>
              <div className="w-40">Status</div>
              <div className="w-32 text-right">Aksi</div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {menus.length > 0 ? menus.map((menu) => (
                <div key={menu.id} className="group">
                  <div className="flex items-center px-8 py-5 hover:bg-gray-50/80 transition-all">
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <MenuIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-gray-900 uppercase italic tracking-tight group-hover:text-primary transition-colors">{menu.label}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-[9px] text-gray-300 font-mono">{menu.url}</code>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-40">
                      {menu.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest border border-green-100">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-widest border border-gray-100">
                           Offline
                        </span>
                      )}
                    </div>

                    <div className="w-32 flex justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(menu)}
                        className="p-2 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="Edit Menu"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(menu.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Children Render */}
                  {menu.children && menu.children.length > 0 && (
                    <div className="bg-gray-50/30 ml-8 border-l-2 border-gray-100 divide-y divide-gray-50">
                      {menu.children.map(child => (
                        <div key={child.id} className="flex items-center px-8 py-4 hover:bg-white transition-all group/child">
                           <div className="flex-1 flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover/child:bg-secondary"></div>
                              <span className="font-bold text-gray-600 text-xs uppercase tracking-tight">{child.label}</span>
                              <span className="text-[9px] text-gray-300 font-mono lowercase">({child.url})</span>
                           </div>
                           <div className="w-32 flex justify-end gap-1">
                              <button onClick={() => handleEdit(child)} className="p-2 text-gray-200 hover:text-primary transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(child.id)} className="p-2 text-gray-200 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-20 text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in">
                   <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-dashed border-gray-200">
                      <Globe className="w-10 h-10 text-gray-200" />
                   </div>
                   <div>
                     <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Struktur Navigasi Masih Kosong</p>
                     <p className="text-gray-300 text-[10px] mt-2 italic">Tambahkan menu pertama Anda untuk ditampilkan di website.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
          <div className="bg-blue-500 text-white p-2 rounded-xl"><ExternalLink className="w-5 h-5" /></div>
          <div>
             <h4 className="font-black text-blue-900 text-xs uppercase tracking-widest mb-1">Tips Navigasi</h4>
             <p className="text-blue-700/70 text-[11px] leading-relaxed font-medium">
               Gunakan link internal seperti <code className="bg-blue-100 px-1 rounded">/berita</code> atau <code className="bg-blue-100 px-1 rounded">/profil/sejarah</code> untuk halaman dalam website. Untuk link luar, pastikan menggunakan awalan <code className="bg-blue-100 px-1 rounded">https://</code>.
             </p>
          </div>
      </div>
    </div>
  );
}
