import { useState, useEffect } from 'react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import api from '../../lib/api';
import { getImageUrl } from '../../lib/utils';
import { useSettingsStore } from '../../store/settingsStore';
import Skeleton from '../../components/ui/Skeleton';

export default function PublicGaleri() {
  const [media, setMedia] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const settings = useSettingsStore(state => state.settings);
  const siteName = settings?.site_name || 'Portal Pesantren';

  const fetchGallery = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await api.get('/public/gallery');
      setMedia(response.data.data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    document.title = `Galeri Visual - ${siteName}`;
    window.scrollTo(0, 0);
  }, [siteName]);

  const categories = ['Semua', 'Kegiatan', 'Sarana', 'Prestasi', 'Acara', 'Lainnya'];
  
  const filteredMedia = activeCategory === 'Semua' 
    ? media 
    : media.filter(item => {
        if (activeCategory === 'Sarana') return item.category === 'Sarana';
        return item.category === activeCategory;
      });
      
  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % filteredMedia.length);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + filteredMedia.length) % filteredMedia.length);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <section className="bg-primary pt-8 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
            <div className="inline-block bg-secondary/20 border border-secondary/30 text-secondary px-6 py-2 rounded-full text-[10px] uppercase font-black tracking-[0.3em] mb-6">
                Galeri Visual
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase italic">Lensa Pesantren</h1>
            <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed italic">
                Cermin kegiatan dan kebersamaan santri dalam menimba ilmu dan menebar manfaat.
            </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <Breadcrumbs items={[{ label: 'Galeri Visual' }]} />
            
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === cat 
                      ? 'bg-secondary text-primary shadow-lg shadow-secondary/20 scale-105' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  {cat === 'Sarana' ? 'Sarana & Prasarana' : cat}
                </button>
              ))}
            </div>
          </div>

          {isError ? (
            <div className="py-24 text-center">
               <div className="bg-red-50 text-red-500 p-8 rounded-[40px] border border-red-100 max-w-xl mx-auto">
                  <h3 className="font-black uppercase tracking-tighter text-xl mb-2">Gagal Memuat Galeri</h3>
                  <p className="text-sm font-medium italic opacity-70 mb-6">Terjadi kendala saat menghimpun kenangan visual. Silakan coba lagi.</p>
                  <button 
                    onClick={() => fetchGallery()}
                    className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 active:scale-95"
                  >
                     Muat Ulang Galeri
                  </button>
               </div>
            </div>
          ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Skeleton key={i} height="300px" className="rounded-[40px]" />
             ))}
          </div>
        ) : filteredMedia.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 animate-fade-in">
             {filteredMedia.map((item, index) => (
                <div 
                  key={item.id} 
                  className="break-inside-avoid relative group rounded-[40px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 cursor-zoom-in"
                  onClick={() => setSelectedIndex(index)}
                >
                  <img 
                    src={getImageUrl(item.file_path)} 
                    alt={item.file_name || 'Galeri Pesantren'} 
                    loading="lazy"
                    className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" 
                  />
                  
                  {/* Overlay Info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent p-10 opacity-0 group-hover:opacity-100 translate-y-10 group-hover:translate-y-0 transition-all duration-500">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-px bg-secondary w-8"></div>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">{item.category || 'Dokumentasi'}</span>
                    </div>
                    <span className="text-white font-black text-xs md:text-sm tracking-tighter uppercase mb-1 block italic leading-tight">{item.file_name?.split('.')[0] || 'Tanpa Judul'}</span>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest italic">Klik untuk Memperbesar Lihat Detail &rarr;</p>
                  </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-6 group">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-gray-100 group-hover:border-primary transition-colors">
                <ImageIcon className="w-10 h-10 text-gray-200 group-hover:text-primary transition-colors" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-400">Album Masih Kosong</h3>
                <p className="text-sm text-gray-300 font-medium italic mt-1">Kami sedang mengunggah dokumentasi terbaik segera.</p>
             </div>
          </div>
        )}
      </div>
    </section>

      {/* Lightbox / Modal Improvements */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-xl flex items-center justify-center animate-fade-in select-none"
          onClick={() => setSelectedIndex(null)}
        >
           {/* Navigation Buttons Overlay */}
           <div className="absolute inset-0 flex items-center justify-between px-4 md:px-12 pointer-events-none">
              <button 
                onClick={handlePrev} 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-secondary hover:text-primary transition-all pointer-events-auto shadow-2xl backdrop-blur-md active:scale-90"
              >
                 <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              <button 
                onClick={handleNext} 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-secondary hover:text-primary transition-all pointer-events-auto shadow-2xl backdrop-blur-md active:scale-90"
              >
                 <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
           </div>

           <button 
             className="absolute top-8 right-8 text-white/50 hover:text-white transition-all z-20"
             onClick={() => setSelectedIndex(null)}
           >
              <X className="w-8 h-8 md:w-10 md:h-10" />
           </button>

           <div className="max-w-5xl max-h-[90vh] relative p-4" onClick={(e) => e.stopPropagation()}>
              <div className="relative group/img rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-center bg-black/20">
                 <img 
                   src={getImageUrl(filteredMedia[selectedIndex].file_path)} 
                   alt="Fullscreen" 
                   className="max-w-full max-h-[85vh] object-contain transition-transform duration-500" 
                 />
                 
                 {/* Bottom Detail Info */}
                 <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-10 text-white">
                    <span className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">{filteredMedia[selectedIndex].category || 'Dokumentasi'}</span>
                    <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">{filteredMedia[selectedIndex].file_name?.split('.')[0] || 'Media'}</h3>
                    <div className="flex items-center gap-4 mt-4">
                       <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{selectedIndex + 1} / {filteredMedia.length} Karya Visual</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
