import { List, Grid, Upload, Trash2, Loader2, X, Search, Image as ImageIcon, Tag, Filter } from 'lucide-react';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../lib/utils';
import type { PaginatedResponse, Media as MediaType } from '../../types';

const CATEGORIES = [
  { value: '', label: 'Semua Kategori' },
  { value: 'Kegiatan', label: 'Kegiatan Pesantren' },
  { value: 'Sarana', label: 'Sarana & Prasarana' },
  { value: 'Prestasi', label: 'Prestasi & Santri' },
  { value: 'Acara', label: 'Acara & Hari Besar' },
  { value: 'Lainnya', label: 'Lain-lain' },
];

export default function Media() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaType | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('media');

  const { data: mediaResponse, isLoading } = useQuery<PaginatedResponse<MediaType>>({
    queryKey: ['admin-media', triggerSearch, page, filterCategory],
    queryFn: async () => {
      const response = await api.get('/media', {
        params: {
          search: triggerSearch,
          page: page,
          category: filterCategory || undefined
        }
      });
      return response.data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
    onError: () => {
      alert('Gagal mengunggah media. Pastikan file adalah gambar dan ukurannya tidak melebihi 2MB.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      setSelectedMedia(null);
    },
    onError: () => {
      alert('Gagal menghapus media.');
    }
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ action, ids, category }: { action: string, ids: number[], category?: string }) => {
      if (action === 'delete') {
        return Promise.all(ids.map(id => api.delete(`/media/${id}`)));
      }
      if (action === 'set-category') {
        return api.post('/media/bulk-update', { ids, category });
      }
      return api.post('/media/bulk-update', {
        ids,
        show_in_gallery: action === 'publish'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      setSelectedIds([]);
      setSelectedMedia(null);
      setBulkCategory('');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    },
    onError: () => {
      alert('Tindakan massal gagal.');
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus media ini secara permanen?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkAction = (action: 'publish' | 'unpublish' | 'delete' | 'set-category', category?: string) => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Hapus ${selectedIds.length} media terpilih secara permanen?`)) return;
    if (action === 'set-category' && !category) { alert('Pilih kategori terlebih dahulu.'); return; }
    bulkMutation.mutate({ action, ids: selectedIds, category });
  };

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const media = mediaResponse?.data || [];
  const meta = mediaResponse;
  const isUploading = uploadMutation.isPending;
  const isBulkLoading = bulkMutation.isPending;

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pustaka Media</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola galeri gambar, aset visual, dan dokumentasi kegiatan pesantren</p>
        </div>

        {hasWriteAccess && (
          <div className="flex items-center gap-3">
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
               className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
             >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? 'Mengunggah...' : 'Unggah Media'}
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileUpload} 
               className="hidden" 
               accept="image/*"
             />
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Filter className="w-3 h-3" /> Filter:
          </div>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { setFilterCategory(cat.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                filterCategory === cat.value
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-primary/30 hover:text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="p-2 bg-white shadow-sm rounded-md text-primary"><Grid className="w-4 h-4" /></button>
              <button className="p-2 text-slate-500 hover:text-slate-700"><List className="w-4 h-4" /></button>
            </div>
            <button
              onClick={() => {
                if (selectedIds.length === media.length) setSelectedIds([]);
                else setSelectedIds(media.map(m => m.id));
              }}
              className="text-xs font-bold text-slate-500 hover:text-primary transition-colors"
            >
              {selectedIds.length === media.length ? 'Batalkan Semua' : 'Pilih Semua'}
            </button>
            {filterCategory && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" /> {filterCategory}
                <button onClick={() => setFilterCategory('')} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
          <form className="relative" onSubmit={(e) => { e.preventDefault(); setTriggerSearch(searchTerm); setPage(1); }}>
            <input
              type="text"
              placeholder="Cari nama file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 border border-slate-200 bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Grid Content */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-xl">
             <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
             <p className="text-slate-400 font-medium">Memuat pustaka media...</p>
          </div>
        ) : media.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {media.map((item) => (
                 <div 
                   key={item.id} 
                   onClick={() => setSelectedMedia(item)}
                   className={`group relative aspect-square bg-slate-50 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${selectedMedia?.id === item.id ? 'border-primary ring-4 ring-primary/10 shadow-lg scale-95' : 'border-slate-100 hover:border-primary/30 hover:shadow-md'}`}
                 >
                    <img 
                      src={getImageUrl(item.file_path)} 
                      alt={item.filename} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Selection Overlay */}
                    <div 
                       onClick={(e) => toggleSelect(item.id, e)}
                       className={`absolute top-3 left-3 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${selectedIds.includes(item.id) ? 'bg-primary border-primary text-white' : 'bg-white/50 border-white/80 opacity-0 group-hover:opacity-100'}`}
                    >
                       {selectedIds.includes(item.id) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>

                     {/* Badges */}
                     <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {item.show_in_gallery && (
                          <div className="bg-green-500 text-white p-1.5 rounded-lg shadow-sm">
                            <ImageIcon className="w-3 h-3" />
                          </div>
                        )}
                        {item.category && (
                          <div className="bg-slate-900/70 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider backdrop-blur-sm">
                            {item.category}
                          </div>
                        )}
                     </div>

                     <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate font-medium">{item.filename}</p>
                     </div>
                 </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-xl text-slate-400">
             <ImageIcon className="w-12 h-12 opacity-20 mb-4" />
             <p className="text-sm font-medium">Belum ada media diunggah.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && (meta.last_page ?? 0) > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-6">
           <p className="text-[11px] font-bold text-slate-400">
              Menampilkan <span className="text-slate-900">{media.length}</span> File dari Total <span className="text-slate-900">{meta.total}</span>
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

      {/* ── Media Detail Lightbox Modal (Using Portal to be above sidebar) ─────────────────────────── */}
      {selectedMedia && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9998] animate-in fade-in duration-200"
            onClick={() => setSelectedMedia(null)}
          />

          {/* Modal Container - Centered relative to content area (offset by sidebar width) */}
          <div className="fixed inset-0 lg:left-[280px] z-[9999] flex items-center justify-center p-4 lg:p-12 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col lg:flex-row overflow-hidden pointer-events-auto animate-in zoom-in-95 fade-in duration-300">

              {/* ── Left: Image Viewer ── */}
              <div className="lg:w-3/5 bg-slate-950 flex flex-col relative">
                {/* Close button */}
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Save indicator / Toast notification */}
                {isSaved && (
                  <div className="absolute top-6 right-6 z-[10000] flex items-center gap-2 bg-green-500 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-2xl shadow-green-500/40 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> Tersimpan
                  </div>
                )}

                {/* Image */}
                <div className="flex-1 flex items-center justify-center p-8 min-h-[280px]">
                  <img
                    src={getImageUrl(selectedMedia.file_path)}
                    alt={selectedMedia.filename}
                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl"
                  />
                </div>

                {/* Image footer info */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-white/60" />
                    </div>
                    <div>
                      <p className="text-white/90 text-xs font-bold truncate max-w-[200px]">{selectedMedia.filename}</p>
                      <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">
                        {selectedMedia.file_type.split('/')[1]} · {(selectedMedia.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {selectedMedia.category && (
                    <span className="flex items-center gap-1.5 bg-primary/30 text-primary-light text-[10px] font-bold px-3 py-1.5 rounded-full border border-primary/20">
                      <Tag className="w-3 h-3" /> {selectedMedia.category}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Right: Detail Panel ── */}
              <div className="lg:w-2/5 flex flex-col overflow-y-auto">
                {/* Panel Header */}
                <div className="px-7 py-5 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-base font-bold text-slate-800">Detail & Pengaturan</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Kelola metadata dan visibilitas gambar</p>
                </div>

                <div className="flex-1 p-7 space-y-6">

                  {/* Metadata */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Search className="w-3 h-3" /> Informasi File
                    </label>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                      {[
                        { label: 'Nama File', value: selectedMedia.filename },
                        { label: 'Ukuran', value: `${(selectedMedia.file_size / 1024).toFixed(1)} KB` },
                        { label: 'Format', value: selectedMedia.file_type.split('/')[1].toUpperCase() },
                        { label: 'Diunggah', value: new Date(selectedMedia.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-[11px] text-slate-400">{row.label}</span>
                          <span className="text-[11px] font-bold text-slate-700 ml-4 truncate max-w-[160px] text-right">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* URL Copy */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL Gambar</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={getImageUrl(selectedMedia.file_path)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-mono text-slate-500 focus:outline-none truncate"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getImageUrl(selectedMedia.file_path));
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 1500);
                        }}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-primary hover:text-white text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-200 hover:border-primary whitespace-nowrap"
                      >
                        Salin
                      </button>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-primary" /> Kategori Galeri
                    </label>
                    <select
                      value={selectedMedia.category || ''}
                      onChange={async (e) => {
                        const val = e.target.value;
                        try {
                          // Update local state first for instant feedback
                          setSelectedMedia(prev => prev ? { ...prev, category: val } : null);
                          
                          await api.put(`/media/${selectedMedia.id}`, { category: val });
                          queryClient.invalidateQueries({ queryKey: ['admin-media'] });
                          
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        } catch (err) { 
                          alert('Gagal mengubah kategori.'); 
                        }
                      }}
                      className="w-full border-2 border-slate-200 bg-white rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all cursor-pointer"
                    >
                      <option value="">Tanpa Kategori</option>
                      {CATEGORIES.filter(c => c.value !== '').map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400">Menentukan pengelompokan di halaman galeri publik</p>
                  </div>

                  {/* Gallery Toggle */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibilitas Publik</label>
                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMedia.show_in_gallery ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50/50'}`}>
                      <div>
                        <span className="text-sm font-bold text-slate-700 block">Tampilkan di Galeri</span>
                        <span className="text-[10px] text-slate-400">
                          {selectedMedia.show_in_gallery ? '✓ Terlihat di halaman galeri publik' : 'Tersembunyi dari publik'}
                        </span>
                      </div>
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selectedMedia.show_in_gallery || false}
                          onChange={async (e) => {
                            const val = e.target.checked;
                            try {
                              await api.put(`/media/${selectedMedia.id}`, { show_in_gallery: val });
                              setSelectedMedia({...selectedMedia, show_in_gallery: val});
                              queryClient.invalidateQueries({ queryKey: ['admin-media'] });
                              setIsSaved(true);
                              setTimeout(() => setIsSaved(false), 2000);
                            } catch { alert('Gagal mengubah status galeri.'); }
                          }}
                        />
                        <div className={`w-12 h-6 rounded-full transition-all duration-300 ${selectedMedia.show_in_gallery ? 'bg-green-500 shadow-inner' : 'bg-slate-300'}`} />
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 ${selectedMedia.show_in_gallery ? 'translate-x-6' : ''}`} />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-7 pt-0">
                  {hasWriteAccess && (
                    <button
                      onClick={() => handleDelete(selectedMedia.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all border border-red-100"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus Media Secara Permanen
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Bulk Action Bar (Using Portal to be above sidebar) */}
      {selectedIds.length > 0 && createPortal(
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:ml-[140px] bg-slate-900 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-6 z-[9999] border border-white/10 animate-in slide-in-from-bottom duration-300">
           <div className="flex flex-col">
              <span className="text-yellow-400 font-bold text-sm">{selectedIds.length} Media Terpilih</span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Tindakan Massal</span>
           </div>
           <div className="h-8 w-px bg-white/10"></div>
           <div className="flex items-center gap-3">
              <button onClick={() => handleBulkAction('publish')} disabled={isBulkLoading}
                className="px-5 py-2 bg-white/10 hover:bg-green-600 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50">
                Publikasikan
              </button>
              <button onClick={() => handleBulkAction('unpublish')} disabled={isBulkLoading}
                className="px-5 py-2 bg-white/10 hover:bg-amber-600 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50">
                Sembunyikan
              </button>
           </div>
           <div className="h-8 w-px bg-white/10"></div>
           {/* Bulk Category */}
           <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-white/40" />
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-[11px] font-bold outline-none cursor-pointer"
              >
                <option value="">Pilih Kategori...</option>
                {CATEGORIES.filter(c => c.value).map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <button
                onClick={() => handleBulkAction('set-category', bulkCategory)}
                disabled={isBulkLoading || !bulkCategory}
                className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 flex items-center gap-1.5">
                {isBulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />} Tetapkan
              </button>
           </div>
           <div className="h-8 w-px bg-white/10"></div>
           <button onClick={() => handleBulkAction('delete')} disabled={isBulkLoading}
             className="px-5 py-2 bg-red-500/20 hover:bg-red-600 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border border-red-500/30 disabled:opacity-50 flex items-center gap-2">
             <Trash2 className="w-3.5 h-3.5" /> Hapus
           </button>
           <button onClick={() => setSelectedIds([])} className="p-1 text-white/40 hover:text-white transition-colors">
              <X className="w-6 h-6" />
           </button>
        </div>,
        document.body
      )}
    </div>
  );
}
