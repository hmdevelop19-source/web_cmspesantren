import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, MessageSquare, Camera, Play, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import { useSettingsStore } from '../../store/settingsStore';

export default function Kontak() {
  const { settings } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: 'Informasi Pendaftaran', message: '' });
  const siteName = settings?.site_name || 'Portal Pesantren';

  useSeoMeta({
    title: `Hubungi Kami — ${siteName}`,
    description: `Punya pertanyaan atau ingin konsultasi pendaftaran? Hubungi tim ${siteName} secara langsung.`,
    type: 'website',
    siteName,
    keywords: `kontak pesantren, hubungi kami, pendaftaran, ${siteName}`,
  });

  useEffect(() => {
    setIsLoading(false);
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.post('/public/contact', form);
      setIsSuccess(true);
      setForm({ name: '', email: '', subject: 'Informasi Pendaftaran', message: '' });
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors).flat()[0] as string;
        setErrorMsg(firstError);
      } else {
        setErrorMsg('Gagal mengirim pesan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Menyambungkan Server...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-primary pt-28 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
            <div className="inline-block bg-secondary/20 border border-secondary/30 text-secondary px-6 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] mb-6">
                Hubungi Kami
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase italic">Silaturahmi Online</h1>
            <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed italic">
                Punya pertanyaan atau ingin berkonsultasi mengenai pendaftaran? Tim kami siap melayani Anda dengan sepenuh hati.
            </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Kontak Kami' }]} />
        <div className="flex flex-col lg:flex-row gap-20 mt-10">
          
          {/* Contact Information */}
          <div className="lg:w-1/3">
             <div className="sticky top-32 space-y-12">
                <div className="border-l-8 border-secondary pl-6">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Informasi Institusi</h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2 px-1 bg-gray-50 inline-block">Official Connect</p>
                </div>

                <div className="space-y-8">
                    <div className="flex gap-6 group">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <MapPin className="w-6 h-6 text-primary group-hover:text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-1">Alamat Kampus</h3>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium italic">
                                {settings?.site_address || 'Jl. PP. Miftahul Ulum Bettet Pamekasan, Jawa Timur'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 group">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <Phone className="w-6 h-6 text-primary group-hover:text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-1">Telepon / WA</h3>
                            <p className="text-sm font-bold text-gray-700 tracking-wider">
                                {settings?.contact_phone || '081234567890'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 group">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <Mail className="w-6 h-6 text-primary group-hover:text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-1">Email Resmi</h3>
                            <p className="text-sm font-bold text-gray-700">
                                {settings?.contact_email || 'info@lembaga.ac.id'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Social Media Links */}
                <div className="pt-10 border-t border-gray-100">
                    <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-6">Media Sosial Kami</h3>
                    <div className="flex gap-4">
                        {settings?.instagram_url && (
                          <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-50 hover:bg-secondary hover:text-black rounded-xl flex items-center justify-center transition-all border border-gray-100" title="Instagram">
                            <Camera className="w-5 h-5" />
                          </a>
                        )}
                        {settings?.facebook_url && (
                          <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-50 hover:bg-secondary hover:text-black rounded-xl flex items-center justify-center transition-all border border-gray-100" title="Facebook">
                            <Mail className="w-5 h-5" />
                          </a>
                        )}
                        {settings?.youtube_url && (
                          <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-50 hover:bg-secondary hover:text-black rounded-xl flex items-center justify-center transition-all border border-gray-100" title="YouTube">
                            <Play className="w-5 h-5" />
                          </a>
                        )}
                        {settings?.twitter_url && (
                          <a href={settings.twitter_url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-50 hover:bg-secondary hover:text-black rounded-xl flex items-center justify-center transition-all border border-gray-100" title="Twitter">
                            <Send className="w-5 h-5" />
                          </a>
                        )}
                    </div>
                </div>
             </div>
          </div>

          {/* Contact Form Wrapper */}
          <div className="lg:w-2/3">
             <div className="bg-white p-6 md:p-12 rounded-[40px] shadow-2xl shadow-black/5 border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                
                <div className="mb-12 relative z-10 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-3">
                        <MessageSquare className="w-4 h-4 text-secondary" /> Direct Message
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Kirim Pesan Cepat</h2>
                    <p className="text-gray-400 text-sm font-medium mt-2 max-w-sm lg:max-w-none italic">Pertanyaan Anda akan kami jawab maksimal dalam 24 jam kerja.</p>
                </div>
                
                {isSuccess ? (
                  <div className="py-20 flex flex-col items-center text-center space-y-6 animate-fade-in">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-100">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase italic">Pesan Terkirim!</h3>
                    <p className="text-gray-500 font-medium max-w-sm">Jazakumullah khairan. Pesan Anda telah masuk ke sistem kami dan akan segera ditindaklanjuti oleh tim admin.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {/* Error Banner */}
                    {errorMsg && (
                      <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-bold">{errorMsg}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Nama Lengkap</label>
                           <input 
                             required
                             type="text"
                             name="name"
                             value={form.name}
                             onChange={handleChange}
                             className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-inner" 
                             placeholder="Contoh: Ahmad Fauzi" 
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Email Aktif</label>
                           <input 
                             required
                             type="email"
                             name="email"
                             value={form.email}
                             onChange={handleChange}
                             className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-inner" 
                             placeholder="nama@email.com" 
                           />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Perihal Pesan</label>
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                            <option>Informasi Pendaftaran</option>
                            <option>Kemitraan & Donasi</option>
                            <option>Keluhan & Saran</option>
                            <option>Kerja Sama Media</option>
                        </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Isi Pesan / Pertanyaan</label>
                       <textarea 
                         required
                         name="message"
                         value={form.message}
                         onChange={handleChange}
                         rows={5} 
                         className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-inner resize-none" 
                         placeholder="Tuliskan pesan Anda secara lengkap di sini..."
                       ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-primary text-secondary font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.3em] hover:bg-primary-dark hover:scale-[1.02] shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {isSubmitting ? 'Mengirim Data...' : 'Kirim Sekarang'}
                    </button>
                  </form>
                )}
             </div>
          </div>

        </div>
      </div>
      
      {/* Map Placeholder (Visual Polish) */}
      <section className="bg-gray-50 py-1 pt-0">
          <div className="max-w-7xl mx-auto px-4 h-96 bg-gray-200 rounded-[50px] shadow-inner mb-20 flex items-center justify-center group overflow-hidden relative">
             <div className="absolute inset-0 bg-[#000052]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex flex-col items-center gap-4 group-hover:scale-110 transition-transform duration-700">
                <MapPin className="w-16 h-16 text-primary opacity-20" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Peta Interaktif Segera Hadir</span>
             </div>
          </div>
      </section>
    </div>
  );
}
