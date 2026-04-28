import { Upload, X, Loader2, Check, Search, Grid, List as ListIcon, Trash2, Info, Calendar, HardDrive, FileImage } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../../lib/api';
import Skeleton from '../ui/Skeleton';

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: any) => void;
}

const API_BASE_URL = import.meta.env.VITE_STORAGE_URL;

export default function MediaSelector({ isOpen, onClose, onSelect }: MediaSelectorProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/media');
      setMedia(response.data.data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedItem(null);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newMedia = response.data.data;
      setMedia([newMedia, ...media]);
      setSelectedItem(newMedia);
    } catch (error) {
      alert('Gagal mengunggah media. Pastikan file adalah gambar dan ukurannya tidak melebihi 2MB.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus gambar ini secara permanen dari server?')) return;
    
    try {
      await api.delete(`/media/${id}`);
      setMedia(media.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (error) {
      alert('Gagal menghapus media.');
    }
  };

  if (!isOpen) return null;

  const filteredMedia = media.filter(item => 
    item.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-0 transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="relative z-10 bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 ease-out">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white/50 backdrop-blur-xl sticky top-0 z-20">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                 <FileImage className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Pustaka Media</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] uppercase tracking-widest font-black rounded-md border border-primary/10">
                      CMS Assets
                   </span>
                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">• {media.length} Items</span>
                </div>
              </div>
           </div>
           <button 
              onClick={onClose} 
              className="group p-2.5 bg-gray-50 hover:bg-red-50 rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100 hover:border-red-100"
           >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
           </button>
        </div>

        {/* Action Bar */}
        <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:w-80">
                 <input 
                    type="text" 
                    placeholder="Cari nama file atau ekstensi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                 />
                 <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <div className="flex items-center p-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                 <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                 >
                    <Grid className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                 >
                    <ListIcon className="w-4 h-4" />
                 </button>
              </div>
           </div>

           <div className="flex items-center gap-4 w-full md:w-auto">
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileUpload} 
                 className="hidden" 
                 accept="image/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {isUploading ? 'Menyimpan...' : 'Unggah Media'}
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
           {/* Gallery Grid */}
           <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isLoading ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {[...Array(12)].map((_, i) => (
                       <Skeleton key={i} variant="rounded" className="aspect-square w-full" />
                    ))}
                 </div>
              ) : filteredMedia.length > 0 ? (
                 viewMode === 'grid' ? (
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-8">
                      {filteredMedia.map((item) => (
                         <div 
                            key={item.id} 
                            onClick={() => setSelectedItem(item)}
                            onDoubleClick={() => onSelect(item)}
                            className={`aspect-square relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                               selectedItem?.id === item.id 
                                  ? 'border-primary ring-4 ring-primary/10 shadow-2xl scale-[0.98]' 
                                  : 'border-transparent hover:border-primary/30 hover:shadow-xl'
                            }`}
                         >
                            <img 
                               src={`${API_BASE_URL}${item.file_path}`} 
                               alt={item.file_name} 
                               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            
                            {/* Selected Overlay */}
                            {selectedItem?.id === item.id && (
                               <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-[2px]">
                                  <div className="bg-primary text-white p-2 rounded-full shadow-2xl scale-110">
                                     <Check className="w-5 h-5 stroke-[4px]" />
                                  </div>
                               </div>
                            )}
                            
                            {/* Info Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                               <p className="text-[10px] text-white/90 font-black uppercase tracking-widest truncate">{item.file_name}</p>
                               <p className="text-[9px] text-primary font-bold mt-0.5">{(item.file_size / 1024).toFixed(0)} KB</p>
                            </div>
                         </div>
                      ))}
                   </div>
                 ) : (
                   <div className="space-y-2 pb-8">
                      {filteredMedia.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          onDoubleClick={() => onSelect(item)}
                          className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                            selectedItem?.id === item.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-transparent hover:border-gray-100'
                          }`}
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                             <img src={`${API_BASE_URL}${item.file_path}`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="font-bold text-gray-900 truncate text-sm">{item.file_name}</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                               {item.file_type.split('/')[1]} • {(item.file_size / 1024).toFixed(1)} KB
                             </p>
                          </div>
                          {selectedItem?.id === item.id && <Check className="w-5 h-5 text-primary stroke-[3px] mr-2" />}
                        </div>
                      ))}
                   </div>
                 )
              ) : (
                 <div className="h-full flex flex-col items-center justify-center py-20 text-gray-300">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                       <Search className="w-12 h-12 opacity-20" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-gray-400">Media tidak ditemukan</p>
                    <p className="text-xs text-gray-400 mt-2">Coba kata kunci lain atau unggah file baru</p>
                 </div>
              )}
           </div>

           {/* Preview Sidebar (Inspector) */}
           <div className="hidden lg:flex w-96 border-l border-gray-100 p-8 flex-col bg-white">
              <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Inspektur Media</h3>
                    {selectedItem && (
                       <button 
                          onClick={() => handleDelete(selectedItem.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus Media"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    )}
                 </div>
                 
                 {selectedItem ? (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 ease-out">
                       <div className="aspect-square bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center p-4">
                          <img 
                            src={`${API_BASE_URL}${selectedItem.file_path}`} 
                            alt="Preview" 
                            className="max-w-full max-h-full object-contain rounded-xl drop-shadow-2xl" 
                          />
                       </div>
                       
                       <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                                <Info className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Informasi File</span>
                             </div>
                             <p className="text-sm text-gray-900 font-black break-all leading-relaxed">{selectedItem.file_name}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                   <HardDrive className="w-3 h-3" />
                                   <span className="text-[9px] font-black uppercase tracking-widest">Ukuran</span>
                                </div>
                                <p className="text-xs text-gray-900 font-black uppercase">{(selectedItem.file_size / 1024).toFixed(1)} KB</p>
                             </div>
                             <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                   <Calendar className="w-3 h-3" />
                                   <span className="text-[9px] font-black uppercase tracking-widest">Dibuat</span>
                                </div>
                                <p className="text-xs text-gray-900 font-black uppercase">
                                   {new Date(selectedItem.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-300 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
                       <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-200">
                          <Grid className="w-8 h-8" />
                       </div>
                       <div className="text-center px-8">
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Pilih aset media untuk melihat rincian teknis</p>
                       </div>
                    </div>
                 )}
              </div>

              <div className="pt-8 mt-auto">
                  <button 
                     disabled={!selectedItem}
                     onClick={() => onSelect(selectedItem)}
                     className="w-full bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all disabled:opacity-30 disabled:shadow-none hover:-translate-y-1 active:translate-y-0.5"
                  >
                     Terapkan Gambar
                  </button>
              </div>
           </div>
        </div>

        {/* Mobile Action Bar */}
        <div className="lg:hidden px-8 py-6 border-t border-gray-100 bg-white">
            <button 
               disabled={!selectedItem}
               onClick={() => onSelect(selectedItem)}
               className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
            >
               Gunakan Gambar Terpilih
            </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
