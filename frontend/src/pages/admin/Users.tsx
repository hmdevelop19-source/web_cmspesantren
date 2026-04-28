import { Search, UserPlus, Shield, Mail, MoreHorizontal, Loader2, Trash2, Edit3, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { User, PaginatedResponse } from '../../types';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const currentUser = useAuthStore((state) => state.user);
  const { isAdmin } = useAuthStore();
  const isSuperAdmin = isAdmin();

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['admin-users', triggerSearch],
    queryFn: async () => {
      const response = await api.get('/users', {
        params: { search: triggerSearch }
      });
      const resData = response.data;
      if (resData.meta) {
        return { ...resData.meta, data: resData.data, links: resData.links };
      }
      return resData;
    },
    enabled: isSuperAdmin
  });

  useEffect(() => {
    if (!isSuperAdmin) {
        navigate('/admin/dashboard');
    }
  }, [isSuperAdmin, navigate]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      alert('Gagal menghapus pengguna. ' + (error.response?.data?.message || ''));
    }
  });

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
        alert('Anda tidak bisa menghapus akun sendiri.');
        return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus akun ${user.name}?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleLogout = async () => {
    try {
        await api.post('/logout');
    } catch (e) {
        console.error('Logout error:', e);
    } finally {
        logout();
        navigate('/login');
    }
  };

  const users = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-normal text-gray-800 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Manajemen Pengguna
          </h1>
          {isSuperAdmin && (
            <Link to="/admin/users/create" className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 font-medium">
              <UserPlus className="w-4 h-4" /> Tambah Pengguna
            </Link>
          )}
        </div>
        
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); setTriggerSearch(searchTerm); }}>
           <div className="relative">
             <input 
               type="text" 
               placeholder="Cari pengguna..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full sm:w-64 border border-gray-300 rounded-xl px-4 py-2 pl-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white shadow-sm h-10 transition-all" 
             />
             <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
           </div>
           <button type="submit" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 font-bold transition-all h-10 flex items-center justify-center">
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
           </button>
        </form>
      </div>

      <div className="flex justify-between items-center mb-4 text-sm px-1">
        <div className="flex gap-4">
          <span className="text-gray-900 font-bold border-b-2 border-primary pb-1 cursor-pointer">Semua ({total})</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden min-h-[400px] relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama & Email</th>
                <th className="px-6 py-4">Peran</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="text-gray-500 font-medium">Memuat data pengguna...</span>
                        </div>
                    </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 uppercase">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-bold text-gray-900 transition-colors ${isSuperAdmin ? 'group-hover:text-primary' : ''}`}>{user.name}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                            </span>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 
                            user.role === 'editor' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                            'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                        {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter ${user.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500 animate-pulse outline ring-2 ring-green-100' : 'bg-gray-300'}`}></span>
                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isSuperAdmin && (
                          <>
                            <Link to={`/admin/users/edit/${user.id}`} className="text-primary font-bold text-xs hover:text-primary-dark uppercase hover:shadow-sm px-2 py-1 flex items-center gap-1 transition-all">
                              <Edit3 className="w-3 h-3" /> Sunting
                            </Link>
                            <button 
                              disabled={user.id === currentUser?.id}
                              onClick={() => handleDelete(user)}
                              className="text-red-500 font-bold text-xs hover:text-red-700 uppercase disabled:opacity-20 flex items-center gap-1 transition-all"
                            >
                              <Trash2 className="w-3 h-3" /> Hapus
                            </button>
                          </>
                        )}
                        </div>
                        <button className="p-1 text-gray-400 hover:text-gray-600 md:hidden">
                        <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </td>
                    </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500 text-sm italic">
                        Tidak ada pengguna ditemukan.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profil Saya Section Quick Access */}
      <div className="mt-12 bg-primary-dark text-white rounded-2xl p-8 shadow-xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Shield className="w-32 h-32" />
         </div>
         <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2 uppercase tracking-wide">Profil Saya</h2>
            <p className="text-gray-300 text-sm mb-6 max-w-md">Anda masuk sebagai <span className="text-secondary font-bold font-mono">{currentUser?.name}</span> ({currentUser?.role}). Jaga kerahasiaan kata sandi Anda.</p>
            <div className="flex flex-wrap gap-4">
               <button className="bg-secondary text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors shadow-lg shadow-secondary/20 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit Profil & Sandi
               </button>
               <button 
                 onClick={handleLogout}
                 className="bg-white/10 hover:bg-red-500/20 px-6 py-2.5 rounded-xl font-bold text-sm transition-all border border-white/10 backdrop-blur-sm flex items-center gap-2"
               >
                  <LogOut className="w-4 h-4 text-red-400" /> Keluar Sesi
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
