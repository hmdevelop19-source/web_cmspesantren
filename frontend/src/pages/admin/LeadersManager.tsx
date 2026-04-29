import { useState } from 'react';
import { 
  Users, Plus, Trash2, Edit2, Save, X, 
  Upload, Image as ImageIcon, Loader2, 
  ArrowUp, ArrowDown, History
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { getImageUrl } from '../../lib/utils';
import Skeleton from '../../components/ui/Skeleton';

interface Leader {
  id: number;
  name: string;
  photo: string | null;
  period: string;
  sort_order: number;
  is_active: boolean;
}

export default function LeadersManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data: leaders = [], isLoading } = useQuery<Leader[]>({
    queryKey: ['admin-leaders'],
    queryFn: async () => {
      const response = await api.get('/leaders');
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (editingLeader) {
        // Laravel spoofing for PUT with files
        data.append('_method', 'PUT');
        return api.post(`/leaders/${editingLeader.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      return api.post('/leaders', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leaders'] });
      resetForm();
    },
    onError: () => alert('Gagal menyimpan data pengasuh.')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/leaders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-leaders'] }),
    onError: () => alert('Gagal menghapus data.')
  });

  const resetForm = () => {
    setName('');
    setPeriod('');
    setSortOrder(0);
    setIsActive(true);
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditingLeader(null);
    setShowForm(false);
  };

  const handleEdit = (leader: Leader) => {
    setEditingLeader(leader);
    setName(leader.name);
    setPeriod(leader.period);
    setSortOrder(leader.sort_order);
    setIsActive(leader.is_active);
    setPhotoPreview(leader.photo ? getImageUrl(leader.photo) : null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('period', period);
    formData.append('sort_order', sortOrder.toString());
    formData.append('is_active', isActive ? '1' : '0');
    if (photoFile) formData.append('photo', photoFile);

    mutation.mutate(formData);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-primary" />
            Silsilah Pengasuh
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kelola daftar pengasuh pesantren dari masa ke masa</p>
        </div>

        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah Pengasuh
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
           <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-600">
                {editingLeader ? 'Edit Data Pengasuh' : 'Input Pengasuh Baru'}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
           </div>

           <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Photo Upload Area */}
              <div className="md:col-span-1 space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Foto Pengasuh</label>
                <div 
                  onClick={() => document.getElementById('photo-input')?.click()}
                  className="aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative group"
                >
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2 uppercase">
                        <Upload className="w-4 h-4" /> Ganti Foto
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm"><ImageIcon className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Klik Unggah Foto</span>
                    </div>
                  )}
                  <input id="photo-input" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </div>
              </div>

              {/* Data Area */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap & Gelar</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: KH. Ahmad Dahlan" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Masa Jabatan</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: 1990 - 2010" 
                        required
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Urutan (Angka)</label>
                      <input 
                        type="number" 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      <span className="ml-3 text-sm font-bold text-slate-600">Tampilkan di Publik</span>
                    </label>
                  </div>
                </div>

                <div className="pt-8 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest">Batal</button>
                  <button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="bg-primary text-white px-10 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Data
                  </button>
                </div>
              </div>
           </form>
        </div>
      )}

      {/* Grid List Pengasuh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} height="300px" className="rounded-2xl" />)
        ) : (
          leaders.map((leader) => (
            <div key={leader.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-black/5 transition-all relative">
              <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                {leader.photo ? (
                  <img src={getImageUrl(leader.photo)} alt={leader.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-12 h-12" /></div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur shadow-sm px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                  #{leader.sort_order}
                </div>
                {!leader.is_active && (
                   <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-500 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-[0.2em]">Nonaktif</span>
                   </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-800 line-clamp-1 uppercase tracking-tight">{leader.name}</h3>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{leader.period}</p>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                   <button 
                    onClick={() => handleEdit(leader)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                   >
                     <Edit2 className="w-3 h-3" /> Edit
                   </button>
                   <button 
                    onClick={() => handleDelete(leader.id)}
                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && leaders.length === 0 && !showForm && (
        <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
           <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"><Users className="w-8 h-8 text-slate-200" /></div>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Belum ada data pengasuh yang diinput.</p>
           <button onClick={() => setShowForm(true)} className="mt-4 text-primary font-black text-[10px] uppercase border-b-2 border-primary pb-0.5">Mulai Tambah Data</button>
        </div>
      )}
    </div>
  );
}
