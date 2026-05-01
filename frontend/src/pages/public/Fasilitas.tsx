import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Building2, ArrowRight } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import SEO from '../../components/SEO';
import * as LucideIcons from 'lucide-react';

interface Facility {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  icon: string | null;
}

export default function Fasilitas() {
  const { data: facilities = [], isLoading } = useQuery<Facility[]>({
    queryKey: ['public-facilities'],
    queryFn: async () => {
      const response = await api.get('/public/facilities');
      return response.data;
    }
  });

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <Building2 className="w-6 h-6" />;
    // @ts-ignore
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : <Building2 className="w-6 h-6" />;
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title="Fasilitas Pesantren"
        description="Jelajahi berbagai sarana dan prasarana modern yang mendukung proses belajar mengajar dan kenyamanan santri di pesantren kami."
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-primary-dark">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-80 -mt-80"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            Sarana Prasarana
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase italic animate-in fade-in slide-in-from-bottom-4 duration-700">
            Fasilitas <span className="text-secondary">Terbaik</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Kami menyediakan lingkungan belajar yang aman, nyaman, dan modern untuk melahirkan generasi rabbani yang unggul.
          </p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton variant="rectangular" height={240} className="rounded-[2.5rem]" />
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="90%" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {facilities.map((facility, idx) => (
              <div 
                key={facility.id}
                className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Image Area */}
                <div className="relative h-64 overflow-hidden">
                  {facility.image_url ? (
                    <img 
                      src={facility.image_url} 
                      alt={facility.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                      <Building2 className="w-20 h-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Icon Badge */}
                  <div className="absolute bottom-6 left-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl group-hover:scale-110 transition-transform duration-500">
                    {getIcon(facility.icon)}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-3 uppercase italic tracking-tight group-hover:text-primary transition-colors">
                    {facility.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                    {facility.description}
                  </p>
                  
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Premium Facility</span>
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      Detail <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && facilities.length === 0 && (
          <div className="py-20 text-center">
            <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 font-bold uppercase tracking-widest">Belum ada data fasilitas</p>
          </div>
        )}
      </section>

      {/* Decorative Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-8 uppercase italic tracking-tighter">
               Lingkungan Belajar <span className="text-primary underline decoration-secondary decoration-4 underline-offset-8">Ideal</span>
            </h2>
            <p className="text-slate-500 font-medium leading-loose">
               Setiap sudut pesantren dirancang untuk memicu kreativitas, ketenangan dalam beribadah, dan fokus dalam menuntut ilmu. Kami terus melakukan pembaruan sarana prasarana untuk menyesuaikan dengan kebutuhan pendidikan di era digital tanpa meninggalkan akar nilai-nilai kepesantrenan.
            </p>
         </div>
         <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -ml-32"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -mr-48"></div>
      </section>
    </div>
  );
}
