import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Megaphone, Bell, FileText, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import type { Announcement } from '../../types';

export default function PengumumansEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'high',
    status: 'published' as 'published' | 'draft'
  });

  const { data: announcement, isLoading } = useQuery<Announcement>({
    queryKey: ['admin-announcement', id],
    queryFn: async () => {
      const response = await api.get(`/announcements/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        priority: announcement.priority || 'normal',
        status: announcement.status || 'published'
      });
    }
  }, [announcement]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.put(`/announcements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-announcement', id] });
      navigate('/admin/pengumumans');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal memperbarui pengumuman.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      navigate('/admin/pengumumans');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { setError('Judul pengumuman wajib diisi.'); return; }
    setError(null);
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Hapus pengumuman ini secara permanen?')) deleteMutation.mutate();
  };

  const isSaving = updateMutation.isPending || deleteMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat data pengumuman...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/pengumumans" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sunting Pengumuman</h1>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${formData.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {formData.status === 'published' ? 'Terbit' : 'Draf'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Perbarui rincian informasi publik</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">{error}</span>}
          <Link to="/admin/pengumumans" className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
            Batal
          </Link>
          <button onClick={handleSubmit} disabled={isSaving}
            className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10 flex items-center gap-2 disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Perbarui
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
                placeholder="Tuliskan rincian pengumuman di sini..."
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

          {/* Status & Delete Widget */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" /> Status Publikasi
              </h2>
            </div>
            <div className="p-6 space-y-4">
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
              <div className="pt-2 border-t border-slate-100">
                <button type="button" onClick={handleDelete} disabled={isSaving}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100">
                  <Trash2 className="w-4 h-4" /> Hapus Pengumuman
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
