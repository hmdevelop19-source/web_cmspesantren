import { FileText, Edit3, CalendarDays, Megaphone, ArrowRight, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Skeleton from '../../components/ui/Skeleton';
import type { Category } from '../../types';

interface DashboardStats {
  posts: number;
  pages: number;
  categories: number;
  users: number;
  agendas: number;
  announcements: number;
  contact_messages: number;
  unread_messages: number;
}

interface DashboardData {
  stats: DashboardStats;
  recent_posts: any[];
  trends: any[];
  recent_messages: any[];
  system: any;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [defaultCatId, setDefaultCatId] = useState<number | null>(null);

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data;
    }
  });

  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ['admin-categories-simple'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    }
  });

  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      const uncategorized = categoriesData.find(c => c.name.toLowerCase().includes('uncategorized') || c.name.toLowerCase().includes('umum'));
      setDefaultCatId(uncategorized ? uncategorized.id : categoriesData[0].id);
    }
  }, [categoriesData]);

  const draftMutation = useMutation({
    mutationFn: (data: any) => api.post('/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setDraftTitle('');
      setDraftContent('');
      alert('Draf berhasil disimpan!');
    },
    onError: (error: any) => {
      console.error('Error saving draft:', error);
      alert('Gagal menyimpan draf. Pastikan sistem siap.');
    }
  });

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) {
      alert('Judul draf tidak boleh kosong.');
      return;
    }

    draftMutation.mutate({
      title: draftTitle,
      content: draftContent || 'Draf konten...',
      status: 'draft',
      category_id: defaultCatId || 1,
    });
  };

  const stats = dashboardData?.stats;
  const recentPosts = dashboardData?.recent_posts || [];
  const trends = dashboardData?.trends || [];
  const recentMessages = dashboardData?.recent_messages || [];
  const system = dashboardData?.system;
  const isDraftSaving = draftMutation.isPending;

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic">Beranda Dashboard</h1>
        <p className="text-sm font-bold text-gray-400 mt-1">Pusat Kendali Informasi Portal Pesantren</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At a Glance (Sekilas) Widget */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden hover:shadow-2xl transition-shadow duration-300">
           <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Sekilas</h2>
           </div>
            {isLoading ? (
               <div className="p-5 flex flex-col sm:flex-row gap-8">
                  <div className="space-y-4 flex-1">
                     <div className="flex items-center gap-3">
                        <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
                        <Skeleton variant="text" width="60%" />
                     </div>
                     <div className="flex items-center gap-3">
                        <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
                        <Skeleton variant="text" width="60%" />
                     </div>
                     <div className="flex items-center gap-3">
                        <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
                        <Skeleton variant="text" width="60%" />
                     </div>
                  </div>
                  <div className="space-y-4 flex-1">
                     <div className="flex items-center gap-3">
                        <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
                        <Skeleton variant="text" width="60%" />
                     </div>
                  </div>
               </div>
            ) : (
               <div className="p-5 flex flex-col sm:flex-row gap-8">
                  <div className="space-y-4 flex-1">
                     <div className="flex items-center gap-3 text-sm text-primary hover:underline cursor-pointer group">
                        <div className="p-2 bg-blue-50 rounded group-hover:bg-blue-100 transition-colors">
                           <Edit3 className="w-4 h-4 text-primary" />
                        </div>
                        <span><strong className="text-gray-900">{stats?.posts || 0}</strong> Posting</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-primary hover:underline cursor-pointer group">
                        <div className="p-2 bg-indigo-50 rounded group-hover:bg-indigo-100 transition-colors">
                           <FileText className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span><strong className="text-gray-900">{stats?.pages || 0}</strong> Laman</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-primary hover:underline cursor-pointer group">
                        <div className="p-2 bg-emerald-50 rounded group-hover:bg-emerald-100 transition-colors">
                           <CalendarDays className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span><strong className="text-gray-900">{stats?.agendas || 0}</strong> Agenda</span>
                     </div>
                  </div>
                  <div className="space-y-4 flex-1">
                     <div className="flex items-center gap-3 text-sm text-primary hover:underline cursor-pointer group">
                        <div className="p-2 bg-orange-50 rounded group-hover:bg-orange-100 transition-colors">
                           <Megaphone className="w-4 h-4 text-orange-600" />
                        </div>
                        <span><strong className="text-gray-900">{stats?.announcements || 0}</strong> Pengumuman</span>
                     </div>
                  </div>
               </div>
            )}
           <div className="px-5 py-3 bg-gray-50 text-[10px] text-gray-400 border-t border-gray-100 font-bold uppercase tracking-widest">
              Built with Laravel 11 & React 18
           </div>
        </div>

        {/* Quick Draft (Draf Cepat) Widget */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden hover:shadow-2xl transition-shadow duration-300">
           <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Draf Cepat</h2>
           </div>
           <div className="p-5">
              <form className="space-y-4" onSubmit={handleSaveDraft}>
                 <div>
                    <input 
                      type="text" 
                      placeholder="Judul" 
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    />
                 </div>
                 <div>
                    <textarea 
                      rows={3} 
                      placeholder="Apa yang sedang Anda pikirkan?" 
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    ></textarea>
                 </div>
                 <button 
                   type="submit" 
                   disabled={isDraftSaving}
                   className="bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                 >
                    {isDraftSaving ? 'Menyimpan...' : 'Simpan Draf'}
                 </button>
              </form>
           </div>
         </div>

        {/* Tren Aktivitas Portal (Recharts) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden lg:col-span-2 hover:shadow-2xl transition-shadow duration-300">
           <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Tren Aktivitas Portal (6 Bulan Terakhir)</h2>
              <span className="text-[10px] text-primary font-black uppercase bg-primary/10 px-2 py-1 rounded">Visualisasi Tren</span>
           </div>
           <div className="p-8">
              {isLoading ? (
                <div className="h-[250px] w-full p-4">
                  <Skeleton variant="rectangular" width="100%" height="100%" className="rounded-2xl" />
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trends}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="right" 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '20px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="posts" 
                        name="Berita"
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPosts)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="messages" 
                        name="Pesan"
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorMessages)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
           </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden hover:shadow-2xl transition-shadow duration-300">
           <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Aktivitas Terbaru</h2>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Warta / Pos</span>
           </div>
           <div className="p-5">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="40%" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post: any) => (
                    <div key={post.id} className="group flex items-center justify-between gap-4 p-2 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
                       <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                             <Edit3 className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                             <p className="text-xs font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{post.title}</p>
                             <p className="text-[10px] text-gray-400 font-medium">{new Date(post.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} • {post.category?.name || 'Uncategorized'}</p>
                          </div>
                       </div>
                       <ArrowRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                   <p className="text-xs text-gray-400 italic">Belum ada postingan diterbitkan.</p>
                </div>
              )}
           </div>
        </div>

        {/* Contact Messages Widget */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden hover:shadow-2xl transition-shadow duration-300">
           <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Pesan Masuk Terbaru</h2>
              {stats?.unread_messages ? (
                <span className="text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">{stats.unread_messages} BARU</span>
              ) : (
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inquiry</span>
              )}
           </div>
           <div className="p-5">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 bg-gray-100 rounded w-full"></div>)}
                </div>
              ) : recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {recentMessages.map((msg: any) => (
                    <div key={msg.id} className="group flex items-center justify-between gap-4 p-2 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
                       <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.status === 'unread' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400'}`}>
                             {msg.status === 'unread' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                             <p className={`text-xs font-bold truncate transition-colors ${msg.status === 'unread' ? 'text-gray-900 font-black' : 'text-gray-500 group-hover:text-primary'}`}>{msg.name}</p>
                             <p className="text-[10px] text-gray-400 font-medium truncate">{msg.subject || 'No Subject'} • {new Date(msg.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                          </div>
                       </div>
                       {msg.status === 'unread' && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                  ))}
                  <a href="/admin/contact-messages" className="block text-center py-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/10 rounded-xl hover:bg-primary/5 transition-all mt-2">
                     Lihat Semua Pesan
                  </a>
                </div>
              ) : (
                <div className="py-12 text-center">
                   <p className="text-xs text-gray-400 italic">Tidak ada pesan masuk.</p>
                </div>
              )}
           </div>
        </div>

        {/* System Health / Status */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden hover:shadow-2xl transition-shadow duration-300">
           <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Kesehatan Situs & Sistem</h2>
           </div>
           <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-green-500" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">Sistem Berjalan Baik</p>
                    <p className="text-[11px] text-gray-500">Semua layanan utama terdeteksi aktif.</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">PHP Version</p>
                    <p className="text-sm font-bold text-gray-700">{system?.php_version || '...'}</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Environment</p>
                    <p className="text-sm font-bold text-gray-700">Production</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Database</p>
                    <p className="text-sm font-bold text-gray-700 capitalize">{system?.database || '...'}</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Platform</p>
                    <p className="text-sm font-bold text-gray-700">{system?.os || '...'}</p>
                 </div>
              </div>

              <button type="button" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold text-xs transition-colors border border-gray-200">
                 Detail Status Sistem
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
