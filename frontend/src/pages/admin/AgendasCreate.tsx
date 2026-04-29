import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, MapPin, Loader2, Calendar, FileText
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

export default function AgendasCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    event_date: '',
    status: 'published' as 'published' | 'draft'
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post('/agendas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agendas'] });
      navigate('/admin/agendas');
    },
    onError: (err: any) => {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : 'Data tidak valid.');
      } else {
        setError(err.response?.data?.message || 'Gagal menyimpan agenda.');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date) {
      setError('Judul dan Tanggal Kegiatan wajib diisi.');
      return;
    }
    setError(null);
    createMutation.mutate(formData);
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/agendas" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Buat Agenda Baru</h1>
            <p className="text-sm text-slate-500 mt-1">Tambahkan rincian kegiatan ke dalam kalender pesantren</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">{error}</span>}
          <Link to="/admin/agendas" className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
            Batalkan
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Agenda
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Form Area */}
        <div className="lg:flex-1 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Judul kegiatan agenda..."
                className="w-full text-3xl font-bold text-slate-900 border-none focus:outline-none focus:ring-0 placeholder-slate-300 bg-transparent"
              />
            </div>
            <div className="p-6">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Rincian / Deskripsi Agenda</label>
              <textarea
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Tuliskan rincian kegiatan, susunan acara, atau catatan penting lainnya di sini..."
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-[320px] flex flex-col gap-6">
          {/* Status Widget */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" /> Pengaturan
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Status Publikasi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, status: 'published'})}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${formData.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                >
                  Terbitkan
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, status: 'draft'})}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${formData.status === 'draft' ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                >
                  Simpan Draf
                </button>
              </div>
            </div>
          </div>

          {/* Time & Location Widget */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Waktu &amp; Tempat
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tanggal Pelaksanaan <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Lokasi Kegiatan
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Nama ruangan / Lokasi"
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
