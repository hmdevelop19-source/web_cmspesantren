import { Search, PlayCircle, Loader2, Trash2, Edit3, Play, Star, Video, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Video as VideoType, PaginatedResponse } from '../../types';

export default function Videos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('videos');

  const { data, isLoading } = useQuery<PaginatedResponse<VideoType>>({
    queryKey: ['admin-videos', page, triggerSearch],
    queryFn: async () => {
      const response = await api.get('/videos', { params: { search: triggerSearch, page } });
      const resData = response.data;
      if (resData.meta) return { ...resData.meta, data: resData.data, links: resData.links };
      return resData;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/videos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-videos'] }),
    onError: (error: any) => alert('Gagal menghapus video. ' + (error.response?.data?.message || ''))
  });

  const featuredMutation = useMutation({
    mutationFn: (video: VideoType) => api.put(`/videos/${video.id}`, {
      title: video.title, youtube_url: video.youtube_url, is_featured: true
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-videos'] }),
    onError: (error: any) => alert('Gagal mengatur video utama. ' + (error.response?.data?.message || ''))
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus video ini?')) deleteMutation.mutate(id);
  };

  const videos = data?.data || [];
  const total = data?.total || 0;
  const meta = data;

  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Video Dokumentasi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola koleksi video kegiatan pesantren — 
            <span className="font-bold text-slate-700"> {total} video</span> tersedia
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); setTriggerSearch(searchTerm); setPage(1); }}>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari judul video..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-56 border border-slate-200 bg-white rounded-xl px-4 py-2.5 pl-10 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <button type="submit"
              className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
            </button>
          </form>
          {hasWriteAccess && (
            <Link to="/admin/videos/create"
              className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah Video
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat pustaka video...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
            <Video className="w-8 h-8" />
          </div>
          <p className="text-slate-400 font-bold text-sm">Belum ada video kegiatan</p>
          <p className="text-slate-300 text-xs mt-1">Tambahkan video pertama Anda</p>
          {hasWriteAccess && (
            <Link to="/admin/videos/create"
              className="mt-6 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah Video Baru
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((row) => {
            const ytId = getYouTubeID(row.youtube_url || '');
            const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
            return (
              <div key={row.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col ${row.is_featured ? 'border-yellow-200 ring-1 ring-yellow-100' : 'border-slate-200'}`}>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt={row.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <a href={row.youtube_url} target="_blank" rel="noreferrer"
                      className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-red-600 fill-current ml-0.5" />
                    </a>
                  </div>
                  {/* Featured badge */}
                  {row.is_featured && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-current" /> Utama
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
                    {row.title}
                  </h3>
                  {row.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">{row.description}</p>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {hasWriteAccess && (
                        <>
                          <Link to={`/admin/videos/edit/${row.id}`}
                            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-wider">
                            <Edit3 className="w-3.5 h-3.5" /> Sunting
                          </Link>
                          <span className="text-slate-200">|</span>
                          <button onClick={() => handleDelete(row.id)}
                            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider">
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </>
                      )}
                    </div>
                    {!row.is_featured && hasWriteAccess && (
                      <button
                        onClick={() => featuredMutation.mutate(row)}
                        disabled={featuredMutation.isPending}
                        className="text-[9px] font-bold text-slate-400 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-yellow-300 hover:text-yellow-600 hover:bg-yellow-50 transition-all flex items-center gap-1 disabled:opacity-50">
                        <Star className="w-3 h-3" />
                        {featuredMutation.isPending && featuredMutation.variables?.id === row.id ? '...' : 'Jadikan Utama'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && (meta.last_page ?? 0) > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-100 gap-4">
          <p className="text-[11px] font-bold text-slate-400">
            Menampilkan <span className="text-slate-700">{videos.length}</span> dari <span className="text-slate-700">{meta.total}</span> video
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: meta.last_page ?? 0 }).map((_, i) => (
              <button key={i} onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all border flex items-center justify-center ${meta.current_page === i + 1 ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white text-slate-400 border-slate-200 hover:border-primary hover:text-primary'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
