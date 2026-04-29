import { Search, CalendarDays, Trash2, Edit3, ExternalLink, Plus, RefreshCw, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Agenda, PaginatedResponse } from '../../types';
import Skeleton from '../../components/ui/Skeleton';

export default function Agendas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<Agenda>>({
    queryKey: ['admin-agendas', triggerSearch],
    queryFn: async () => {
      const response = await api.get('/agendas', {
        params: { search: triggerSearch }
      });
      const resData = response.data;
      if (resData.meta) {
        return { ...resData.meta, data: resData.data, links: resData.links };
      }
      return resData;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/agendas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agendas'] });
    },
    onError: (error: any) => {
      alert('Gagal menghapus agenda. ' + (error.response?.data?.message || ''));
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const agendas = data?.data || [];
  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('agendas');

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Agenda</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola jadwal kegiatan, acara, dan kalender akademik pesantren</p>
        </div>

        {hasWriteAccess && (
          <Link to="/admin/agendas/create" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10">
            <Plus className="w-4 h-4" /> Tambah Agenda Baru
          </Link>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <form className="w-full lg:w-96 relative" onSubmit={(e) => { e.preventDefault(); setTriggerSearch(searchTerm); }}>
           <input 
             type="text" 
             placeholder="Cari agenda atau acara..." 
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-agendas'] })}
             className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all border border-slate-200 bg-white"
             title="Refresh Data"
           >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Informasi Kegiatan</th>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Waktu & Lokasi</th>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                           <td className="px-8 py-5"><Skeleton variant="text" width="70%" height={20} /></td>
                           <td className="px-8 py-5"><Skeleton variant="text" width="50%" /></td>
                           <td className="px-8 py-5"><Skeleton variant="text" width="30%" /></td>
                           <td className="px-8 py-5 text-right"><Skeleton variant="rectangular" width={80} height={32} className="rounded-lg inline-block" /></td>
                        </tr>
                     ))
                  ) : agendas.length > 0 ? (
                    agendas.map((row) => (
                       <tr key={row.id} className="group hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                   <CalendarDays className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                   <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{row.title}</p>
                                   <p className="text-[11px] text-slate-400 mt-0.5 truncate font-medium">Slug: {row.slug}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                   <Clock className="w-3.5 h-3.5 text-primary/40" />
                                   {new Date(row.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium ml-5">{row.location || 'Lokasi tidak ditentukan'}</p>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             {row.status === 'published' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-100">
                                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Aktif
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Draf
                                </span>
                             )}
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <Link to={`/admin/agendas/edit/${row.id}`} className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit Agenda">
                                   <Edit3 className="w-4 h-4" />
                                </Link>
                                <a href={`/agenda/${row.slug}`} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Lihat Publik">
                                   <ExternalLink className="w-4 h-4" />
                                </a>
                                <button onClick={() => handleDelete(row.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus Agenda">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={4} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-4 text-slate-300">
                             <CalendarDays className="w-12 h-12 opacity-20" />
                             <p className="text-sm font-medium italic">Belum ada agenda ditemukan</p>
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
