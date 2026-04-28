import { Search, Megaphone, Loader2, Trash2, Edit3, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Announcement, PaginatedResponse } from '../../types';

export default function Pengumumans() {
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<Announcement>>({
    queryKey: ['admin-announcements', triggerSearch],
    queryFn: async () => {
      const response = await api.get('/announcements', {
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
    mutationFn: (id: number) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
    onError: (error: any) => {
      alert('Gagal menghapus pengumuman. ' + (error.response?.data?.message || ''));
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const announcements = data?.data || [];
  const total = data?.total || 0;

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('pengumumans');

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Manajemen Pengumuman</h1>
           {hasWriteAccess && (
             <Link to="/admin/pengumumans/create" className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded text-sm transition-all flex items-center gap-2 font-medium">
                Tambahkan Baru
             </Link>
           )}
        </div>
        
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); setTriggerSearch(searchTerm); }}>
           <div className="relative">
              <input 
                type="text" 
                placeholder="Cari pengumuman..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10 transition-all font-medium" 
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
           </div>
           <button type="submit" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 flex items-center gap-1 h-10 font-bold transition-all">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
           </button>
        </form>
      </div>

      <div className="flex justify-between items-center mb-4 text-sm">
         <div className="flex gap-4">
            <span className="text-gray-500 font-bold">Semua <span className="text-gray-400 font-normal">({total})</span></span>
         </div>
      </div>
      
      <div className="flex gap-2 flex-wrap mb-4">
         <select className="border border-gray-300 rounded px-3 py-1.5 text-[13px] bg-white text-gray-700 focus:ring-1 focus:ring-primary outline-none">
            <option>Tindakan Massal</option>
         </select>
         <button className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md text-[13px] hover:bg-gray-50 font-bold transition-all">Terapkan</button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden min-h-[400px] relative">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-[#f6f7f7] border-b border-gray-200 text-gray-600">
                  <tr>
                     <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded text-primary focus:ring-primary" /></th>
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Judul Pengumuman</th>
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Sifat / Prioritas</th>
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Tanggal Rilis</th>
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-gray-500 font-medium">Memuat pengumuman...</span>
                        </div>
                      </td>
                    </tr>
                  ) : announcements.length > 0 ? (
                    announcements.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 group transition-colors">
                         <td className="px-4 py-4"><input type="checkbox" className="rounded text-primary focus:ring-primary" /></td>
                         <td className="px-4 py-4 text-left">
                            <Link to={hasWriteAccess ? `/admin/pengumumans/edit/${row.id}` : '#'} className={`font-bold text-primary group-hover:text-primary-dark transition-colors flex items-center gap-2 text-left ${!hasWriteAccess && 'pointer-events-none'}`}>
                               <Megaphone className={`w-4 h-4 ${row.priority === 'high' ? 'text-red-500' : 'text-gray-400'}`} /> {row.title}
                            </Link>
                            <div className="text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 mt-1.5 flex gap-2.5 transition-all">
                               {hasWriteAccess && (
                                 <>
                                   <Link to={`/admin/pengumumans/edit/${row.id}`} className="hover:text-primary flex items-center gap-1"><Edit3 className="w-3 h-3" /> Sunting</Link> | 
                                   <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"><Trash2 className="w-3 h-3" /> Hapus</button> | 
                                 </>
                               )}
                               <a href={`/pengumuman/${row.slug}`} target="_blank" rel="noreferrer" className="hover:text-primary flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Tampil</a>
                            </div>
                         </td>
                         <td className="px-4 py-4">
                            {row.priority === 'high' ? <span className="text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded text-[11px] uppercase border border-red-100 italic">Penting</span> : <span className="text-gray-600 font-medium bg-gray-50 px-2.5 py-1 rounded text-[11px] uppercase border border-gray-100">Biasa</span>}
                         </td>
                         <td className="px-4 py-4 font-mono text-[11px] font-bold text-gray-700 italic">
                            {new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                         </td>
                         <td className="px-4 py-4">
                            {row.status === 'published' 
                               ? <span className="text-green-700 font-bold text-[10px] uppercase bg-green-50 px-2 py-1 rounded border border-green-100">Diterbitkan</span> 
                               : <span className="text-gray-500 font-bold text-[10px] uppercase bg-gray-50 px-2 py-1 rounded border border-gray-100">Draf</span>}
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-20 text-center text-gray-500 text-sm italic">
                        Belum ada pengumuman yang ditambahkan.
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
