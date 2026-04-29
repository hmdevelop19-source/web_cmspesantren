import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Edit2, Trash2, Loader2, MessageSquare, 
  CheckCircle2, XCircle, Filter, User, Calendar, Quote,
  Image as ImageIcon, X
} from 'lucide-react';
import api from '../../lib/api';
import MediaSelector from '../../components/admin/MediaSelector';
import { getImageUrl } from '../../lib/utils';

interface Testimonial {
  id: number;
  name: string;
  tahun_mondok: string;
  content: string;
  avatar: string | null;
  status: 'published' | 'draft';
}

export default function Testimonials() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tahun_mondok: '',
    content: '',
    avatar: '',
    status: 'published' as 'published' | 'draft'
  });

  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const response = await api.get('/testimonials');
      return response.data;
    },
    staleTime: 0, // Paksa ambil data baru setiap saat
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/testimonials', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => api.put(`/testimonials/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/testimonials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    }
  });

  const openModal = (item?: Testimonial) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        tahun_mondok: item.tahun_mondok,
        content: item.content,
        avatar: item.avatar || '',
        status: item.status
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        tahun_mondok: '',
        content: '',
        avatar: '',
        status: 'published'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTestimonials = testimonials.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tahun_mondok.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-3">
            <Quote className="w-8 h-8 text-primary" />
            Testimoni Alumni
          </h1>
          <p className="text-sm text-slate-500 font-medium">Kelola pesan kesan dan apresiasi dari para alumni pesantren</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Testimoni
        </button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="pl-4 pr-2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Cari nama alumni atau tahun mondok..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium p-3"
          />
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-xl font-black text-slate-800 leading-none">{testimonials.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profil Alumni</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pesan & Kesan</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menyelaraskan Data...</p>
                  </td>
                </tr>
              ) : filteredTestimonials.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-medium italic">Belum ada data testimoni.</p>
                  </td>
                </tr>
              ) : (
                filteredTestimonials.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-inner">
                          {item.avatar ? (
                            <img src={getImageUrl(item.avatar)} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                          <p className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-widest mt-1">
                            <Calendar className="w-3 h-3" />
                            Mondok: {item.tahun_mondok}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-md">
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic font-medium">"{item.content}"</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.status === 'published' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {item.status === 'published' ? 'Tampil' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(item)}
                          className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-white border border-slate-200 text-red-500 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">{editingItem ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Lengkapi data alumni di bawah ini</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                    placeholder="Contoh: Ahmad Fauzi, S.H."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun Mondok</label>
                  <input 
                    required
                    type="text" 
                    value={formData.tahun_mondok}
                    onChange={(e) => setFormData({...formData, tahun_mondok: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                    placeholder="Contoh: 2018 - 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pesan & Kesan</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium italic focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                  placeholder="Tuliskan pengalaman alumni di sini..."
                ></textarea>
              </div>

              <div className="flex items-center gap-8 py-4 border-y border-slate-50">
                <div className="space-y-2 shrink-0">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Foto / Avatar</label>
                  <div 
                    onClick={() => setIsMediaSelectorOpen(true)}
                    className="w-16 h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative group"
                  >
                    {formData.avatar ? (
                      <img src={getImageUrl(formData.avatar)} className="w-full h-full object-cover" />
                    ) : (
                      <Plus className="w-5 h-5 text-slate-300 group-hover:text-primary" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Status Publikasi</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, status: 'published'})}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.status === 'published' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 border border-slate-200'
                      }`}
                    >
                      Publikasi
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, status: 'draft'})}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.status === 'draft' ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20' : 'bg-slate-50 text-slate-400 border border-slate-200'
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Batalkan
                </button>
                <button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-4 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Selector */}
      <MediaSelector 
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={(media) => {
          setFormData({...formData, avatar: media.file_path});
          setIsMediaSelectorOpen(false);
        }}
      />
    </div>
  );
}
