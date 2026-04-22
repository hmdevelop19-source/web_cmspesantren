import { useState } from 'react';
import { User, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.put('/profile', formData);
      setMessage({ type: 'success', text: response.data.message });
      setUser(response.data.user);
      setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Gagal memperbarui profil. Pastikan data valid.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Pengaturan Profil</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-secondary text-3xl font-black shadow-lg shadow-primary/20 ring-4 ring-white">
                 {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                 <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                 <p className="text-sm text-gray-500 flex items-center gap-2 mt-1 italic uppercase font-bold tracking-widest text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                    Peran: <span className="text-primary">{user?.role}</span>
                 </p>
              </div>
           </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {message && (
              <div className={`md:col-span-2 p-4 rounded-lg flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">Informasi Dasar</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest">Nama Lengkap</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="Masukkan nama lengkap..."
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest">Alamat Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="email@contoh.com"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">Keamanan Akun</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest">Password Baru</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="Kosongkan jika tidak ingin ganti"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest">Konfirmasi Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="Ulangi password baru"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-6 flex justify-end">
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary text-secondary px-8 py-3 rounded font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
