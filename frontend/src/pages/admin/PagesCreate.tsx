import { 
  Plus, ArrowLeft, Image as ImageIcon, ChevronDown,
  Loader2, Save, Settings, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import MediaSelector from '../../components/admin/MediaSelector';
import RichTextEditor from '../../components/admin/RichTextEditor';

export default function PagesCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [mediaMode, setMediaMode] = useState<'cover' | 'editor'>('cover');
  const editorRef = useRef<any>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');
  const [image, setImage] = useState('');
  const [imageId, setImageId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/pages', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      navigate('/admin/pages');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan laman.');
    }
  });

  const handleSubmit = (e: React.FormEvent, targetStatus?: 'published' | 'draft') => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Judul laman tidak boleh kosong.');
      return;
    }
    
    setError(null);
    const postStatus = targetStatus || status;

    createMutation.mutate({
      title,
      content,
      status: postStatus,
      image_id: imageId || null
    });
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="max-w-7xl text-left">
      {/* Top Header & Quick Actions */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-md py-4 z-20">
        <div className="flex items-center gap-4 text-left">
           <Link to="/admin/pages" className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
           </Link>
           <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tight">Buat Laman Baru</h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Penyunting Laman Statis</p>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             type="button"
             disabled={isLoading}
             onClick={(e) => handleSubmit(e, 'draft')}
             className="bg-white border border-gray-200 text-gray-500 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
           >
              {isLoading && status === 'draft' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan Draf'}
           </button>
           <button 
             type="button"
             disabled={isLoading}
             onClick={(e) => handleSubmit(e, 'published')}
             className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 shadow-lg shadow-primary/20"
           >
              {isLoading && status === 'published' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Terbitkan
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* Main Editor Area */}
         <div className="flex-1 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                <Settings className="w-5 h-5 animate-spin" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden">
               {/* Title Input */}
               <div className="p-8 border-b border-gray-50 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4 text-left">Judul Utama Halaman</label>
                  <input 
                     type="text" 
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     placeholder="Contoh: Denah Pesantren Al-Hikmah..." 
                     className="w-full text-4xl font-black text-gray-800 border-none focus:outline-none focus:ring-0 placeholder:text-gray-100 bg-transparent"
                  />
               </div>
               
               {/* Rich Text Editor */}
               <div className="p-2 bg-slate-50/30">
                  <RichTextEditor 
                    ref={editorRef}
                    content={content}
                    onChange={setContent}
                    onOpenMediaLibrary={() => {
                      setMediaMode('editor');
                      setIsMediaSelectorOpen(true);
                    }}
                  />
               </div>
            </div>
         </div>

         {/* Right Sidebar widgets */}
         <div className="w-full lg:w-80 space-y-6">
            
            {/* Status Widget */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-6">
               <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-50 pb-4 text-left">Pengaturan</h3>
               
               <div className="space-y-4">
                  <div className="space-y-2 text-left">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-left">Status Publikasi</label>
                     <div className="relative group">
                        <select 
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="w-full bg-gray-50 border-none rounded-2xl pl-4 pr-10 py-3 text-xs font-bold text-gray-700 appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="draft">📁 DRAF (SEMBUNYI)</option>
                          <option value="published">🌐 TERBITKAN</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary transition-colors" />
                     </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-50 flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                     <div className={`w-2 h-2 rounded-full ${status === 'published' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                     <span>{status === 'published' ? 'Siap Dilihat Publik' : 'Hanya Untuk Admin'}</span>
                  </div>
               </div>
            </div>

            {/* Featured Image Widget */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-6">
               <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Gambar Utama</h3>
                  <button 
                    onClick={() => {
                      setMediaMode('cover');
                      setIsMediaSelectorOpen(true);
                    }}
                    className="p-2 hover:bg-primary/5 rounded-xl text-primary transition-all active:scale-95"
                  >
                     <Plus className="w-4 h-4" />
                  </button>
               </div>
               
               <div className="space-y-4">
                {image ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden group border border-gray-100">
                    <img src={image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button 
                        onClick={() => {
                          setMediaMode('cover');
                          setIsMediaSelectorOpen(true);
                        }}
                        className="bg-white/20 backdrop-blur-md text-white p-2 rounded-xl border border-white/20 hover:bg-white/40 transition-all"
                       >
                          <ImageIcon className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => { setImage(''); setImageId(null); }}
                        className="bg-red-500/20 backdrop-blur-md text-red-200 p-2 rounded-xl border border-red-500/20 hover:bg-red-500/40 transition-all"
                       >
                          <X className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setMediaMode('cover');
                      setIsMediaSelectorOpen(true);
                    }}
                    className="w-full aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                     <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-5 h-5" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest">Pilih Gambar</span>
                  </button>
                )}
                <p className="text-[9px] text-gray-400 font-medium italic leading-relaxed text-center px-4 italic">
                  * Gambar ini akan muncul di bagian atas halaman statis sebagai header visual.
                </p>
               </div>
            </div>

         </div>
      </div>

      <MediaSelector 
         isOpen={isMediaSelectorOpen}
         onClose={() => setIsMediaSelectorOpen(false)}
         onSelect={(media) => {
            const imageUrl = `${import.meta.env.VITE_STORAGE_URL}${media.file_path}`;
            if (mediaMode === 'cover') {
              setImage(imageUrl);
              setImageId(media.id);
            } else {
              editorRef.current?.insertImage(imageUrl);
            }
            setIsMediaSelectorOpen(false);
         }}
      />
    </div>
  );
}
