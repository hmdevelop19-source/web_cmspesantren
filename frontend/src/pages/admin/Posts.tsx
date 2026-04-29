import { Search, Newspaper, Trash2, Edit2, Globe, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Post, PaginatedResponse } from '../../types';
import Skeleton from '../../components/ui/Skeleton';

export default function Posts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('posts');

  const { data, isLoading } = useQuery<PaginatedResponse<Post>>({
    queryKey: ['admin-posts', page, triggerSearch],
    queryFn: async () => {
      const response = await api.get('/posts', {
        params: { 
          page, 
          search: triggerSearch,
          per_page: 10
        }
      });
      return response.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Hapus berita ini secara permanen?')) {
      deleteMutation.mutate(id);
    }
  };

  const posts = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Warta</h1>
          <p className="text-sm text-slate-500 mt-1">Publikasikan berita, artikel, dan informasi terkini pesantren</p>
        </div>

        {hasWriteAccess && (
          <Link to="/admin/posts/create" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10">
            <Plus className="w-4 h-4" /> Tambah Warta Baru
          </Link>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <form className="w-full lg:w-96 relative" onSubmit={(e) => { e.preventDefault(); setTriggerSearch(searchTerm); setPage(1); }}>
           <input 
             type="text" 
             placeholder="Cari berita atau artikel..." 
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-posts'] })}
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
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Informasi Warta</th>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kategori</th>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                           <td className="px-8 py-5"><Skeleton variant="text" width="70%" height={20} /></td>
                           <td className="px-8 py-5"><Skeleton variant="text" width="40%" /></td>
                           <td className="px-8 py-5"><Skeleton variant="text" width="30%" /></td>
                           <td className="px-8 py-5 text-right"><Skeleton variant="rectangular" width={80} height={32} className="rounded-lg inline-block" /></td>
                        </tr>
                     ))
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                       <tr key={post.id} className="group hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                   <Newspaper className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                   <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{post.title}</p>
                                   <p className="text-[11px] text-slate-400 mt-0.5 truncate font-medium flex items-center gap-1.5">
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span> {post.user?.name || 'Admin'}
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="inline-flex px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                {post.category?.name || 'Umum'}
                             </span>
                          </td>
                          <td className="px-8 py-5">
                             {post.status === 'published' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-100">
                                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Terbit
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                   Draf
                                </span>
                             )}
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <Link to={`/admin/posts/edit/${post.id}`} className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit Berita">
                                   <Edit2 className="w-4 h-4" />
                                </Link>
                                <a href={`/berita/${post.slug}`} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Lihat Publik">
                                   <Globe className="w-4 h-4" />
                                </a>
                                <button onClick={() => handleDelete(post.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus Berita">
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
                             <Newspaper className="w-12 h-12 opacity-20" />
                             <p className="text-sm font-medium italic">Belum ada berita ditemukan</p>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
      
      {/* Pagination Section */}
      {meta && (meta.last_page ?? 0) > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-6">
           <p className="text-[11px] font-bold text-slate-400">
              Menampilkan <span className="text-slate-900">{posts.length}</span> Berita dari Total <span className="text-slate-900">{meta.total}</span>
           </p>
           <div className="flex gap-1.5">
              {Array.from({ length: meta.last_page ?? 0 }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setPage(i + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-9 h-9 rounded-lg font-bold text-xs transition-all flex items-center justify-center border ${meta.current_page === i + 1 ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border-slate-200 hover:border-primary hover:text-primary shadow-sm'}`}
                >
                  {i + 1}
                </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
