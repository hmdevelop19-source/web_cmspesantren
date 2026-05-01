import { Search, Building2, Trash2, Edit2, Plus, RefreshCw, GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import Skeleton from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

interface Facility {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  icon: string | null;
  order: number;
  is_active: boolean;
}

export default function Facilities() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('settings'); // Reusing settings permission or we could add 'facilities'

  const { data: facilities = [], isLoading } = useQuery<Facility[]>({
    queryKey: ['admin-facilities'],
    queryFn: async () => {
      const response = await api.get('/facilities');
      return response.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/facilities/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin-facilities'] });
      const previousData = queryClient.getQueryData(['admin-facilities']);
      queryClient.setQueryData(['admin-facilities'], (old: any) => 
        old?.filter((f: Facility) => f.id !== id)
      );
      return { previousData };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['admin-facilities'], context?.previousData);
      alert('Gagal menghapus fasilitas.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-facilities'] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number, is_active: boolean }) => 
      api.put(`/facilities/${id}`, { is_active }),
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-facilities'] });
      const previousData = queryClient.getQueryData(['admin-facilities']);
      queryClient.setQueryData(['admin-facilities'], (old: any) => 
        old?.map((f: Facility) => f.id === id ? { ...f, is_active } : f)
      );
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['admin-facilities'], context?.previousData);
      alert('Gagal mengubah status fasilitas.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-facilities'] });
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Hapus fasilitas ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredFacilities = facilities.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8 text-left">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Fasilitas Pesantren</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola daftar gedung, sarana prasarana, dan fasilitas pendukung lainnya</p>
        </div>

        {hasWriteAccess && (
          <Link to="/admin/facilities/create" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10">
            <Plus className="w-4 h-4" /> Tambah Fasilitas
          </Link>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="w-full lg:w-96 relative">
           <input 
             type="text" 
             placeholder="Cari fasilitas..." 
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-facilities'] })}
          className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all border border-slate-200 bg-white"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden text-left">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-12">#</th>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Informasi Fasilitas</th>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Urutan</th>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                     <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                           <td className="px-8 py-5"><Skeleton variant="text" width={20} /></td>
                           <td className="px-8 py-5"><Skeleton variant="text" width="60%" height={20} /></td>
                           <td className="px-8 py-5"><Skeleton variant="text" width="20%" className="mx-auto" /></td>
                           <td className="px-8 py-5 text-center"><Skeleton variant="rectangular" width={60} height={24} className="rounded-full mx-auto" /></td>
                           <td className="px-8 py-5 text-right"><Skeleton variant="rectangular" width={80} height={32} className="rounded-lg inline-block" /></td>
                        </tr>
                     ))
                  ) : filteredFacilities.length > 0 ? (
                    filteredFacilities.map((f) => (
                       <tr key={f.id} className="group hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-5">
                             <GripVertical className="w-4 h-4 text-slate-300" />
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                {f.image_url ? (
                                  <img src={f.image_url} alt={f.title} className="w-12 h-12 rounded-lg object-cover border border-slate-100 shadow-sm" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                     <Building2 className="w-6 h-6" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                   <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{f.title}</p>
                                   <p className="text-[11px] text-slate-400 mt-0.5 truncate font-medium italic">Icon: {f.icon || 'Default'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className="text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">{f.order}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <button 
                               onClick={() => toggleStatusMutation.mutate({ id: f.id, is_active: !f.is_active })}
                               className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${f.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                             >
                               {f.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                               {f.is_active ? 'Aktif' : 'Nonaktif'}
                             </button>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <Link to={`/admin/facilities/edit/${f.id}`} className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                                   <Edit2 className="w-4 h-4" />
                                </Link>
                                <button onClick={() => handleDelete(f.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={5} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-4 text-slate-300">
                             <Building2 className="w-12 h-12 opacity-20" />
                             <p className="text-sm font-medium italic">Belum ada fasilitas ditemukan</p>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
