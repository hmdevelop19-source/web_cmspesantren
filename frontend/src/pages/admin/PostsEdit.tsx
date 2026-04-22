import { 
  ArrowLeft, ChevronDown, FileText, Loader2, Save, Plus, Image as ImageIcon,
  Cloud
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import MediaSelector from '../../components/admin/MediaSelector';
import RichTextEditor from '../../components/admin/RichTextEditor';

export default function PostsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('draft');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageId, setCoverImageId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, postRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/posts/${id}`)
        ]);
        
        setCategories(catRes.data);
        
        const post = postRes.data;
        setTitle(post.title);
        setContent(post.content);
        setCategoryId(post.category_id || '');
        setStatus(post.status);
        setCoverImage(post.cover_image || '');
        setCoverImageId(post.cover_image_id || null);
        
        // If there's an object from resource, use it to ensure URL is correct
        if (post.cover_image_obj) {
           setCoverImage(`http://localhost:8000${post.cover_image_obj.file_path}`);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data pos.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [id]);

  // Auto-save logic
  useEffect(() => {
    if (isFetching || status === 'published') return;

    const timer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await api.put(`/posts/${id}`, {
          title,
          content,
          category_id: categoryId || null,
          status: 'draft',
          cover_image_id: coverImageId
        });
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, categoryId, coverImageId, id, isFetching, status]);

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pos ini?')) {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/posts/${id}`);
        navigate('/admin/posts');
      } catch (err: any) {
        console.error('Failed to delete post:', err.response?.data || err);
        setError('Gagal menghapus pos. ' + (err.response?.data?.message || ''));
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, targetStatus?: string) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const postStatus = targetStatus || status;

    try {
      await api.put(`/posts/${id}`, {
        title,
        content,
        category_id: categoryId || null,
        status: postStatus,
        cover_image_id: coverImageId
      });
      navigate('/admin/posts');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal memperbarui pos.';
      setError(message);
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-gray-500 text-sm">Memuat data pos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl text-left">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <Link to="/admin/posts" className="p-2 border border-gray-300 rounded hover:bg-gray-200 bg-white">
              <ArrowLeft className="w-4 h-4 text-gray-700" />
           </Link>
           <h1 className="text-2xl font-normal text-gray-800">Sunting Pos</h1>
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
           {error && <span className="text-red-500 text-xs mr-2">{error}</span>}
           <button 
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={isLoading}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
           >
              {isLoading && status === 'draft' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan Draf'}
           </button>
           <button 
              type="submit"
              onClick={(e) => handleSubmit(e, 'published')}
              disabled={isLoading}
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
                <RichTextEditor 
                  content={content} 
                  onChange={(newContent) => setContent(newContent)} 
               />
            </div>
         </div>

         {/* Right Sidebar widgets */}
         <div className="lg:w-1/4 flex flex-col gap-6">
            
            {/* Publish Widget */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
               <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                  <h2 className="font-semibold text-gray-800 text-sm">Terbitkan</h2>
               </div>
               <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                     <FileText className="w-4 h-4 text-gray-400" />
                     <span>Status: <strong>{status === 'published' ? 'Sudah Terbit' : 'Draf'}</strong></span>
                  </div>
               </div>
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
                   <button 
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800 text-sm hover:underline disabled:opacity-50"
                   >
                     {isLoading ? 'Menghapus...' : 'Hapus Pos'}
                   </button>
                </div>
            </div>

            {/* Categories Widget */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
               <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex justify-between items-center cursor-pointer">
                  <h2 className="font-semibold text-gray-800 text-sm">Kategori</h2>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
               </div>
               <div className="p-4">
                  <select 
                     value={categoryId}
                     onChange={(e) => setCategoryId(e.target.value)}
                     className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                  >
                     <option value="">Pilih Kategori</option>
                     {categories.map((cat) => (
                       <option key={cat.id} value={cat.id}>{cat.name}</option>
                     ))}
                  </select>
                  <button type="button" className="text-primary hover:underline text-sm flex items-center gap-1">
                     <Plus className="w-3 h-3" /> Tambah Kategori Baru
                  </button>
               </div>
            </div>

             {/* Featured Image Widget */}
             <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
                <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex justify-between items-center cursor-pointer">
                   <h2 className="font-semibold text-gray-800 text-sm">Gambar Andalan (Cover)</h2>
                   <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
                <div className="p-4 text-sm text-center">
                   {coverImage ? (
                      <div className="relative group rounded-lg overflow-hidden border border-gray-200 mb-2">
                         <img src={coverImage} alt="Cover Preview" className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
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
                               onClick={() => setCoverImage('')}
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
                         <span className="font-bold">Atur gambar andalan</span>
                         <div className="space-y-1">
                            <span className="block text-[10px] text-gray-400 font-medium">Ukuran Rekomendasi: 1200 x 630 piksel</span>
                            <span className="block text-[10px] text-primary/50 italic">Maksimal file: 2 MB</span>
                         </div>
                      </button>
                   )}
                </div>
             </div>

             <MediaSelector 
                isOpen={isMediaSelectorOpen}
                onClose={() => setIsMediaSelectorOpen(false)}
                onSelect={(media) => {
                   setCoverImage(`http://localhost:8000${media.file_path}`);
                   setCoverImageId(media.id);
                   setIsMediaSelectorOpen(false);
                 }}
              />

          </div>
       </div>
     </div>
   );
 }
