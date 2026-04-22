import { Calendar, User, ChevronRight, Share2, Quote } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function ArtikelDetail() {
  useParams();
  
  return (
    <div className="bg-white min-h-screen">
      {/* Muted Header specific to Articles */}
      <div className="bg-light-surface border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-sm text-gray-500">
           <Link to="/" className="hover:text-secondary">Beranda</Link>
           <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
           <span className="text-gray-900 font-medium">Artikel & Kajian</span>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Article Headline */}
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-8 font-serif">
             Pentingnya Menjaga Adab Sebelum Menuntut Ilmu
           </h1>
           
           <div className="flex items-center justify-center gap-4 bg-light-surface p-4 rounded-xl border border-gray-100 inline-flex">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900">Ust. Abdul Kholiq</h4>
                <p className="text-sm text-primary-light font-medium">Pengasuh Kitab Kuning</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> 30 April 2026</p>
              </div>
           </div>
        </div>

        {/* Big Quote / Highlight */}
        <div className="relative mb-12">
            <Quote className="absolute -left-6 -top-6 w-16 h-16 text-secondary opacity-30" />
            <blockquote className="text-2xl font-bold text-primary italic leading-relaxed border-l-4 border-secondary pl-6">
                "Barangsiapa mempelajari ilmu tanpa memulainya dengan mempelajari adab, maka ia telah mengundang kebinasaan untuk dirinya sendiri."
            </blockquote>
        </div>

        {/* Content Body */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-loose">
            <p className="mb-6">
                Dalam tradisi keilmuan Islam, posisi adab menempati urutan paling krusial sebelum masuk kepada substansi ilmu itu sendiri. 
                Para salafus shalih menghabiskan puluhan tahun khusus sekadar untuk mengasah adab mereka kepada para guru, kitab, dan majelis ilmu. 
                Hal ini menunjukkan betapa adab menjadi sebuah gerbang utama.
            </p>
            <p className="mb-6">
                Kehadiran teknologi dan arus informasi bebas di abad modern ini memang mempermudah akses membaca ribuan literatur keislaman, 
                namun di masa yang sama terkadang menumpulkan kepekaan terhadap rasa menghormati (ta'dhim) terhadap sumber ilmu tersebut.
            </p>
            <br />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Adab Adalah Ruh Pembelajaran</h3>
            <p className="mb-6">
                Menghargai guru tidak sebatas mengangguk saat bertemu, tetapi menyangkut kerendahan hati saat dikoreksi dan kesabaran saat diberikan hal yang tidak disukai. 
                Semoga kita semua senantiasa dianugerahi ketawadhuan sejalan dengan penambahan sanad keilmuan kita.
            </p>
        </div>

        {/* Share & Divider */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link to="/" className="text-sm font-bold text-primary hover:text-primary-light flex items-center gap-2">
                &larr; Kembali ke Beranda
            </Link>
            
            <button className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white hover:bg-primary rounded-full text-sm font-medium transition-colors">
                <Share2 className="w-4 h-4" /> Bagikan Artikel
            </button>
        </div>
      </article>

    </div>
  );
}
