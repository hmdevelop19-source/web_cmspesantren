import { Search, FileText, Trash2, Edit3, Globe, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Page, PaginatedResponse } from '../../types';
import Skeleton from '../../components/ui/Skeleton';

export default function Pages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('pages');

  const { data, isLoading } = useQuery<PaginatedResponse<Page>>({
    queryKey: ['admin-pages', page, triggerSearch],
    queryFn: async () => {
      const response = await api.get('/pages', {
        params: { 
          search: triggerSearch,
          page: page
        }
      });
      return response.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
    },
    onError: (error: any) => {
      alert('Gagal menghapus laman. ' + (error.response?.data?.message || ''));
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laman ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const pages = data?.data || [];

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Laman Statis</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola konten halaman utama seperti Profil, Sejarah, dan Visi Misi</p>
        </div>

        {hasWriteAccess && (
          <Link to="/admin/pages/create" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10">
            <Plus className="w-4 h-4" /> Buat Laman Baru
          </Link>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <form className="w-full lg:w-96 relative" onSubmit={(e) => { e.preventDefault(); setTriggerSearch(searchTerm); setPage(1); }}>
           <input 
             type="text" 
             placeholder="Cari laman statis..." 
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-pages'] })}
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
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Judul Laman</th>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                           <td className="px-8 py-5"><Skeleton variant="text" width="60%" height={20} /></td>
                           <td className="px-8 py-5"><Skeleton variant="text" width="30%" /></td>
                           <td className="px-8 py-5 text-right"><Skeleton variant="rectangular" width={80} height={32} className="rounded-lg inline-block" /></td>
                        </tr>
                     ))
                  ) : pages.length > 0 ? (
                    pages.map((row) => (
                       <tr key={row.id} className="group hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                   <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                   <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{row.title}</p>
                                   <code className="text-[10px] text-primary font-mono font-bold mt-0.5 block opacity-60">/{row.slug}</code>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex flex-col gap-1">
                                {row.status === 'published' ? (
                                   <span className="inline-flex items-center gap-1.5 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Terbit
                                   </span>
                                ) : (
                                   <span className="inline-flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                      Draf
                                   </span>
                                )}
                                <span className="text-[9px] text-slate-400 font-medium">{new Date(row.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <Link to={`/admin/pages/edit/${row.id}`} className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit Laman">
                                   <Edit3 className="w-4 h-4" />
                                </Link>
                                <a href={`/pages/${row.slug}`} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Lihat Publik">
                                   <Globe className="w-4 h-4" />
                                </a>
                                <button onClick={() => handleDelete(row.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus Laman">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={3} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-4 text-slate-300">
                             <FileText className="w-12 h-12 opacity-20" />
                             <p className="text-sm font-medium italic">Belum ada laman ditemukan</p>
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
