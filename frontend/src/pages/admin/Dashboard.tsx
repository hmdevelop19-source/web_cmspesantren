import { FileText, Edit3, CalendarDays, Mail, Shield, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from '../../components/ui/Skeleton';
import type { Category } from '../../types';

interface DashboardStats {
  posts_count: number;
  agendas_count: number;
  messages_count: number;
  pages_count: number;
  users_count: number;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [defaultCatId, setDefaultCatId] = useState<number | null>(null);

  // Categories query to get default category for drafts
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
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-posts'] });
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
  
  // Dashboard statistics & data queries
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    }
  });

  const { data: recentPostsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-recent-posts'],
    queryFn: async () => {
      const response = await api.get('/posts', { params: { per_page: 5 } });
      return response.data;
    }
  });

  const { data: recentMessagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-recent-messages'],
    queryFn: async () => {
      const response = await api.get('/contact-messages', { params: { per_page: 5 } });
      return response.data;
    }
  });

  const isLoading = statsLoading || postsLoading || messagesLoading;
  const recentPosts = recentPostsData?.data || [];
  const recentMessages = recentMessagesData?.data || [];

  // Chart data configuration
  const chartData = [
    { month: 'Jan', value: 400 },
    { month: 'Feb', value: 300 },
    { month: 'Mar', value: 600 },
    { month: 'Apr', value: 800 },
    { month: 'Mei', value: 500 },
    { month: 'Jun', value: 900 },
  ];

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ringkasan Statistik</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau performa dan aktivitas terkini Portal Pesantren</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => queryClient.invalidateQueries()}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
           >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Perbarui Data
           </button>
           <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-all shadow-md shadow-primary/10">
              Buka Web Publik <ArrowRight className="w-3.5 h-3.5" />
           </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Statistics Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
           {/* Card 1 */}
           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm group hover:border-primary/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded">+12%</span>
              </div>
              <p className="text-sm font-medium text-slate-500">Total Warta</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats?.posts_count || 0}</h3>
           </div>

           {/* Card 2 */}
           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm group hover:border-secondary/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 rounded-lg bg-secondary/5 flex items-center justify-center text-secondary">
                    <CalendarDays className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded">Aktif</span>
              </div>
              <p className="text-sm font-medium text-slate-500">Agenda Aktif</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats?.agendas_count || 0}</h3>
           </div>

           {/* Card 3 */}
           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm group hover:border-primary/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Baru</span>
              </div>
              <p className="text-sm font-medium text-slate-500">Pesan Masuk</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats?.messages_count || 0}</h3>
           </div>

           {/* Chart Container */}
           <div className="sm:col-span-3 bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-lg font-bold text-slate-800">Analisis Kunjungan</h2>
                 <select className="text-xs font-semibold text-slate-500 bg-slate-50 border-none rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-primary/20">
                    <option>7 Hari Terakhir</option>
                    <option>30 Hari Terakhir</option>
                 </select>
              </div>
              <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#000052" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#000052" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                       <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                       />
                       <Area type="monotone" dataKey="value" stroke="#000052" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Quick Actions & Feeds */}
        <div className="lg:col-span-4 space-y-8">
           {/* Quick Draft */}
           <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
              <div className="relative z-10">
                 <h2 className="text-lg font-bold mb-2">Draf Kilat</h2>
                 <p className="text-slate-400 text-xs mb-6">Tulis ide atau berita singkat sekarang</p>
                 
                 <form onSubmit={handleSaveDraft} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Judul gagasan..." 
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="w-full bg-white/10 border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder:text-white/20 focus:bg-white/20 transition-all border"
                    />
                    <textarea 
                      placeholder="Intisari konten..." 
                      rows={3}
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      className="w-full bg-white/10 border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder:text-white/20 focus:bg-white/20 transition-all border resize-none"
                    ></textarea>
                    <button 
                      type="submit"
                      disabled={draftMutation.isPending || !draftTitle.trim()}
                      className="w-full bg-secondary text-slate-900 py-3 rounded-lg text-xs font-bold hover:bg-yellow-400 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {draftMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                      Simpan Sebagai Draf
                    </button>
                 </form>
              </div>
              <div className="absolute -bottom-8 -right-8 opacity-10">
                 <Edit3 className="w-32 h-32" />
              </div>
           </div>

           {/* System Status */}
           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                    <Shield className="w-6 h-6 text-green-500" />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800 text-sm">Status Sistem</h4>
                    <p className="text-[11px] text-green-500 font-semibold">Semua Layanan Normal</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Recent Activity Section */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
           {/* Recent Posts */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-bold text-slate-800 text-sm">Warta Terbaru</h3>
                 <Link to="/admin/posts" className="text-xs font-bold text-primary hover:underline">Lihat Semua</Link>
              </div>
              <div className="divide-y divide-slate-50">
                 {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton variant="text" width="100%" /></div>)
                 ) : recentPosts.length > 0 ? recentPosts.map((post: any) => (
                    <div key={post.id} className="p-4 hover:bg-slate-50 transition-colors group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                             <FileText className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors truncate">{post.title}</p>
                             <p className="text-[10px] text-slate-400 mt-0.5">{post.category?.name} • {new Date(post.updated_at).toLocaleDateString('id-ID')}</p>
                          </div>
                       </div>
                    </div>
                 )) : (
                    <div className="p-8 text-center text-xs text-slate-400">Belum ada warta terbaru.</div>
                 )}
              </div>
           </div>

           {/* Recent Messages */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-bold text-slate-800 text-sm">Pesan Masuk Terkini</h3>
                 <Link to="/admin/contact-messages" className="text-xs font-bold text-primary hover:underline">Kotak Masuk</Link>
              </div>
              <div className="divide-y divide-slate-50">
                 {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton variant="text" width="100%" /></div>)
                 ) : recentMessages.length > 0 ? recentMessages.map((msg: any) => (
                    <div key={msg.id} className="p-4 hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${msg.status === 'unread' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                             <Mail className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-700 truncate">{msg.name}</p>
                             <p className="text-[10px] text-slate-400 mt-0.5 truncate">{msg.subject || 'Tanpa Subjek'} • {new Date(msg.created_at).toLocaleDateString('id-ID')}</p>
                          </div>
                       </div>
                    </div>
                 )) : (
                    <div className="p-8 text-center text-xs text-slate-400">Tidak ada pesan masuk.</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
