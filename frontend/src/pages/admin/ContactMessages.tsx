import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Eye, RefreshCw, Loader2, MailOpen, CheckCheck, Clock, Search, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  unread:  { label: 'Belum Dibaca', color: 'bg-blue-50 text-blue-600 border-blue-100',   icon: <Mail className="w-3 h-3" /> },
  read:    { label: 'Sudah Dibaca', color: 'bg-gray-50 text-gray-500 border-gray-100',   icon: <MailOpen className="w-3 h-3" /> },
  replied: { label: 'Sudah Dibalas', color: 'bg-green-50 text-green-600 border-green-100', icon: <CheckCheck className="w-3 h-3" /> },
};

export default function ContactMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const [msgRes, countRes] = await Promise.all([
        api.get('/contact-messages', { params: { status: filterStatus } }),
        api.get('/contact-messages/unread-count'),
      ]);
      setMessages(msgRes.data.data || msgRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filterStatus]);

  const handleView = async (msg: any) => {
    setSelectedMessage(msg);
    // Jika belum dibaca, fetch detail (auto mark read di backend)
    if (msg.status === 'unread') {
      try {
        const res = await api.get(`/contact-messages/${msg.id}`);
        setSelectedMessage(res.data);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch { /* ignore */ }
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/contact-messages/${id}/status`, { status });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      if (selectedMessage?.id === id) setSelectedMessage((prev: any) => ({ ...prev, status }));
      fetchMessages(); // refresh count
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pesan ini secara permanen?')) return;
    setIsDeleting(id);
    try {
      await api.delete(`/contact-messages/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      fetchMessages();
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const filtered = messages.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic">Pesan Masuk</h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Formulir kontak dari pengunjung portal publik</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-4 py-2 rounded-xl">
              <Mail className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">{unreadCount} Belum Dibaca</span>
            </div>
          )}
          <button
            onClick={fetchMessages}
            className="p-2.5 bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left: List Panel */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          {/* Filter & Search */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white p-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, email, perihal..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'unread', 'read', 'replied'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterStatus === s ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-primary/30'}`}
                >
                  {s === 'all' ? 'Semua' : statusConfig[s]?.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Memuat pesan...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tidak ada pesan</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => handleView(msg)}
                    className={`w-full text-left px-5 py-4 hover:bg-gray-50/80 transition-all flex items-start gap-4 ${selectedMessage?.id === msg.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm uppercase ${msg.status === 'unread' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {msg.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-sm font-black truncate ${msg.status === 'unread' ? 'text-gray-900' : 'text-gray-500'}`}>{msg.name}</span>
                        <span className="text-[9px] font-bold text-gray-300 shrink-0">
                          {new Date(msg.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-400 truncate">{msg.subject || 'Pesan Kontak'}</p>
                      <p className="text-[11px] text-gray-300 truncate mt-0.5 font-medium">{msg.message}</p>
                    </div>
                    {msg.status === 'unread' && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="hidden lg:block lg:w-3/5">
          {selectedMessage ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden sticky top-28">
              {/* Detail Header */}
              <div className="px-8 py-6 border-b border-gray-50 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-black text-gray-900 text-lg tracking-tight">{selectedMessage.name}</h2>
                  <p className="text-xs text-gray-400 font-bold mt-1">{selectedMessage.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border ${statusConfig[selectedMessage.status]?.color}`}>
                    {statusConfig[selectedMessage.status]?.icon}
                    {statusConfig[selectedMessage.status]?.label}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Perihal:</span>
                  <span className="text-xs font-black text-gray-700 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    {selectedMessage.subject || 'Pesan Kontak'}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-300 font-bold">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedMessage.created_at).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-8 py-5 border-t border-gray-50 flex items-center gap-3 flex-wrap">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                  <Mail className="w-4 h-4" /> Balas via Email
                </a>
                {selectedMessage.status !== 'replied' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                    className="flex items-center gap-2 bg-green-50 text-green-600 border border-green-100 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-100 transition-all"
                  >
                    <CheckCheck className="w-4 h-4" /> Tandai Dibalas
                  </button>
                )}
                {selectedMessage.status !== 'unread' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'unread')}
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                  >
                    <Mail className="w-4 h-4" /> Tandai Belum Baca
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  disabled={isDeleting === selectedMessage.id}
                  className="ml-auto flex items-center gap-2 bg-red-50 text-red-500 border border-red-100 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                >
                  {isDeleting === selectedMessage.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center">
                <Eye className="w-10 h-10 text-primary/20" />
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Pilih pesan untuk dibaca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
