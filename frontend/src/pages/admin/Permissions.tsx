import { ShieldCheck, Info, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function Permissions() {
  const [matrix, setMatrix] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/dashboard');
      return;
    }
    fetchPermissions();
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

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/permissions');
      setMatrix(response.data.matrix);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleToggle = async (role: string, menu: string, currentVal: boolean) => {
    if (role === 'admin') return;

    try {
      await api.post('/permissions', {
        role,
        menu,
        can_access: !currentVal
      });
      
      // Update local state
      setMatrix((prev: any) => ({
        ...prev,
        [menu]: {
          ...(prev[menu] || {}),
          [role]: !currentVal
        }
      }));
    } catch (error) {
      alert('Gagal memperbarui izin.');
    }
  };



  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-normal text-gray-800 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Pengaturan Izin & Peran
        </h1>
        <p className="text-sm text-gray-500 mt-1 uppercase tracking-tighter">Konfigurasikan akses menu berdasarkan peran pengguna di sistem CMS Pesantren.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {roles.map((role) => (
          <div key={role.id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${role.id === 'admin' ? 'bg-purple-500' : role.id === 'editor' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-lg tracking-tight">{role.name}</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed opacity-80">{role.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden mb-12">
        {isLoading ? (
            <div className="py-40 text-center flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="text-gray-500 font-medium">Sinkronisasi matriks izin...</span>
            </div>
        ) : (
            <div className="overflow-x-auto text-sm">
            <table className="w-full text-left">
                <thead className="bg-gray-100/80 border-b border-gray-200 text-gray-800 uppercase text-[11px] font-black tracking-[0.1em]">
                <tr>
                    <th className="px-8 py-6 w-1/2">Modul / Navigasi</th>
                    {roles.map((role) => (
                    <th key={role.id} className="px-6 py-6 text-center">{role.name}</th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {menuGroups.map((group) => (
                    <React.Fragment key={group.group}>
                    <tr className="bg-gray-50/80">
                        <td colSpan={4} className="px-8 py-3.5 text-[10px] font-black text-primary/60 tracking-[0.2em] uppercase bg-gradient-to-r from-gray-50 to-transparent">
                        &mdash; {group.group}
                        </td>
                    </tr>
                    {group.items.map((item) => (
                        <tr key={item.id} className="group hover:bg-yellow-50/40 transition-colors">
                        <td className="px-8 py-5">
                            <div className="flex flex-col">
                            <span className="font-bold text-gray-800 group-hover:text-primary transition-colors tracking-tight text-sm">{item.label}</span>
                            <span className="text-[10px] text-gray-400 font-mono italic opacity-0 group-hover:opacity-100 transition-opacity">endpoint: api/{item.id}</span>
                            </div>
                        </td>
                        {roles.map((role) => {
                            const hasPerm = role.id === 'admin' ? true : (matrix[item.id] ? matrix[item.id][role.id] : false);
                            return (
                                <td key={role.id} className="px-6 py-5 text-center">
                                <label className="relative inline-flex items-center cursor-pointer group/toggle">
                                    <input 
                                    type="checkbox" 
                                    checked={hasPerm}
                                    onChange={() => handleToggle(role.id, item.id, hasPerm)}
                                    className="sr-only peer"
                                    disabled={role.id === 'admin'}
                                    />
                                    <div className={`w-12 h-6.5 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:left-[4px] ${role.id === 'admin' ? 'peer-checked:bg-purple-600 cursor-not-allowed opacity-40' : 'peer-checked:bg-primary shadow-sm hover:shadow-md'}`}></div>
                                </label>
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

      <div className="mt-8 bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4 mb-24 shadow-sm">
        <div className="bg-amber-100 p-2 rounded-lg">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
        </div>
        <div className="text-sm text-amber-900/80 leading-relaxed font-medium">
          <p className="font-black mb-1 uppercase tracking-tight text-amber-900 italic underline decoration-amber-200 underline-offset-4">Peringatan Keamanan System:</p>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-amber-400">
            <li>Administrator memiliki akses mutlak (Master Account) yang tidak dapat dibatasi melalui panel ini.</li>
            <li>Perubahan pada matriks izin akan berdampak langsung pada visibilitas menu di sisi navigasi pengguna lain.</li>
            <li>Status sinkronisasi bersifat otomatis; setiap perubahan pada tombol <i>toggle</i> akan langsung tersimpan di basis data.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}

// Simple React Fragment fix for the loop
import React from 'react';
