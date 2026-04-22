import { Upload, X, Loader2, Check, Search, Grid, List as ListIcon } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import api from '../../lib/api';

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: any) => void;
}

const API_BASE_URL = 'http://localhost:8000';

export default function MediaSelector({ isOpen, onClose, onSelect }: MediaSelectorProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/media');
      setMedia(response.data.data);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
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

  if (!isOpen) return null;

  const filteredMedia = media.filter(item => 
    item.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
           <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">Pilih Media</h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] uppercase tracking-wider font-bold rounded-full border border-gray-200">
                 Gallery
              </span>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all">
              <X className="w-5 h-5" />
           </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:w-64">
                 <input 
                    type="text" 
                    placeholder="Cari media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                 />
                 <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                 <button className="p-2 bg-gray-100 text-primary border-r border-gray-200"><Grid className="w-4 h-4" /></button>
                 <button className="p-2 text-gray-400 hover:text-gray-600"><ListIcon className="w-4 h-4" /></button>
              </div>
           </div>

           <div className="flex items-center gap-3 w-full sm:w-auto">
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileUpload} 
                 className="hidden" 
                 accept="image/*"
              />
               <div className="flex flex-col items-end gap-1">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-grow sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm shadow-primary/20 transition-all disabled:opacity-50"
                 >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isUploading ? 'Mengunggah...' : 'Unggah Baru'}
                 </button>
                 <span className="text-[9px] text-gray-400 font-medium italic">Maksimal: 2MB</span>
               </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
           {/* Gallery Grid */}
           <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              {isLoading ? (
                 <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm font-medium">Memuat pustaka media...</p>
                 </div>
              ) : filteredMedia.length > 0 ? (
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {filteredMedia.map((item) => (
                       <div 
                          key={item.id} 
                          onClick={() => setSelectedItem(item)}
                          className={`aspect-square relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                             selectedItem?.id === item.id 
                                ? 'border-primary ring-2 ring-primary/20 shadow-md scale-[0.98]' 
                                : 'border-transparent hover:border-gray-200'
                          }`}
                       >
                          <img 
                             src={`${API_BASE_URL}${item.file_path}`} 
                             alt={item.file_name} 
                             className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {selectedItem?.id === item.id && (
                             <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-in fade-in duration-200">
                                <div className="bg-primary text-white p-1 rounded-full shadow-lg">
                                   <Check className="w-4 h-4 stroke-[3px]" />
                                </div>
                             </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                             <p className="text-[10px] text-white truncate w-full font-medium">{item.file_name}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                    <Search className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">Media tidak ditemukan.</p>
                 </div>
              )}
           </div>

           {/* Preview Sidebar */}
           <div className="hidden lg:flex w-72 border-l border-gray-100 p-6 flex-col bg-white">
              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detail Media</h3>
                 
                 {selectedItem ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                       <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center">
                          <img src={`${API_BASE_URL}${selectedItem.file_path}`} alt="Preview" className="max-w-full max-h-full object-contain" />
                       </div>
                       
                       <div className="space-y-4">
                          <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Nama File</p>
                             <p className="text-xs text-gray-700 font-bold break-all leading-relaxed">{selectedItem.file_name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Ukuran</p>
                                <p className="text-xs text-gray-700 font-bold">{(selectedItem.file_size / 1024).toFixed(1)} KB</p>
                             </div>
                             <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Format</p>
                                <p className="text-xs text-gray-700 font-bold uppercase">{selectedItem.file_type.split('/')[1]}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
                       <Grid className="w-8 h-8 opacity-20" />
                       <p className="text-[11px] font-medium text-center px-4">Pilih gambar untuk melihat detail rincian</p>
                    </div>
                 )}
              </div>

              <div className="pt-6 mt-auto border-t border-gray-100">
                  <button 
                     disabled={!selectedItem}
                     onClick={() => onSelect(selectedItem)}
                     className="w-full bg-primary hover:bg-primary-dark text-white p-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:shadow-none translate-y-0 active:translate-y-0.5"
                  >
                     Pilih Gambar
                  </button>
              </div>
           </div>
        </div>

        {/* Mobile Footer (Select Button) */}
        <div className="lg:hidden px-6 py-4 border-t border-gray-100 bg-white">
            <button 
               disabled={!selectedItem}
               onClick={() => onSelect(selectedItem)}
               className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
            >
               Pilih Gambar Terpilih
            </button>
        </div>
      </div>
    </div>
  );
}
