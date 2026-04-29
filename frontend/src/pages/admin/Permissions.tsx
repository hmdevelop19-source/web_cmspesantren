import React, { useEffect } from 'react';
import { Info, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function Permissions() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  const { data: matrix = {}, isLoading } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: async () => {
      const response = await api.get('/permissions');
      return response.data.matrix;
    },
    enabled: isAdmin()
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const roles = [
    { id: 'admin', name: 'Administrator', desc: 'Akses penuh ke semua fitur.' },
    { id: 'editor', name: 'Editor', desc: 'Mengelola konten (Pos, Laman, Media).' },
    { id: 'author', name: 'Penulis', desc: 'Menulis dan mengelola pos sendiri.' },
  ];

  const menuGroups = [
    {
      group: 'KONTEN',
      items: [
        { id: 'posts', label: 'Berita / Pos' },
        { id: 'pengumumans', label: 'Pengumuman' },
        { id: 'agendas', label: 'Agenda' },
        { id: 'videos', label: 'Video Kegiatan' },
        { id: 'media', label: 'Media Lab' },
        { id: 'pages', label: 'Laman Statis' },
      ]
    },
    {
      group: 'TAMPILAN',
      items: [
        { id: 'header', label: 'Header & Logo' },
        { id: 'hero', label: 'Spanduk Utama' },
      ]
    },
    {
      group: 'SISTEM',
      items: [
        { id: 'users', label: 'Manajemen Pengguna' },
        { id: 'permissions', label: 'Izin & Peran' },
        { id: 'settings', label: 'Pengaturan Global' },
      ]
    }
  ];

  const toggleMutation = useMutation({
    mutationFn: ({ role, menu, can_access }: { role: string, menu: string, can_access: boolean }) => 
      api.post('/permissions', { role, menu, can_access }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
    },
    onError: () => {
      alert('Gagal memperbarui izin.');
    }
  });

  const handleToggle = (role: string, menu: string, currentVal: boolean) => {
    if (role === 'admin') return;
    toggleMutation.mutate({ role, menu, can_access: !currentVal });
  };



  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Izin & Peran Pengguna</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola hak akses menu dan otoritas fungsional untuk setiap level staf pesantren</p>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${role.id === 'admin' ? 'bg-purple-500' : role.id === 'editor' ? 'bg-primary' : 'bg-amber-500'}`}></div>
            <h3 className="font-bold text-slate-800 text-lg tracking-tight mb-2">{role.name}</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">{role.desc}</p>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? (
            <div className="py-24 text-center flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <span className="text-slate-400 font-medium">Sinkronisasi matriks izin...</span>
            </div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Modul / Navigasi</th>
                    {roles.map((role) => (
                      <th key={role.id} className="px-6 py-5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">{role.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {menuGroups.map((group) => (
                    <React.Fragment key={group.group}>
                      <tr className="bg-slate-50/30">
                        <td colSpan={4} className="px-8 py-3 text-[10px] font-bold text-primary uppercase tracking-widest bg-gradient-to-r from-primary/5 to-transparent">
                          {group.group}
                        </td>
                      </tr>
                      {group.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <span className="text-sm font-bold text-slate-700">{item.label}</span>
                          </td>
                          {roles.map((role) => {
                            const hasPerm = role.id === 'admin' ? true : (matrix[item.id] ? matrix[item.id][role.id] : false);
                            return (
                                <td key={role.id} className="px-6 py-5 text-center">
                                  <div className="flex justify-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={hasPerm}
                                        onChange={() => handleToggle(role.id, item.id, hasPerm)}
                                        className="sr-only peer"
                                        disabled={role.id === 'admin'}
                                      />
                                      <div className={`w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${role.id === 'admin' ? 'peer-checked:bg-purple-600 opacity-40 cursor-not-allowed' : 'peer-checked:bg-primary'}`}></div>
                                    </label>
                                  </div>
                                </td>
                            )
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>

      {/* Security Info */}
      <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl flex items-start gap-5">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-primary">
            <Info className="w-5 h-5" />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-800 tracking-tight">Panduan Keamanan Akses</p>
          <ul className="text-xs text-slate-500 leading-relaxed space-y-2 list-disc pl-4 marker:text-primary/40">
            <li>Administrator (Master) memiliki akses penuh yang tidak dapat diubah.</li>
            <li>Perubahan izin akan berdampak langsung pada tampilan menu navigasi pengguna terkait.</li>
            <li>Status izin disimpan secara otomatis setiap kali Anda mengubah tombol akses di atas.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
