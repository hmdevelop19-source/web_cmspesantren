import { useState } from 'react';
import { UserPlus, ArrowLeft, Shield, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function UsersCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/admin/users');
    }, 1500);
  };

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

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Data berhasil disimpan! Mengalihkan...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Informasi Pribadi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Nama Lengkap</label>
                <input 
                  type="text" 
                  defaultValue={isEdit ? "Ust. Ahmad Fauzi" : ""}
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
                    defaultValue={isEdit ? "ahmad.fauzi@pesantren.ac.id" : ""}
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
                  required={!isEdit}
                  placeholder="••••••••" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" 
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 italic">Gunakan minimal 8 karakter dengan kombinasi angka dan simbol.</p>
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
                  {['Administrator', 'Editor', 'Penulis'].map((role) => (
                    <label key={role} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                      <input 
                        type="radio" 
                        name="role" 
                        value={role} 
                        defaultChecked={isEdit ? role === 'Editor' : role === 'Penulis'}
                        className="w-4 h-4 text-primary focus:ring-primary" 
                      />
                      <div>
                        <span className="text-sm font-bold text-gray-800 block">{role}</span>
                        <span className="text-[10px] text-gray-500 block">
                          {role === 'Administrator' ? 'Akses penuh ke seluruh sistem.' : 
                           role === 'Editor' ? 'Dapat mengelola konten milik sendiri & orang lain.' : 
                           'Dapat menulis dan mengelola konten milik sendiri.'}
                        </span>
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
                      <input type="radio" name="status" value="aktif" defaultChecked className="w-4 h-4 text-primary focus:ring-primary" />
                      <span className="text-sm font-medium text-gray-900 px-3 py-1 bg-green-100 text-green-700 rounded-lg">Aktif</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="status" value="nonaktif" className="w-4 h-4 text-primary focus:ring-primary" />
                      <span className="text-sm font-medium text-gray-500 px-3 py-1 bg-gray-200 rounded-lg">Nonaktif</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">Akun nonaktif tidak akan dapat melakukan log masuk ke CMS hingga status diaktifkan kembali.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info/Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sticky top-20">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Ringkasan Sesi</h3>
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
               <div className="flex justify-between text-xs text-gray-500">
                  <span>Dibuat Oleh</span>
                  <span className="font-bold text-gray-800">SuperAdmin</span>
               </div>
               <div className="flex justify-between text-xs text-gray-500">
                  <span>Tanggal</span>
                  <span className="font-bold text-gray-800">07 Apr 2026</span>
               </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mb-3"
            >
              <UserPlus className="w-4 h-4" /> {isEdit ? 'Simpan Perubahan' : 'Terbitkan Pengguna'}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate('/admin/users')}
              className="w-full bg-white text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 text-sm"
            >
              Batalkan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
