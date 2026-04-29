import React, { useState } from 'react';
import { Mail, Trash2, Eye, RefreshCw, Loader2, MailOpen, CheckCheck, Clock, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ContactMessage } from '../../types';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  unread:  { label: 'Belum Dibaca', color: 'bg-blue-50 text-blue-600 border-blue-100',   icon: <Mail className="w-3 h-3" /> },
  read:    { label: 'Sudah Dibaca', color: 'bg-gray-50 text-gray-500 border-gray-100',   icon: <MailOpen className="w-3 h-3" /> },
  replied: { label: 'Sudah Dibalas', color: 'bg-green-50 text-green-600 border-green-100', icon: <CheckCheck className="w-3 h-3" /> },
};

export default function ContactMessages() {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['admin-messages', filterStatus],
    queryFn: async () => {
      const response = await api.get('/contact-messages', { params: { status: filterStatus } });
      return response.data.data || response.data;
    }
  });

  const { data: unreadCountData } = useQuery({
    queryKey: ['admin-messages-unread-count'],
    queryFn: async () => {
      const response = await api.get('/contact-messages/unread-count');
      return response.data.count;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => api.patch(`/contact-messages/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-unread-count'] });
    }
  });

  const viewMutation = useMutation({
    mutationFn: (id: number) => api.get(`/contact-messages/${id}`),
    onSuccess: (res) => {
      setSelectedMessage(res.data);
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-unread-count'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/contact-messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-unread-count'] });
      setSelectedMessage(null);
    }
  });

  const handleView = (msg: any) => {
    if (msg.status === 'unread') {
      viewMutation.mutate(msg.id);
    } else {
      setSelectedMessage(msg);
    }
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Hapus pesan ini secara permanen?')) return;
    deleteMutation.mutate(id);
  };

  const messages = (messagesData as ContactMessage[]) || [];
  const unreadCount = unreadCountData || 0;
  const isDeleting = deleteMutation.isPending ? deleteMutation.variables : null;

  const filtered = messages.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pusat Pesan Kontak</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola aspirasi, pertanyaan, dan masukan dari pengunjung portal pesantren</p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {unreadCount} Pesan Baru
            </div>
          )}
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
              queryClient.invalidateQueries({ queryKey: ['admin-messages-unread-count'] });
            }}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
            title="Refresh Pesan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: List Panel */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pengirim..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-inner"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {['all', 'unread', 'read', 'replied'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${filterStatus === s ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                  {s === 'all' ? 'Semua' : statusConfig[s]?.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 min-h-[500px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Memuat...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-300 text-center px-8">
                <Mail className="w-12 h-12 opacity-20 mb-4" />
                <p className="text-sm font-medium italic">Tidak ada pesan ditemukan</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                {filtered.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleView(msg)}
                    className={`p-6 cursor-pointer transition-all hover:bg-slate-50/80 group relative ${selectedMessage?.id === msg.id ? 'bg-slate-50' : ''}`}
                  >
                    {selectedMessage?.id === msg.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-sm font-bold truncate ${msg.status === 'unread' ? 'text-slate-900' : 'text-slate-500'}`}>
                          {msg.name}
                       </span>
                       <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-3">
                          {new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                       </span>
                    </div>
                    <p className={`text-xs truncate leading-relaxed ${msg.status === 'unread' ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>
                       {msg.subject || 'Tanpa Subjek'}
                    </p>
                    
                    <div className="mt-3 flex items-center gap-2">
                       <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${statusConfig[msg.status]?.color}`}>
                          {statusConfig[msg.status]?.icon}
                          {statusConfig[msg.status]?.label}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Message Detail */}
        <div className="flex-1">
          {selectedMessage ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                  <div className="space-y-4 max-w-2xl">
                     <div className="space-y-1">
                        <h2 className="text-xl font-bold text-slate-800 leading-tight">
                           {selectedMessage.subject || '(Tanpa Subjek)'}
                        </h2>
                        <div className="flex items-center gap-3 text-sm">
                           <span className="font-bold text-primary">{selectedMessage.name}</span>
                           <span className="text-slate-300">•</span>
                           <span className="text-slate-500 font-medium">{selectedMessage.email}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(selectedMessage.created_at).toLocaleString('id-ID')}</span>
                        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2 py-0.5 rounded">IP: {selectedMessage.ip_address || 'Unknown'}</span>
                     </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>

               <div className="p-8 flex-1 bg-slate-50/30">
                  <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm text-slate-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[300px]">
                     {selectedMessage.message}
                  </div>
               </div>

               <div className="p-8 border-t border-slate-100 bg-white flex flex-wrap items-center gap-4">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10"
                  >
                    <Mail className="w-4 h-4" /> Balas Pesan
                  </a>

                  <div className="flex items-center gap-2 ml-auto">
                    {selectedMessage.status !== 'replied' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
                      >
                        <CheckCheck className="w-4 h-4 text-green-500" /> Tandai Dibalas
                      </button>
                    )}
                    {selectedMessage.status !== 'unread' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'unread')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
                      >
                        <Mail className="w-4 h-4 text-blue-500" /> Belum Baca
                      </button>
                    )}
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-48 text-center px-12 h-full">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Eye className="w-10 h-10 text-slate-200" />
               </div>
               <h3 className="text-lg font-bold text-slate-400">Pilih Pesan</h3>
               <p className="text-sm text-slate-300 mt-1">Silakan pilih pesan dari daftar di samping untuk melihat rincian isi pesan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
