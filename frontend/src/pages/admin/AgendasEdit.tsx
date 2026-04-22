import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Layout, 
  Type, 
  MapPin, 
  Calendar,
  AlertCircle,
  Loader2,
  Eye,
  Check
} from 'lucide-react';
import api from '../../lib/api';

export default function AgendasEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    event_date: '',
    status: 'published' as 'published' | 'draft'
  });

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const response = await api.get(`/agendas/${id}`);
        const data = response.data;
        setFormData({
          title: data.title || '',
          content: data.content || '',
          location: data.location || '',
          event_date: data.event_date || '',
          status: data.status || 'published'
        });
      } catch (err) {
        console.error('Error fetching agenda:', err);
        setError('Gagal memuat data agenda.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgenda();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date) {
      setError('Judul dan Tanggal Kegiatan wajib diisi.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await api.put(`/agendas/${id}`, formData);
      navigate('/admin/agendas');
    } catch (err: any) {
      console.error('Error updating agenda:', err);
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : 'Data tidak valid.');
      } else {
        setError(err.response?.data?.message || 'Gagal memperbarui agenda.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-500 font-bold animate-pulse">Memuat data agenda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 text-left">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 sticky top-0 bg-gray-50/80 backdrop-blur-md py-4 z-40 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/agendas')}
            className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-primary transition-all shadow-sm border border-transparent hover:border-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
              Sunting Agenda
              <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${formData.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                {formData.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-1">Lakukan perubahan pada rincian kegiatan</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/agendas"
            className="px-5 py-2.5 text-gray-500 hover:text-gray-700 font-bold text-xs uppercase tracking-widest transition-all"
          >
            Batal
          </Link>
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 transition-all disabled:opacity-50 active:scale-95"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Perbarui Agenda
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

          {/* Agenda Title & Content */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                <Type className="w-4 h-4 text-primary" /> Judul Kegiatan
              </label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Masukkan judul agenda..."
                className="w-full text-2xl font-black text-gray-800 placeholder:text-gray-200 border-none px-0 focus:ring-0"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                <Layout className="w-4 h-4 text-primary" /> Rincian / Deskripsi Agenda
              </label>
              <textarea 
                rows={12}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Perbarui rincian kegiatan di sini..."
                className="w-full border-none px-4 py-4 bg-gray-50 rounded-2xl text-gray-700 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <aside className="w-full lg:w-80 space-y-6">
          {/* Status & Options */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-50 pb-4">Pengaturan</h3>
            
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status Publikasi</label>
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
                  {formData.status === 'draft' && <Check className="w-3 h-3" />} SIMPAN DRAF
                </button>
              </div>
            </div>
          </div>

          {/* Time & Location */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-50 pb-4">Waktu & Tempat</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Tanggal Pelaksanaan
                </label>
                <input 
                  type="date" 
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Lokasi Kegiatan
                </label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Nama ruangan / Lokasi"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Preview Placeholder */}
          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 border-dashed text-center space-y-4">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Eye className="w-6 h-6 text-primary/40" />
             </div>
             <p className="text-[10px] text-primary/60 font-medium px-4">Terakhir diperbarui pada {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long' })}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
