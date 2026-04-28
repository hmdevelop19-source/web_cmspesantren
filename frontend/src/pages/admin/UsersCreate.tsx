import { useState, useEffect } from 'react';
import { UserPlus, ArrowLeft, Shield, Mail, Lock, User as UserIcon, CheckCircle2, Loader2, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import type { User } from '../../types';

export default function UsersCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'author' as 'admin' | 'editor' | 'author',
    status: 'active' as 'active' | 'inactive'
  });
  const [error, setError] = useState<string | null>(null);

  const { data: user, isLoading: isFetching } = useQuery<User>({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`);
      return response.data.data || response.data;
    },
    enabled: isEdit
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: (user.role as any) || 'author',
        status: (user.status as any) || 'active'
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload = { ...data };
      if (isEdit && !payload.password) {
        delete (payload as any).password;
      }
      return isEdit ? api.put(`/users/${id}`, payload) : api.post('/users', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      if (id) queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      navigate('/admin/users');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal menyimpan data pengguna.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(formData);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-gray-500 text-sm">Memuat data pengguna...</p>
      </div>
    );
  }

  const isLoading = mutation.isPending;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link to="/admin/users" className="text-primary hover:text-primary-dark flex items-center gap-1 text-sm font-bold mb-4 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pengguna
        </Link>
        <h1 className="text-2xl font-normal text-gray-800 flex items-center gap-2">
          {isEdit ? 'Sunting Pengguna' : 'Tambah Pengguna Baru'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? 'Perbarui informasi akun dan hak akses pengguna ini.' : 'Buat akun baru untuk staf atau pengurus konten pesantren.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-primary" /> Informasi Pribadi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Contoh: Ahmad Faisal, S.Pd" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Alamat Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="email@institusi.ac.id" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" 
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">{isEdit ? 'Kata Sandi Baru (Kosongkan jika tidak diganti)' : 'Kata Sandi'}</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!isEdit}
                  placeholder="••••••••" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" 
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 italic">Gunakan minimal 8 karakter.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8">
            <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-4 flex items-center gap-2 mb-6">
              <Shield className="w-4 h-4 text-primary" /> Pengaturan Hak Akses
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 block">Peran / Role</label>
                <div className="space-y-3">
                  {[
                    { id: 'admin', label: 'Administrator', desc: 'Akses penuh ke seluruh sistem.' },
                    { id: 'editor', label: 'Editor', desc: 'Dapat mengelola konten milik sendiri & orang lain.' },
                    { id: 'author', label: 'Penulis', desc: 'Dapat menulis dan mengelola konten milik sendiri.' }
                  ].map((role) => (
                    <label key={role.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors group ${formData.role === role.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value={role.id} 
                        checked={formData.role === role.id}
                        onChange={() => setFormData({ ...formData, role: role.id as any })}
                        className="w-4 h-4 text-primary focus:ring-primary" 
                      />
                      <div>
                        <span className="text-sm font-bold text-gray-800 block">{role.label}</span>
                        <span className="text-[10px] text-gray-500 block">{role.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 block">Status Akun</label>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="active" 
                        checked={formData.status === 'active'}
                        onChange={() => setFormData({ ...formData, status: 'active' })}
                        className="w-4 h-4 text-primary focus:ring-primary" 
                      />
                      <span className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${formData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>Aktif</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="inactive" 
                        checked={formData.status === 'inactive'}
                        onChange={() => setFormData({ ...formData, status: 'inactive' })}
                        className="w-4 h-4 text-primary focus:ring-primary" 
                      />
                      <span className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${formData.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-500'}`}>Nonaktif</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">Akun nonaktif tidak akan dapat melakukan log masuk ke CMS hingga status diaktifkan kembali.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sticky top-20">
            <h3 className="font-bold text-gray-800 text-sm mb-4 italic text-center border-b border-dashed border-gray-100 pb-4 tracking-widest uppercase">Konfirmasi</h3>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
              {isEdit ? 'Simpan Perubahan' : 'Terbitkan Pengguna'}
            </button>
            
            <button 
              type="button" 
              disabled={isLoading}
              onClick={() => navigate('/admin/users')}
              className="w-full bg-white text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 text-sm disabled:opacity-50"
            >
              Batalkan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
