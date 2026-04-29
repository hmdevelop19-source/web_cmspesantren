import { Search, UserPlus, Shield, Trash2, Edit3, LogOut } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
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

  const { canWrite } = useAuthStore();
  const hasWriteAccess = canWrite('users');
  const users = data?.data || [];

  return (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola administrator, guru, dan hak akses staf pesantren</p>
        </div>

        {hasWriteAccess && (
          <Link to="/admin/users/create" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/10">
            <UserPlus className="w-4 h-4" /> Tambah Pengguna Baru
          </Link>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <form className="w-full lg:w-96 relative" onSubmit={(e) => { e.preventDefault(); setTriggerSearch(searchTerm); }}>
           <input 
             type="text" 
             placeholder="Cari nama atau email..." 
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Informasi Personel</th>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hak Akses</th>
                     <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                           <td className="px-8 py-5"><Skeleton variant="text" width="60%" /></td>
                           <td className="px-8 py-5"><Skeleton variant="text" width="40%" /></td>
                           <td className="px-8 py-5"><Skeleton variant="text" width="30%" /></td>
                           <td className="px-8 py-5 text-right"><Skeleton variant="rectangular" width={80} height={32} className="rounded-lg inline-block" /></td>
                        </tr>
                     ))
                  ) : users.length > 0 ? (
                    users.map((user) => (
                       <tr key={user.id} className="group hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10 font-bold">
                                   {user.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                   <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{user.name}</p>
                                   <p className="text-[11px] text-slate-400 mt-0.5 truncate font-medium">{user.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                                ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                                  user.role === 'editor' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                  'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                {user.role}
                             </span>
                          </td>
                          <td className="px-8 py-5">
                             {user.status === 'active' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-100">
                                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Aktif
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                   Nonaktif
                                </span>
                             )}
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                {isSuperAdmin && (
                                   <>
                                      <Link to={`/admin/users/edit/${user.id}`} className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit Pengguna">
                                         <Edit3 className="w-4 h-4" />
                                      </Link>
                                      <button 
                                         disabled={user.id === currentUser?.id}
                                         onClick={() => handleDelete(user)}
                                         className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-0"
                                         title="Hapus Pengguna"
                                      >
                                         <Trash2 className="w-4 h-4" />
                                      </button>
                                   </>
                                )}
                             </div>
                          </td>
                       </tr>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={4} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-4 text-slate-300">
                             <Shield className="w-12 h-12 opacity-20" />
                             <p className="text-sm font-medium italic">Belum ada personel terdaftar</p>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* My Profile Quick Access */}
      <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-secondary text-2xl font-bold shadow-2xl">
                  {currentUser?.name.charAt(0)}
               </div>
               <div>
                  <h2 className="text-xl font-bold mb-1">Pusat Kendali Profil</h2>
                  <p className="text-slate-400 text-xs">
                     Anda masuk sebagai <span className="text-secondary font-bold">{currentUser?.name}</span> • <span className="uppercase tracking-wider opacity-80">{currentUser?.role}</span>
                  </p>
               </div>
            </div>
            <div className="flex gap-3">
               <Link to="/admin/profile" className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-secondary" /> Perbarui Profil
               </Link>
               <button 
                 onClick={handleLogout}
                 className="bg-red-500/20 hover:bg-red-500/40 px-6 py-2.5 rounded-xl text-xs font-bold transition-all border border-red-500/20 flex items-center gap-2"
               >
                  <LogOut className="w-4 h-4 text-red-400" /> Akhiri Sesi
               </button>
            </div>
         </div>
         <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 translate-x-4 -translate-y-4">
            <Shield className="w-48 h-48" />
         </div>
      </div>
    </div>
  );
}
