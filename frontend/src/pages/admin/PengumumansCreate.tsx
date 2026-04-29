import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Megaphone, Bell, FileText } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

export default function PengumumansCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'high',
    status: 'published' as 'published' | 'draft'
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post('/announcements', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      navigate('/admin/pengumumans');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan pengumuman.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { setError('Judul pengumuman wajib diisi.'); return; }
    setError(null);
    createMutation.mutate(formData);
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/pengumumans" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Buat Pengumuman Baru</h1>
            <p className="text-sm text-slate-500 mt-1">Publikasikan informasi penting ke seluruh platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">{error}</span>}
          <Link to="/admin/pengumumans" className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
            Batalkan
          </Link>
          <button onClick={handleSubmit} disabled={isLoading}
            className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10 flex items-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Terbitkan
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Form Area */}
        <div className="lg:flex-1 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30">
              <input type="text" value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Judul pengumuman..."
                className="w-full text-3xl font-bold text-slate-900 border-none focus:outline-none focus:ring-0 placeholder-slate-300 bg-transparent" />
            </div>
            <div className="p-6">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Isi Detail Pengumuman</label>
              <textarea rows={10} value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Tuliskan detail pengumuman secara lengkap di sini..."
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none leading-relaxed" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-[320px] flex flex-col gap-6">
          {/* Priority Widget */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Tingkat Prioritas</h2>
            </div>
            <div className="p-6 space-y-3">
              <button type="button" onClick={() => setFormData({...formData, priority: 'normal'})}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${formData.priority === 'normal' ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <div className={`p-2 rounded-lg ${formData.priority === 'normal' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">Normal</p>
                  <p className="text-[10px] opacity-60 mt-0.5">Informasi rutin harian</p>
                </div>
              </button>
              <button type="button" onClick={() => setFormData({...formData, priority: 'high'})}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${formData.priority === 'high' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <div className={`p-2 rounded-lg ${formData.priority === 'high' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">Penting / Urgent</p>
                  <p className="text-[10px] opacity-60 mt-0.5">Pemberitahuan mendesak</p>
                </div>
              </button>
            </div>
          </div>

          {/* Status Widget */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" /> Status Publikasi
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({...formData, status: 'published'})}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${formData.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>
                  Terbitkan
                </button>
                <button type="button" onClick={() => setFormData({...formData, status: 'draft'})}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${formData.status === 'draft' ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>
                  Simpan Draf
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
