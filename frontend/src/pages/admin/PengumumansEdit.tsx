import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Layout, 
  Type, 
  AlertCircle,
  Loader2,
  Check,
  Megaphone,
  Bell
} from 'lucide-react';
import api from '../../lib/api';

export default function PengumumansEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'high',
    status: 'published' as 'published' | 'draft'
  });

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await api.get(`/announcements/${id}`);
        const data = response.data;
        setFormData({
          title: data.title || '',
          content: data.content || '',
          priority: data.priority || 'normal',
          status: data.status || 'published'
        });
      } catch (err) {
        console.error('Error fetching announcement:', err);
        setError('Gagal memuat data pengumuman.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setError('Judul pengumuman wajib diisi.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await api.put(`/announcements/${id}`, formData);
      navigate('/admin/pengumumans');
    } catch (err: any) {
      console.error('Error updating announcement:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui pengumuman.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-500 font-bold animate-pulse">Memuat data pengumuman...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 sticky top-0 bg-gray-50/80 backdrop-blur-md py-4 z-40 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/pengumumans')}
            className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-primary transition-all shadow-sm border border-transparent hover:border-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
              Edit Pengumuman
              <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${formData.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                {formData.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-1">Perbarui rincian informasi publik</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/pengumumans"
            className="px-5 py-2.5 text-gray-500 hover:text-gray-700 font-bold text-xs uppercase tracking-widest transition-all"
          >
            Batalkan
          </Link>
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 transition-all disabled:opacity-50 active:scale-95"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Perbarui Pengumuman
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 text-left">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold text-left">{error}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">
                <Type className="w-4 h-4 text-primary" /> Judul Pengumuman
              </label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Masukkan judul pengumuman..."
                className="w-full text-2xl font-black text-gray-800 placeholder:text-gray-200 border-none px-0 focus:ring-0"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">
                <Layout className="w-4 h-4 text-primary" /> Isi Detail Pengumuman
              </label>
              <textarea 
                rows={12}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Tuliskan rincian pengumuman di sini..."
                className="w-full border-none px-4 py-4 bg-gray-50 rounded-2xl text-gray-700 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <aside className="w-full lg:w-80 space-y-6 text-left">
          {/* Priority Status */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-50 pb-4">Tingkat Prioritas</h3>
            
            <div className="grid grid-cols-1 gap-3">
                <button 
                    onClick={() => setFormData({...formData, priority: 'normal'})}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.priority === 'normal' ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-gray-50 text-gray-400 grayscale'}`}
                >
                    <div className={`p-2 rounded-lg ${formData.priority === 'normal' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Bell className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="text-[11px] font-black uppercase tracking-widest">Normal</p>
                        <p className="text-[9px] font-medium opacity-60">Informasi rutin harian</p>
                    </div>
                </button>

                <button 
                    onClick={() => setFormData({...formData, priority: 'high'})}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.priority === 'high' ? 'bg-red-50 border-red-200 text-red-600 shadow-lg shadow-red-600/5' : 'bg-white border-gray-50 text-gray-400 grayscale'}`}
                >
                    <div className={`p-2 rounded-lg ${formData.priority === 'high' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Megaphone className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="text-[11px] font-black uppercase tracking-widest">Penting</p>
                        <p className="text-[9px] font-medium opacity-60 text-red-400">Pemberitahuan mendesak</p>
                    </div>
                </button>
            </div>
          </div>

          {/* Publication Status */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 leading-none">Status Publikasi</label>
            <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                <button 
                  onClick={() => setFormData({...formData, status: 'published'})}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black transition-all ${formData.status === 'published' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
                >
                  {formData.status === 'published' && <Check className="w-3 h-3" />} TERBITKAN
                </button>
                <button 
                  onClick={() => setFormData({...formData, status: 'draft'})}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black transition-all ${formData.status === 'draft' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
                >
                  {formData.status === 'draft' && <Check className="w-3 h-3" />} DRAF
                </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
