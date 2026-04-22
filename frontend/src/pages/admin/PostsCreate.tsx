import { 
  Plus, ArrowLeft, Image as ImageIcon, ChevronDown, FileText,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import MediaSelector from '../../components/admin/MediaSelector';
import RichTextEditor from '../../components/admin/RichTextEditor';

export default function PostsCreate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status] = useState('draft');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageId, setCoverImageId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent, targetStatus?: string) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const postStatus = targetStatus || status;

    try {
      await api.post('/posts', {
        title,
        content,
        category_id: categoryId || null,
        status: postStatus,
        cover_image_id: coverImageId || null
      });
      navigate('/admin/posts');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal menyimpan pos.';
      setError(message);
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-7xl text-left">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <Link to="/admin/posts" className="p-2 border border-gray-300 rounded hover:bg-gray-200 bg-white">
              <ArrowLeft className="w-4 h-4 text-gray-700" />
           </Link>
           <h1 className="text-2xl font-normal text-gray-800">Tambah Pos Baru</h1>
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
              {isLoading && status === 'published' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Terbitkan
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         {/* Main Editor Area */}
         <div className="lg:w-3/4 flex flex-col gap-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
                <div className="p-4 border-b border-dashed border-gray-200">
                   <input 
                      type="text" 
                      placeholder="Tambahkan judul pos di sini..." 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full text-2xl px-2 py-2 font-bold text-gray-900 border-none focus:outline-none focus:ring-0 placeholder-gray-300"
                   />
                </div>
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
                     <span>Status: <strong>Penyusunan Draf</strong></span>
                  </div>
               </div>
               <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
                  <button className="text-red-600 hover:text-red-800 text-sm hover:underline">Pindahkan ke Tong Sampah</button>
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
                         <span className="font-bold">Tetapkan gambar andalan</span>
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
