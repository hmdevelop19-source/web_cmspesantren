import { Search, CalendarDays, Loader2, Trash2, Edit3, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function Agendas() {
  const [agendas, setAgendas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);

  const fetchAgendas = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/agendas', {
        params: { search: searchTerm }
      });
      setAgendas(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching agendas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
      try {
        await api.delete(`/agendas/${id}`);
        fetchAgendas();
      } catch (error) {
        alert('Gagal menghapus agenda.');
      }
    }
  };

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('agendas');

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Manajemen Agenda</h1>
           {hasWriteAccess && (
             <Link to="/admin/agendas/create" className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded text-sm transition-all flex items-center gap-2 font-medium">
                Tambahkan Baru
             </Link>
           )}
        </div>
        
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); fetchAgendas(); }}>
           <div className="relative">
              <input 
                type="text" 
                placeholder="Cari agenda..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10 transition-all font-medium" 
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
           </div>
           <button type="submit" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 flex items-center gap-1 h-10 font-bold transition-all">
              Cari
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
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Judul Kegiatan</th>
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Lokasi</th>
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Tanggal Pelaksanaan</th>
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-gray-500 font-medium">Memuat agenda...</span>
                        </div>
                      </td>
                    </tr>
                  ) : agendas.length > 0 ? (
                    agendas.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 group transition-colors">
                         <td className="px-4 py-4"><input type="checkbox" className="rounded text-primary focus:ring-primary" /></td>
                         <td className="px-4 py-4">
                            <Link to={hasWriteAccess ? `/admin/agendas/edit/${row.id}` : '#'} className={`font-bold text-primary group-hover:text-primary-dark transition-colors ${!hasWriteAccess && 'pointer-events-none'}`}>{row.title}</Link>
                            <div className="text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 mt-1.5 flex gap-2.5 transition-all">
                               {hasWriteAccess && (
                                 <>
                                   <Link to={`/admin/agendas/edit/${row.id}`} className="hover:text-primary flex items-center gap-1"><Edit3 className="w-3 h-3" /> Sunting</Link> | 
                                   <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"><Trash2 className="w-3 h-3" /> Hapus</button> | 
                                 </>
                               )}
                               <a href={`/agenda/${row.slug}`} target="_blank" rel="noreferrer" className="hover:text-primary flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Tampil</a>
                            </div>
                         </td>
                         <td className="px-4 py-4 text-gray-600 font-medium">{row.location || '—'}</td>
                         <td className="px-4 py-4 font-mono text-[11px] flex items-center gap-2 text-gray-700 font-bold">
                            <CalendarDays className="w-4 h-4 text-primary opacity-70" /> 
                            {new Date(row.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
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
                        Belum ada agenda yang ditambahkan.
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
