import { Search, PlayCircle, Loader2, Trash2, Edit3, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function Videos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [meta, setMeta] = useState<any>(null);
  const [total, setTotal] = useState(0);

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('videos');

  const fetchVideos = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get('/videos', {
        params: { 
          search: searchTerm,
          page: page
        }
      });
      setVideos(response.data.data);
      setTotal(response.data.total);
      setMeta(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus video ini?')) {
      try {
        await api.delete(`/videos/${id}`);
        fetchVideos();
      } catch (error) {
        alert('Gagal menghapus video.');
      }
    }
  };

  const handleSetFeatured = async (id: number) => {
    try {
      await api.put(`/videos/${id}`, { 
        title: videos.find(v => v.id === id).title,
        youtube_url: videos.find(v => v.id === id).youtube_url,
        is_featured: true 
      });
      fetchVideos();
    } catch (error) {
      alert('Gagal mengatur video utama.');
    }
  };

  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Video Kegiatan</h1>
           {hasWriteAccess && (
             <Link to="/admin/videos/create" className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded text-sm transition-all flex items-center gap-2 font-medium">
                Tambahkan Video Baru
             </Link>
           )}
        </div>
        
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); fetchVideos(); }}>
           <div className="relative">
              <input 
                type="text" 
                placeholder="Cari judul video..." 
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
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Thumbnail</th>
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Detail Video</th>
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Tautan</th>
                     <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Status Utama</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                          <span className="text-gray-500 font-medium">Memuat pustaka video...</span>
                        </div>
                      </td>
                    </tr>
                  ) : videos.length > 0 ? (
                    videos.map((row) => (
                      <tr key={row.id} className={`hover:bg-gray-50 group transition-colors ${row.is_featured ? 'bg-yellow-50/30' : ''}`}>
                         <td className="px-4 py-4 align-top"><input type="checkbox" className="rounded text-primary focus:ring-primary mt-1" /></td>
                         <td className="px-4 py-4 w-48">
                            <div className="aspect-video bg-gray-100 rounded-lg relative overflow-hidden flex items-center justify-center border border-gray-200 shadow-sm">
                               <img 
                                 src={`https://img.youtube.com/vi/${getYouTubeID(row.youtube_url)}/mqdefault.jpg`} 
                                 alt="Thumbnail" 
                                 className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                               />
                               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                               <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10 text-white shadow-xl ring-1 ring-white/30">
                                  <PlayCircle className="w-6 h-6 fill-current" />
                               </div>
                            </div>
                         </td>
                         <td className="px-4 py-4 align-top">
                            <Link to={hasWriteAccess ? `/admin/videos/edit/${row.id}` : '#'} className={`font-bold text-primary group-hover:text-primary-dark transition-colors text-base line-clamp-2 mb-1.5 ${!hasWriteAccess && 'pointer-events-none'}`}>{row.title}</Link>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{row.description || 'Tidak ada deskripsi.'}</p>
                            <div className="text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 mt-3 flex gap-3 transition-all font-bold">
                               {hasWriteAccess && (
                                 <>
                                   <Link to={`/admin/videos/edit/${row.id}`} className="hover:text-primary flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Sunting</Link> | 
                                   <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                                 </>
                               )}
                            </div>
                         </td>
                         <td className="px-4 py-4 align-top">
                            <a href={row.youtube_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1.5 transition-colors">
                               <Play className="w-4 h-4 text-red-600" /> Buka YouTube
                            </a>
                            <span className="block text-gray-400 text-[10px] mt-2 font-mono truncate w-32 border-t border-gray-100 pt-1.5 italic">{row.youtube_url}</span>
                         </td>
                         <td className="px-4 py-4 align-top text-center">
                            {row.is_featured ? (
                               <span className="inline-flex items-center gap-1.5 text-yellow-700 font-bold text-[10px] uppercase bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200 shadow-sm animate-pulse">
                                  <Star className="w-3 h-3 fill-current" /> Video Utama
                               </span>
                            ) : (
                                <button 
                                  onClick={() => hasWriteAccess && handleSetFeatured(row.id)}
                                  disabled={!hasWriteAccess}
                                  className={`text-[10px] uppercase font-bold text-gray-400 border border-gray-200 rounded-full px-4 py-1.5 transition-all focus:ring-2 focus:ring-gray-100 ${hasWriteAccess ? 'hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300' : 'opacity-50 cursor-not-allowed'}`}
                                >
                                   Jadikan Utama
                                </button>
                            )}
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-24 text-center text-gray-500 text-sm italic">
                        Belum ada video kegiatan yang ditambahkan.
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
           <div>Menampilkan {videos.length} dari {meta.total} item</div>
           <div className="flex gap-1">
              {Array.from({ length: meta.last_page }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => fetchVideos(i + 1)}
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
