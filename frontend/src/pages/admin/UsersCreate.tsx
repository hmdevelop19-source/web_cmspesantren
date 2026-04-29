import { useState, useEffect } from 'react';
import { UserPlus, ArrowLeft, Shield, Mail, Lock, User as UserIcon, Loader2, Save } from 'lucide-react';
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
      if (isEdit && !payload.password) delete (payload as any).password;
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
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat data pengguna...</p>
      </div>
    );
  }

  const isLoading = mutation.isPending;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/users" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {isEdit ? 'Sunting Pengguna' : 'Tambah Pengguna Baru'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isEdit ? 'Perbarui informasi akun dan hak akses pengguna ini.' : 'Buat akun baru untuk staf atau pengurus konten.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">{error}</span>}
          <Link to="/admin/users" className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
            Batalkan
          </Link>
          <button type="submit" form="user-form" disabled={isLoading}
            className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10 flex items-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
            {isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}
          </button>
        </div>
      </div>

      <form id="user-form" onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* Main Form Area */}
        <div className="lg:flex-1 space-y-6">
          {/* Personal Info */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-primary" /> Informasi Pribadi
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Nama Lengkap</label>
                  <input type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required placeholder="Contoh: Ahmad Faisal, S.Pd"
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Alamat Email</label>
                  <div className="relative">
                    <input type="email" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required placeholder="email@institusi.ac.id"
                      className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 pl-10 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  {isEdit ? 'Kata Sandi Baru (Kosongkan jika tidak diganti)' : 'Kata Sandi'}
                </label>
                <div className="relative">
                  <input type="password" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!isEdit} placeholder="••••••••"
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 pl-10 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[10px] text-slate-400">Gunakan minimal 8 karakter.</p>
              </div>
            </div>
          </div>

          {/* Access Rights */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" /> Hak Akses
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Peran / Role</label>
                  {[
                    { id: 'admin', label: 'Administrator', desc: 'Akses penuh ke seluruh sistem.' },
                    { id: 'editor', label: 'Editor', desc: 'Kelola konten milik sendiri & orang lain.' },
                    { id: 'author', label: 'Penulis', desc: 'Tulis dan kelola konten milik sendiri.' }
                  ].map((role) => (
                    <label key={role.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.role === role.id ? 'border-primary/30 bg-primary/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="role" value={role.id}
                        checked={formData.role === role.id}
                        onChange={() => setFormData({ ...formData, role: role.id as any })}
                        className="w-4 h-4 text-primary focus:ring-primary" />
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">{role.label}</span>
                        <span className="text-[10px] text-slate-400">{role.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Status Akun</label>
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="status" value="active"
                        checked={formData.status === 'active'}
                        onChange={() => setFormData({ ...formData, status: 'active' })}
                        className="w-4 h-4 text-primary focus:ring-primary" />
                      <span className={`text-sm font-bold px-3 py-1 rounded-lg ${formData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>Aktif</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="status" value="inactive"
                        checked={formData.status === 'inactive'}
                        onChange={() => setFormData({ ...formData, status: 'inactive' })}
                        className="w-4 h-4 text-primary focus:ring-primary" />
                      <span className={`text-sm font-bold px-3 py-1 rounded-lg ${formData.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-500'}`}>Nonaktif</span>
                    </label>
                    <p className="text-[10px] text-slate-400 pt-2 leading-relaxed">Akun nonaktif tidak dapat log masuk ke CMS.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
