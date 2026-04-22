import { useState } from 'react';
import { Eye, EyeOff, Lock, User, Quote, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/login', { email, password });
      const { access_token, user } = response.data;
      
      setAuth(user, access_token);
      navigate('/admin');
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans bg-white">
      
      {/* Left Area - Branding & Welcome (Hide on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-dark overflow-hidden flex-col justify-between p-16">
         {/* Background Image & Overlay */}
         <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-multiply"></div>
         <img 
            src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=1000" 
            alt="Pesantren" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-1000"
         />
         
         {/* Top Logo */}
         <div className="relative z-20 flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center shadow-lg">
               <span className="text-black font-black text-sm">UIM</span>
            </div>
            <span className="text-white font-bold tracking-widest uppercase text-sm">CMS Pesantren</span>
         </div>

         {/* Bottom Hero Text */}
         <div className="relative z-20 max-w-lg">
            <Quote className="w-12 h-12 text-secondary mb-6 opacity-80" />
            <h1 className="text-4xl text-white font-bold leading-tight mb-4">
               Arsitektur Informasi Digital yang Terintegrasi.
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
               Kelola konten berita, pendaftaran sivitas, dan pustaka dokumen lembaga dalam satu pintu dengan mudah dan aman.
            </p>
         </div>
      </div>

      {/* Right Area - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-24 bg-white relative">
         
         {/* Mobile Only Header inside the Right Area */}
         <Link to="/" className="absolute top-6 left-6 text-sm font-semibold text-gray-500 hover:text-primary lg:hidden flex items-center gap-2">
            &larr; Beranda
         </Link>

         <div className="w-full max-w-sm">
            <div className="mb-10 text-center lg:text-left">
               <h2 className="text-3xl font-bold text-gray-900 mb-2">Masuk ke Dasbor</h2>
               <p className="text-gray-500 text-sm">Masukkan kredensial yang diberikan oleh administrator.</p>
            </div>

             <form className="space-y-6" onSubmit={handleLogin}>
               
               {error && (
                 <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                   {error}
                 </div>
               )}

               {/* Input Group: Username */}
               <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                     Alamat Email
                  </label>
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                     </div>
                     <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@pesantren.ac.id"
                        className="appearance-none block w-full pl-10 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-0 focus:border-primary transition-colors sm:text-sm"
                     />
                  </div>
               </div>

               {/* Input Group: Password */}
               <div className="space-y-1">
                  <div className="flex items-center justify-between">
                     <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                        Kata Sandi
                     </label>
                     <a href="#" className="font-bold text-xs text-primary hover:text-primary-light transition-colors">
                        Lupa Sandi?
                     </a>
                  </div>
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                     </div>
                     <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="appearance-none block w-full pl-10 pr-12 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-0 focus:border-primary transition-colors sm:text-sm"
                     />
                     <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                     >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                  </div>
               </div>

               {/* Remember Me */}
               <div className="flex items-center">
                  <input
                     id="remember-me"
                     name="remember-me"
                     type="checkbox"
                     className="h-4 w-4 bg-gray-100 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-600">
                     Ingat sesi saya
                  </label>
               </div>

               {/* Submit Button */}
               <div>
                  <button
                     type="submit"
                     disabled={isLoading}
                     className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-gray-900 bg-secondary hover:bg-yellow-400 focus:outline-none shadow-md shadow-secondary/30 hover:shadow-lg hover:shadow-secondary/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                     {isLoading ? (
                       <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
                     ) : (
                       "Log Masuk \u2192"
                     )}
                  </button>
               </div>
            </form>

            {/* Desktop Only Back Button below the form */}
            <div className="mt-8 text-center lg:text-left hidden lg:block">
                <Link to="/" className="text-gray-400 text-sm font-medium hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5">
                   &larr; Kembali ke Situs Utama
                </Link>
            </div>
         </div>
      </div>
      
    </div>
  );
}
