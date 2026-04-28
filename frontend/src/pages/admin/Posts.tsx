import { Search, MessageSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import Skeleton from '../../components/ui/Skeleton';
import type { Post, PaginatedResponse } from '../../types';

export default function Posts() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<Post>>({
    queryKey: ['admin-posts', page, triggerSearch],
    queryFn: async () => {
      const response = await api.get('/posts', {
        params: { 
          search: triggerSearch,
          page: page
        }
      });
      const resData = response.data;
      if (resData.meta) {
        return { ...resData.meta, data: resData.data, links: resData.links };
      }
      return resData;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (error: any) => {
      alert('Gagal menghapus pos. ' + (error.response?.data?.message || ''));
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pos ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const posts = data?.data || [];
  const meta = data;

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('posts');

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Pos</h1>
           {hasWriteAccess && (
             <Link to="/admin/posts/create" className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1">
                Tambahkan Baru
             </Link>
           )}
        </div>
        
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); setTriggerSearch(searchTerm); setPage(1); }}>
           <div className="relative">
              <input 
                type="text" 
                placeholder="Cari pos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 rounded px-3 py-1.5 pl-8 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-9" 
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
           </div>
           <button type="submit" className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1 h-9 font-medium">
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cari'}
           </button>
        </form>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center mb-4 text-sm">
         <div className="flex gap-4">
            <span className="text-gray-500 font-bold">Semua <span className="text-gray-400 font-normal">({meta?.total || 0})</span></span>
         </div>
      </div>
      
      <div className="flex gap-2 flex-wrap mb-4">
         <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
            <option>Tindakan Massal</option>
         </select>
         <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 text-wrap">Terapkan</button>
         
         <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white ml-2">
            <option>Semua tanggal</option>
         </select>
         
         <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
            <option>Semua kategori</option>
         </select>
         
         <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">Saring</button>
      </div>

      {/* WP Style Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden min-h-[400px] relative">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-[#f6f7f7] border-b border-gray-200 text-gray-700">
                  <tr>
                     <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded text-primary focus:ring-primary" /></th>
                     <th className="px-4 py-3 font-semibold text-xs tracking-tight">Judul</th>
                     <th className="px-4 py-3 font-semibold text-xs tracking-tight">Penulis</th>
                     <th className="px-4 py-3 font-semibold text-xs tracking-tight">Kategori</th>
                     <th className="px-4 py-3 font-semibold text-xs tracking-tight"><MessageSquare className="w-4 h-4" /></th>
                     <th className="px-4 py-3 font-semibold text-xs tracking-tight">Tanggal</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                           <td className="px-4 py-3"><Skeleton variant="rectangular" width={16} height={16} className="rounded" /></td>
                           <td className="px-4 py-3">
                              <Skeleton variant="text" width="70%" className="mb-2" />
                              <Skeleton variant="text" width="30%" />
                           </td>
                           <td className="px-4 py-3"><Skeleton variant="text" width="50%" /></td>
                           <td className="px-4 py-3"><Skeleton variant="text" width="40%" /></td>
                           <td className="px-4 py-3"><Skeleton variant="rectangular" width={20} height={20} className="rounded" /></td>
                           <td className="px-4 py-3"><Skeleton variant="text" width="60%" /></td>
                        </tr>
                     ))
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                       <tr key={post.id} className="hover:bg-gray-50 group">
                          <td className="px-4 py-3"><input type="checkbox" className="rounded text-primary focus:ring-primary" /></td>
                          <td className="px-4 py-3">
                             <Link to={hasWriteAccess ? `/admin/posts/edit/${post.id}` : '#'} className={`font-bold text-primary group-hover:text-primary-light transition-colors ${!hasWriteAccess && 'pointer-events-none'}`}>{post.title}</Link>
                             {post.status === 'draft' && <span className="ml-2 text-gray-400 font-normal italic">— Draf</span>}
                             <div className="text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 mt-1 flex gap-2 transition-opacity">
                                {hasWriteAccess && (
                                  <>
                                    <Link to={`/admin/posts/edit/${post.id}`} className="hover:text-primary cursor-pointer">Sunting</Link> | 
                                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800 cursor-pointer">Buang</button> | 
                                  </>
                                )}
                                <a href={`/berita/${post.slug}`} target="_blank" rel="noreferrer" className="hover:text-primary cursor-pointer">Tampil</a>
                             </div>
                          </td>
                          <td className="px-4 py-3 text-primary font-medium">{post.user?.name || 'Admin'}</td>
                          <td className="px-4 py-3 text-primary font-medium">{post.category?.name || '—'}</td>
                          <td className="px-4 py-3 text-gray-400">0</td>
                          <td className="px-4 py-3 whitespace-pre-line text-[11px] leading-tight text-gray-600">
                            {post.status === 'published' ? 'Telah Terbit' : 'Terakhir Disunting'}<br />
                            {new Date(post.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </td>
                       </tr>
                    ))
                  ) : (
                     <tr>
                       <td colSpan={6} className="px-4 py-20 text-center text-gray-500 text-xs italic">
                         Tidak ada pos ditemukan.
                       </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
      
      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-between items-center mt-4 text-xs font-medium text-gray-600">
           <div>Menampilkan {posts.length} dari {meta.total} item</div>
           <div className="flex gap-1">
              {Array.from({ length: meta.last_page }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 border border-gray-300 rounded ${meta.current_page === i + 1 ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50'}`}
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
