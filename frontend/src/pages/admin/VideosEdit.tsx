import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, PlaySquare, Link as LinkIcon, Star, FileText, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import type { Video } from '../../types';

export default function VideosEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    is_featured: false
  });

  const { data: video, isLoading: isFetching } = useQuery<Video>({
    queryKey: ['admin-video', id],
    queryFn: async () => {
      const response = await api.get(`/videos/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        youtube_url: video.youtube_url || '',
        is_featured: video.is_featured || false
      });
    }
  }, [video]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.put(`/videos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['admin-video', id] });
      navigate('/admin/videos');
    },
    onError: (err: any) => {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : 'Data tidak valid.');
      } else {
        setError(err.response?.data?.message || 'Gagal memperbarui video.');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/videos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      navigate('/admin/videos');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.youtube_url) {
      setError('Judul dan Tautan YouTube wajib diisi.');
      return;
    }
    setError(null);
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Hapus video ini secara permanen?')) deleteMutation.mutate();
  };

  const isLoading = updateMutation.isPending || deleteMutation.isPending;

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat data video...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/videos" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sunting Video</h1>
            <p className="text-sm text-slate-500 mt-1">Perbarui detail video kegiatan</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">{error}</span>}
          <Link to="/admin/videos" className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
            Batal
          </Link>
          <button onClick={handleSubmit} disabled={isLoading}
            className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10 flex items-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Form */}
        <div className="lg:flex-1 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30">
              <input type="text" value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Judul video..."
                className="w-full text-3xl font-bold text-slate-900 border-none focus:outline-none focus:ring-0 placeholder-slate-300 bg-transparent" />
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <LinkIcon className="w-3 h-3" /> Tautan YouTube <span className="text-red-400">*</span>
                </label>
                <input type="text" value={formData.youtube_url}
                  onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Deskripsi (Opsional)</label>
                <textarea rows={6} value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tuliskan keterangan tentang video ini..."
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none leading-relaxed" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-[320px] flex flex-col gap-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" /> Pengaturan Video
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tampilkan Sebagai</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({...formData, is_featured: true})}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${formData.is_featured ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>
                  <Star className={`w-4 h-4 ${formData.is_featured ? 'fill-current' : ''}`} />
                  Video Utama
                </button>
                <button type="button" onClick={() => setFormData({...formData, is_featured: false})}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${!formData.is_featured ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>
                  <PlaySquare className="w-4 h-4" />
                  Video Biasa
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {formData.is_featured
                  ? 'Video utama akan ditampilkan di halaman depan portal pesantren.'
                  : 'Video biasa akan muncul di halaman daftar video.'}
              </p>
              <div className="pt-2 border-t border-slate-100">
                <button type="button" onClick={handleDelete} disabled={isLoading}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100">
                  <Trash2 className="w-4 h-4" /> Hapus Video Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
