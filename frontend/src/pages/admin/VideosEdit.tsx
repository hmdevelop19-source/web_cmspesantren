import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Layout, 
  Type, 
  AlertCircle,
  Loader2,
  PlaySquare,
  Link as LinkIcon,
  Star
} from 'lucide-react';
import api from '../../lib/api';

export default function VideosEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    is_featured: false
  });

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await api.get(`/videos/${id}`);
        const video = response.data.data || response.data;
        setFormData({
          title: video.title || '',
          description: video.description || '',
          youtube_url: video.youtube_url || '',
          is_featured: video.is_featured || false
        });
      } catch (err: any) {
        console.error('Error fetching video:', err);
        setError('Gagal memuat data video.');
      } finally {
        setIsFetching(false);
      }
    };
    if (id) {
      fetchVideo();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.youtube_url) {
      setError('Judul dan Tautan YouTube wajib diisi.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.put(`/videos/${id}`, formData);
      navigate('/admin/videos');
    } catch (err: any) {
      console.error('Error updating video:', err);
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : 'Data tidak valid.');
      } else {
        setError(err.response?.data?.message || 'Gagal memperbarui video.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-gray-500 font-medium">Memuat data video...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 sticky top-0 bg-gray-50/80 backdrop-blur-md py-4 z-40 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/videos')}
            className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-primary transition-all shadow-sm border border-transparent hover:border-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
              Sunting Video
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-1">Perbarui detail video kegiatan</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/videos"
            className="px-5 py-2.5 text-gray-500 hover:text-gray-700 font-bold text-xs uppercase tracking-widest transition-all"
          >
            Batalkan
          </Link>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 transition-all disabled:opacity-50 active:scale-95"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                <Type className="w-4 h-4 text-primary" /> Judul Video
              </label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Contoh: Dokumentasi Haflah Akhirussanah 2026"
                className="w-full text-2xl font-black text-gray-800 placeholder:text-gray-200 border-none px-0 focus:ring-0"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                <LinkIcon className="w-4 h-4 text-primary" /> Tautan YouTube
              </label>
              <input 
                type="text" 
                value={formData.youtube_url}
                onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                placeholder="Contoh: https://www.youtube.com/watch?v=..."
                className="w-full bg-gray-50 border border-gray-100 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                <Layout className="w-4 h-4 text-primary" /> Deskripsi Video (Opsional)
              </label>
              <textarea 
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tuliskan keterangan tentang video ini..."
                className="w-full border-none px-4 py-4 bg-gray-50 rounded-2xl text-gray-700 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <aside className="w-full lg:w-80 space-y-6">
          {/* Featured Status */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-50 pb-4">Pengaturan Utama</h3>
            
            <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                <button 
                  onClick={() => setFormData({...formData, is_featured: true})}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-[10px] font-black transition-all ${formData.is_featured ? 'bg-yellow-50 text-yellow-600 border border-yellow-100 shadow-sm' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
                >
                  <Star className={`w-4 h-4 ${formData.is_featured ? 'fill-current' : ''}`} /> UTAMA
                </button>
                <button 
                  onClick={() => setFormData({...formData, is_featured: false})}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-[10px] font-black transition-all ${!formData.is_featured ? 'bg-white text-gray-700 shadow-sm border border-gray-100' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
                >
                  <PlaySquare className="w-4 h-4" /> BIASA
                </button>
            </div>
            
            {formData.is_featured && (
                <p className="text-[10px] text-yellow-600/80 font-medium leading-relaxed bg-yellow-50 p-3 rounded-xl">
                  Video utama akan ditampilkan di halaman depan portal pesantren (jika tema mendukung). Video utama sebelumnya akan otomatis tergantikan.
                </p>
            )}
            {!formData.is_featured && (
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed bg-gray-50 p-3 rounded-xl">
                  Video biasa akan muncul di halaman daftar video.
                </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
