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
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan Profil</h1>
          <p className="text-sm text-slate-500 mt-1">Perbarui informasi pribadi dan amankan akun Anda secara berkala</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        {/* Profile Header Block */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
           <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-primary/10 border-4 border-white">
                 {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                 <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
                 <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full border border-primary/10">
                       {user?.role}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{user?.email}</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {message && (
              <div className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-semibold">{message.text}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-100">
                   <h3 className="text-sm font-bold text-slate-800">Informasi Pribadi</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Lengkap</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      placeholder="Masukkan nama lengkap..."
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Alamat Email</label>
                  <div className="relative group">
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      placeholder="email@lembaga.ac.id"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-100">
                   <h3 className="text-sm font-bold text-slate-800">Ubah Kata Sandi</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password Baru</label>
                  <div className="relative group">
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      placeholder="Kosongkan jika tidak diubah"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Konfirmasi Password</label>
                  <div className="relative group">
                    <input 
                      type="password" 
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      placeholder="Masukkan ulang password baru"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2 px-10 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isLoading ? 'Menyimpan...' : 'Perbarui Profil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
