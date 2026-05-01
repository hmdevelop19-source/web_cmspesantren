import { 
  ArrowLeft, Image as ImageIcon, ChevronDown,
  Loader2, Save, FileText, Search, Globe
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
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
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
      meta_title: metaTitle,
      meta_description: metaDescription,
      status: postStatus,
      image_id: imageId || null
    });
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-4">
           <Link to="/admin/pages" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm" title="Kembali">
              <ArrowLeft className="w-5 h-5" />
           </Link>
           <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Buat Laman Baru</h1>
              <p className="text-sm text-slate-500 mt-1">Buat halaman statis baru untuk profil, visi misi, atau informasi lainnya</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           {error && <span className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">{error}</span>}
           <button 
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={isLoading}
              className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center gap-2"
           >
              {isLoading && status === 'draft' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Draf'}
           </button>
           <button 
              type="submit"
              onClick={(e) => handleSubmit(e, 'published')}
              disabled={isLoading}
              className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10 flex items-center gap-2 disabled:opacity-50"
           >
              {isLoading && status === 'published' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Terbitkan Laman
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 text-left">
         {/* Main Editor Area */}
         <div className="lg:flex-1 flex flex-col gap-8">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                   <input 
                      type="text" 
                      placeholder="Masukkan judul laman..." 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full text-3xl font-bold text-slate-900 border-none focus:outline-none focus:ring-0 placeholder-slate-300 bg-transparent"
                   />
                </div>
                <div className="p-2">
                   <RichTextEditor 
                     ref={editorRef}
                     content={content} 
                     onChange={(newContent) => setContent(newContent)} 
                     onOpenMediaLibrary={() => {
                       setMediaMode('editor');
                       setIsMediaSelectorOpen(true);
                     }}
                  />
                </div>
            </div>

            {/* SEO Optimization Widget */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
               <div className="border-b border-slate-100 px-8 py-5 bg-slate-50/50 flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                     <Search className="w-4 h-4 text-primary" /> Optimasi SEO (Mesin Pencari)
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded">Opsional</span>
               </div>
               <div className="p-8 space-y-8">
                  <div className="space-y-3">
                     <div className="flex justify-between items-end">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Judul Meta (SEO Title)</label>
                        <span className={`text-[10px] font-bold ${metaTitle.length > 60 ? 'text-red-400' : 'text-slate-300'}`}>{metaTitle.length} / 60</span>
                     </div>
                     <input 
                        type="text" 
                        placeholder={title || "Judul yang muncul di Google..."}
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                     />
                  </div>

                  <div className="space-y-3">
                     <div className="flex justify-between items-end">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Deskripsi Meta (SEO Description)</label>
                        <span className={`text-[10px] font-bold ${metaDescription.length > 160 ? 'text-red-400' : 'text-slate-300'}`}>{metaDescription.length} / 160</span>
                     </div>
                     <textarea 
                        rows={3}
                        placeholder={content.substring(0, 150).replace(/<[^>]+>/g, '') || "Ringkasan yang muncul di bawah judul Google..."}
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none"
                     />
                  </div>

                  {/* Google Preview Simulation */}
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                     <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                           <Globe className="w-2.5 h-2.5 text-slate-400" />
                        </div>
                        <span className="text-xs text-slate-400 truncate">https://portalpesantren.ac.id › {Str.slug(title) || 'judul-laman'}</span>
                     </div>
                     <h3 className="text-lg font-medium text-blue-600 hover:underline cursor-pointer truncate">
                        {metaTitle || title || 'Judul Laman Muncul Di Sini'}
                     </h3>
                     <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {metaDescription || content.substring(0, 160).replace(/<[^>]+>/g, '') || 'Deskripsi laman Anda akan muncul di sini sebagai pratinjau hasil pencarian...'}
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Sidebar widgets */}
         <div className="lg:w-[350px] flex flex-col gap-8">
            
            {/* Status & Info Widget */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
               <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                     <FileText className="w-3.5 h-3.5 text-primary" /> Pengaturan Laman
                  </h2>
               </div>
               <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-slate-400 font-medium">Status</span>
                     <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                        Penyusunan
                     </span>
                  </div>
                  
                  <div className="space-y-3">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Visibilitas</label>
                     <div className="relative group">
                        <select 
                           value={status}
                           onChange={(e) => setStatus(e.target.value as any)}
                           className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
                        >
                           <option value="draft">Draf (Sembunyikan)</option>
                           <option value="published">Diterbitkan (Publik)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary transition-colors" />
                     </div>
                  </div>
               </div>
            </div>

             {/* Featured Image Widget */}
             <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                   <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-primary" /> Gambar Header
                   </h2>
                </div>
                <div className="p-6">
                   {image ? (
                      <div className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[16/10]">
                         <img src={image} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                            <button 
                               type="button"
                               onClick={() => {
                                  setMediaMode('cover');
                                  setIsMediaSelectorOpen(true);
                               }}
                               className="bg-white text-slate-800 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all"
                            >
                                 Ganti
                            </button>
                            <button 
                               type="button"
                               onClick={() => { setImage(''); setImageId(null); }}
                               className="bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 transition-all"
                            >
                                 Hapus
                            </button>
                         </div>
                      </div>
                   ) : (
                      <button 
                         type="button"
                         onClick={() => {
                            setMediaMode('cover');
                            setIsMediaSelectorOpen(true);
                         }}
                         className="w-full p-8 border-2 border-dashed border-slate-100 hover:border-primary/30 hover:bg-primary/5 rounded-2xl transition-all flex flex-col items-center gap-4 group"
                      >
                         <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <ImageIcon className="w-6 h-6" />
                         </div>
                         <div className="text-center">
                            <span className="block text-sm font-bold text-slate-400 group-hover:text-primary transition-colors">Pilih Gambar</span>
                            <span className="block text-[10px] text-slate-300 mt-1 uppercase tracking-widest text-center">Gambar header laman</span>
                         </div>
                      </button>
                   )}
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
       </div>
    </div>
  );
}

const Str = {
  slug: (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
};
