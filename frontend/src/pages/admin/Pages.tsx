import { Search, MessageSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function Pages() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [meta, setMeta] = useState<any>(null);

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('pages');

  const fetchPages = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get('/pages', {
        params: { 
          search: searchTerm,
          page: page
        }
      });
      setPages(response.data.data);
      setMeta(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laman ini?')) {
      try {
        await api.delete(`/pages/${id}`);
        setPages(prev => prev.filter(p => p.id !== id));
        fetchPages();
      } catch (error) {
        alert('Gagal menghapus laman.');
      }
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Laman</h1>
           {hasWriteAccess && (
             <Link to="/admin/pages/create" className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1">
                Tambahkan Baru
             </Link>
           )}
        </div>
        
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); fetchPages(); }}>
           <div className="relative">
              <input 
                type="text" 
                placeholder="Cari laman..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 rounded px-3 py-1.5 pl-8 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
           </div>
           <button type="submit" className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1 font-medium transition-colors">
              Pencarian
           </button>
        </form>
      </div>

      <div className="flex justify-between items-center mb-4 text-sm">
         <div className="flex gap-4">
            <span className="text-gray-500 font-bold">Semua <span className="text-gray-400 font-normal">({meta?.total || 0})</span></span>
         </div>
      </div>
      
      <div className="flex gap-2 flex-wrap mb-4">
         <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
            <option>Tindakan Massal</option>
         </select>
         <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">Terapkan</button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden min-h-[300px] relative">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-[#f6f7f7] border-b border-gray-200 text-gray-700">
                  <tr>
                     <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded text-primary focus:ring-primary" /></th>
                     <th className="px-4 py-3 font-semibold text-xs tracking-tight">Judul</th>
                     <th className="px-4 py-3 font-semibold text-xs tracking-tight">Penulis</th>
                     <th className="px-4 py-3 font-semibold text-xs tracking-tight"><MessageSquare className="w-4 h-4 text-gray-500" /></th>
                     <th className="px-4 py-3 font-semibold text-xs tracking-tight">Tanggal</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        <span className="text-gray-500">Memuat data...</span>
                      </td>
                    </tr>
                  ) : pages.length > 0 ? (
                    pages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50 group">
                         <td className="px-4 py-3"><input type="checkbox" className="rounded text-primary focus:ring-primary" /></td>
                         <td className="px-4 py-3">
                            <span className={`font-bold text-gray-900 ${hasWriteAccess ? 'group-hover:text-primary cursor-pointer' : ''}`}>{page.title}</span>
                            <div className="text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 mt-1 flex gap-2 transition-opacity">
                               {hasWriteAccess && (
                                 <>
                                   <Link to={`/admin/pages/edit/${page.id}`} className="hover:text-primary cursor-pointer">Sunting</Link> | 
                                   <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:text-red-800 cursor-pointer">Buang</button> | 
                                 </>
                               )}
                               <a href={`/pages/${page.slug}`} target="_blank" rel="noreferrer" className="hover:text-primary cursor-pointer">Tampil</a>
                            </div>
                         </td>
                         <td className="px-4 py-3 text-primary font-medium">Admin</td>
                         <td className="px-4 py-3">0</td>
                         <td className="px-4 py-3 whitespace-pre-line text-[11px] leading-tight text-gray-600">
                            {page.status === 'published' ? 'Telah Terbit' : 'Draf'}<br />
                            {new Date(page.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-20 text-center text-gray-500 italic">
                        Tidak ada laman ditemukan.
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
