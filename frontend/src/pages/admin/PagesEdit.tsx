import { 
  ArrowLeft, FileText, Loader2, Save, Eye, Settings, Trash2, Cloud,
  ChevronDown, Image as ImageIcon
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import RichTextEditor from '../../components/admin/RichTextEditor';
import MediaSelector from '../../components/admin/MediaSelector';

export default function PagesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');
  const [image, setImage] = useState('');
  const [imageId, setImageId] = useState<number | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await api.get(`/pages/${id}`);
        const page = response.data.data || response.data;
        setTitle(page.title || '');
        setContent(page.content || '');
        setStatus(page.status || 'draft');
        setImage(page.image || '');
        setImageId(page.image_id || null);

        if (page.image_obj) {
           setImage(`http://localhost:8000${page.image_obj.file_path}`);
        }
      } catch (err: any) {
        console.error('Error fetching page:', err);
        setError('Gagal memuat data laman.');
      } finally {
        setIsFetching(false);
      }
    };
    if (id) {
      fetchPageData();
    }
  }, [id]);

  // Auto-save logic
  useEffect(() => {
    if (isFetching || status === 'published') return;

    const timer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await api.put(`/pages/${id}`, {
          title,
          content,
          status: 'draft',
          image_id: imageId
        });
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, imageId, id, isFetching, status]);

  const handleSubmit = async (e: React.FormEvent, targetStatus?: 'published' | 'draft') => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Judul laman tidak boleh kosong.');
      return;
    }

    if (!content.trim()) {
      setError('Konten laman tidak boleh kosong.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const postStatus = targetStatus || status;

    try {
      await api.put(`/pages/${id}`, {
        title,
        content,
        status: postStatus,
        image_id: imageId
      });
      navigate('/admin/pages');
    } catch (err: any) {
      console.error('Error updating page:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui laman.');
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laman ini secara permanen?')) {
      setIsLoading(true);
      try {
        await api.delete(`/pages/${id}`);
        navigate('/admin/pages');
      } catch (err: any) {
        console.error('Failed to delete page:', err);
        setError('Gagal menghapus laman.');
        setIsLoading(false);
      }
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-gray-500 text-sm">Memuat rincian laman...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <Link to="/admin/pages" className="p-2 border border-gray-300 rounded hover:bg-gray-200 bg-white">
              <ArrowLeft className="w-4 h-4 text-gray-700" />
           </Link>
           <h1 className="text-2xl font-normal text-gray-800">Sunting Laman</h1>
           {isAutoSaving && (
             <div className="flex items-center gap-1.5 text-gray-400 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Menyimpan...</span>
             </div>
           )}
           {!isAutoSaving && lastSaved && (
             <div className="flex items-center gap-1.5 text-green-500/60">
                <Cloud className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Tersimpan {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </div>
           )}
        </div>
        
        <div className="flex items-center gap-3">
           {error && <span className="text-red-500 text-sm italic">{error}</span>}
           <button 
             type="button"
             disabled={isLoading}
             onClick={(e) => handleSubmit(e, 'draft')}
             className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
           >
              {isLoading && status === 'draft' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan Draf'}
           </button>
           <button 
             type="button"
             disabled={isLoading}
             onClick={(e) => handleSubmit(e, 'published')}
             className="bg-primary border border-primary text-white px-5 py-1.5 rounded text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
           >
              {isLoading && status === 'published' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Perbarui
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         {/* Main Editor Area */}
         <div className="lg:w-3/4 flex flex-col gap-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
               {/* Title Input */}
               <div className="p-4 border-b border-dashed border-gray-200 bg-gray-50">
                  <input 
                     type="text" 
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     placeholder="Tambahkan judul laman di sini..." 
                     className="w-full text-2xl px-2 py-2 font-bold text-gray-900 border-none focus:outline-none focus:ring-0 placeholder-gray-300 bg-transparent"
                  />
               </div>
               
               {/* Rich Text Editor */}
               <RichTextEditor 
                 content={content}
                 onChange={setContent}
               />
            </div>
         </div>

         {/* Right Sidebar widgets */}
         <div className="lg:w-1/4 flex flex-col gap-6">
            
            {/* Publish Widget */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
               <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <h2 className="font-semibold text-gray-800 text-sm">Pengaturan Publikasi</h2>
               </div>
               <div className="p-4 space-y-4">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700 block">Status Laman</label>
                     <select 
                       value={status}
                       onChange={(e) => setStatus(e.target.value as any)}
                       className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                     >
                       <option value="draft">Draf (Sembunyikan)</option>
                       <option value="published">Diterbitkan (Publik)</option>
                     </select>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-600">
                     <FileText className="w-4 h-4 text-gray-400" />
                     <span>Kondisi saat ini: <strong>Tersimpan</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                     <Eye className="w-4 h-4 text-gray-400" />
                     <span>Visibilitas: <strong>{status === 'published' ? 'Bisa dilihat semua' : 'Hanya Admin'}</strong></span>
                  </div>
               </div>
               <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
                  <button 
                     type="button"
                     onClick={handleDelete}
                     disabled={isLoading}
                     className="text-red-600 hover:text-red-800 text-sm hover:underline font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                     <Trash2 className="w-3.5 h-3.5" /> Hapus Laman
                  </button>
               </div>
            </div>

            {/* Featured Image Widget */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
               <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex justify-between items-center cursor-pointer">
                  <h2 className="font-semibold text-gray-800 text-sm">Gambar Laman</h2>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
               </div>
               <div className="p-4 text-sm text-center">
                  {image ? (
                     <div className="relative group rounded-lg overflow-hidden border border-gray-200 mb-2">
                        <img src={image} alt="Page Preview" className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <button 
                              type="button"
                              onClick={() => setIsMediaSelectorOpen(true)}
                              className="bg-white/90 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white"
                           >
                               Ganti
                           </button>
                           <button 
                              type="button"
                              onClick={() => { setImage(''); setImageId(null); }}
                              className="bg-red-500/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600"
                           >
                               Hapus
                           </button>
                        </div>
                     </div>
                  ) : (
                     <button 
                        type="button"
                        onClick={() => setIsMediaSelectorOpen(true)}
                        className="text-primary hover:underline w-full p-8 border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 rounded-xl transition-all flex flex-col items-center gap-2"
                     >
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                           <ImageIcon className="w-6 h-6" />
                        </div>
                        <span className="font-bold">Setel gambar laman</span>
                     </button>
                  )}
               </div>
            </div>

            <MediaSelector 
               isOpen={isMediaSelectorOpen}
               onClose={() => setIsMediaSelectorOpen(false)}
               onSelect={(media) => {
                  setImage(`http://localhost:8000${media.file_path}`);
                  setImageId(media.id);
                  setIsMediaSelectorOpen(false);
               }}
            />

         </div>
      </div>
    </div>
  );
}
