import { List, Grid, Upload, Trash2, Loader2, X, Search, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../lib/utils';

export default function Media() {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [meta, setMeta] = useState<any>(null);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('media');

  const fetchMedia = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get('/media', {
        params: {
          search: searchTerm,
          page: page
        }
      });
      setMedia(response.data.data);
      setMeta(response.data);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      await api.post('/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchMedia();
    } catch (error) {
      alert('Gagal mengunggah media. Pastikan file adalah gambar dan ukurannya tidak melebihi 2MB.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus media ini secara permanen?')) {
      try {
        await api.delete(`/media/${id}`);
        setMedia(media.filter(m => m.id !== id));
        setSelectedMedia(null);
      } catch (error) {
        alert('Gagal menghapus media.');
      }
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return;
    
    if (action === 'delete') {
      if (!window.confirm(`Hapus ${selectedIds.length} media terpilih secara permanen?`)) return;
      setIsBulkLoading(true);
      try {
        // Simple loop for delete for now as there's no bulk delete endpoint
        await Promise.all(selectedIds.map(id => api.delete(`/media/${id}`)));
        setMedia(media.filter(m => !selectedIds.includes(m.id)));
        setSelectedIds([]);
        setSelectedMedia(null);
      } catch (error) {
        alert('Beberapa media gagal dihapus.');
      } finally {
        setIsBulkLoading(false);
      }
      return;
    }

    setIsBulkLoading(true);
    try {
      await api.post('/media/bulk-update', {
        ids: selectedIds,
        show_in_gallery: action === 'publish'
      });
      // Update local state
      setMedia(media.map(m => selectedIds.includes(m.id) ? { ...m, show_in_gallery: action === 'publish' } : m));
      setSelectedIds([]);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      alert('Gagal memperbarui media secara masal.');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Pustaka Media</h1>
           {hasWriteAccess && (
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
               className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded text-sm transition-all focus:outline-none flex items-center gap-2 font-medium disabled:opacity-50"
             >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? 'Mengunggah...' : 'Tambahkan Baru'}
             </button>
           )}
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileUpload} 
             className="hidden" 
             accept="image/*"
           />
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4 text-sm gap-4">
         <div className="flex gap-2 items-center">
            <button className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"><List className="w-4 h-4" /></button>
            <button className="p-1.5 bg-white border border-gray-300 text-primary rounded ring-1 ring-primary/20"><Grid className="w-4 h-4" /></button>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none">
               <option>Semua jenis media</option>
               <option>Gambar</option>
            </select>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none">
               <option>Semua tanggal</option>
            </select>
             <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 font-medium transition-colors" onClick={() => {
                if (selectedIds.length === media.length) setSelectedIds([]);
                else setSelectedIds(media.map(m => m.id));
             }}>
               {selectedIds.length === media.length ? 'Batalkan Semua' : 'Pilih Semua'}
             </button>
         </div>

         <form className="flex-1 max-w-xs relative" onSubmit={(e) => { e.preventDefault(); fetchMedia(1); }}>
              <input 
                type="text" 
                placeholder="Cari media..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 pl-8 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-9" 
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
          </form>
      </div>

      <div className="relative group min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-500">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
             <span className="text-sm font-medium">Memuat pustaka media...</span>
          </div>
        ) : media.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {media.map((item) => (
                 <div 
                   key={item.id} 
                   onClick={() => setSelectedMedia(item)}
                   className={`aspect-square bg-gray-100 border relative group cursor-pointer overflow-hidden transition-all duration-200 ${selectedMedia?.id === item.id ? 'ring-4 ring-primary border-transparent shadow-lg scale-95' : 'border-gray-200 hover:shadow-md'} ${selectedIds.includes(item.id) ? 'ring-2 ring-blue-500' : ''}`}
                 >
                    <img 
                      src={getImageUrl(item.file_path)} 
                      alt={item.file_name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    
                    {/* Checkbox overlay */}
                    <div 
                      className={`absolute top-2 left-2 w-5 h-5 rounded border transition-all flex items-center justify-center ${selectedIds.includes(item.id) ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/50 border-white/80 opacity-0 group-hover:opacity-100'}`}
                      onClick={(e) => toggleSelect(item.id, e)}
                    >
                       {selectedIds.includes(item.id) && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                    </div>

                    {/* Gallery status indicator */}
                    {item.show_in_gallery && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-sm">
                         <ImageIcon className="w-2.5 h-2.5" />
                      </div>
                    )}
                 </div>
              ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
             <Grid className="w-16 h-16 opacity-10" />
             <p className="text-sm font-medium">Belum ada media diunggah.</p>
          </div>
        )}
      </div>

      {/* Media Details Overlay / Modal Light */}
      {selectedMedia && (
        <>
          <div className="fixed inset-0 bg-black/5 z-40 animate-fade-in" onClick={() => setSelectedMedia(null)}></div>
          <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-2xl z-50 p-6 flex flex-col animate-slide-left">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900">Rincian Media</h2>
                {isSaved && <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded animate-bounce">DIUPDATE</span>}
              </div>
              <button onClick={() => setSelectedMedia(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                 <X className="w-5 h-5" />
              </button>
           </div>
           
           <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-6 flex items-center justify-center">
              <img src={getImageUrl(selectedMedia.file_path)} alt="Preview" className="max-w-full max-h-full object-contain" />
           </div>

           <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama File</label>
                 <p className="text-sm text-gray-700 break-all font-medium">{selectedMedia.file_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ukuran</label>
                    <p className="text-sm text-gray-700 font-medium">{(selectedMedia.file_size / 1024).toFixed(1)} KB</p>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Format</label>
                    <p className="text-sm text-gray-700 font-medium">{selectedMedia.file_type.split('/')[1].toUpperCase()}</p>
                 </div>
              </div>
              <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL File</label>
                 <input 
                   readOnly 
                   value={getImageUrl(selectedMedia.file_path)} 
                   className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-[11px] font-mono text-gray-600 focus:outline-none"
                   onClick={(e) => (e.target as HTMLInputElement).select()}
                 />
              </div>

               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori Galeri</label>
                  <select 
                    value={selectedMedia.category || ''} 
                    onChange={async (e) => {
                       const val = e.target.value;
                       try {
                          await api.put(`/media/${selectedMedia.id}`, { category: val });
                          setSelectedMedia({...selectedMedia, category: val});
                          setMedia(media.map(m => m.id === selectedMedia.id ? {...m, category: val} : m));
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                       } catch (err) {
                          alert('Gagal mengubah kategori.');
                       }
                    }}
                    className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none font-medium"
                  >
                     <option value="">Tanpa Kategori</option>
                     <option value="Kegiatan">Kegiatan</option>
                     <option value="Sarana">Sarana & Prasarana</option>
                     <option value="Prestasi">Prestasi</option>
                     <option value="Acara">Acara Pesantren</option>
                     <option value="Lainnya">Lainnya</option>
                  </select>
               </div>

               <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={selectedMedia.show_in_gallery || false}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          try {
                            await api.put(`/media/${selectedMedia.id}`, { show_in_gallery: val });
                            setSelectedMedia({...selectedMedia, show_in_gallery: val});
                            const updatedMedia = media.map(m => m.id === selectedMedia.id ? {...m, show_in_gallery: val} : m);
                            setMedia(updatedMedia);
                            setIsSaved(true);
                            setTimeout(() => setIsSaved(false), 2000);
                          } catch (err) {
                            alert('Gagal mengubah status galeri.');
                          }
                        }}
                      />
                      <div className={`block w-8 h-4.5 rounded-full transition-colors ${selectedMedia.show_in_gallery ? 'bg-primary shadow-inner shadow-primary-dark/20' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full shadow-sm transition-transform ${selectedMedia.show_in_gallery ? 'transform translate-x-3.5' : ''}`}></div>
                    </div>
                    <div className="text-[11px] font-black text-gray-800 uppercase tracking-wider">Tampilkan di Galeri</div>
                  </label>
                  <p className="text-[9px] font-medium text-gray-400 mt-2 leading-relaxed italic">
                    Aktifkan agar media ini muncul di halaman galeri publik portal.
                  </p>
               </div>
           </div>

           <div className="pt-6 border-t border-gray-100">
              {hasWriteAccess && (
                <button 
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="w-full flex items-center justify-center gap-2 hover:bg-red-50 text-red-600 border border-transparent hover:border-red-100 py-2.5 rounded-lg text-sm font-bold transition-all"
                >
                   <Trash2 className="w-4 h-4" />
                   Hapus Permanen
                </button>
              )}
           </div>
        </div>
        </>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-between items-center mt-6 text-xs font-medium text-gray-600 border-t border-gray-100 pt-6">
           <div>Menampilkan {media.length} dari {meta.total} item</div>
           <div className="flex gap-1">
              {Array.from({ length: meta.last_page }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => fetchMedia(i + 1)}
                  className={`px-3 py-1 border border-gray-300 rounded ${meta.current_page === i + 1 ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
           </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#0B1120] text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-8 z-[60] border border-white/10 animate-slide-up scale-105 backdrop-blur-md">
           <div className="flex flex-col">
              <span className="text-secondary font-black text-xs uppercase tracking-widest">{selectedIds.length} Terpilih</span>
              <span className="text-[10px] text-white/40 font-bold uppercase">Tindakan Massal</span>
           </div>
           
           <div className="h-8 w-px bg-white/10"></div>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={() => handleBulkAction('publish')}
                disabled={isBulkLoading}
                className="bg-white/10 hover:bg-green-500 text-xs font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all border border-white/5 disabled:opacity-50"
              >
                Tampilkan di Galeri
              </button>
              <button 
                onClick={() => handleBulkAction('unpublish')}
                disabled={isBulkLoading}
                className="bg-white/10 hover:bg-orange-500 text-xs font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all border border-white/5 disabled:opacity-50"
              >
                Sembunyikan
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                disabled={isBulkLoading}
                className="bg-red-500/20 hover:bg-red-500 text-xs font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all border border-red-500/30 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
           </div>
           
           <button onClick={() => setSelectedIds([])} className="hover:text-secondary transition-colors ml-2">
              <X className="w-5 h-5" />
           </button>
        </div>
      )}
    </div>
  );
}
