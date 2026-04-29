import { Calendar, User, Share2, BookOpen, Clock, Play } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { getImageUrl } from '../../lib/utils';
import SEO from '../../components/SEO';
import Skeleton from '../../components/ui/Skeleton';
import type { Post, PaginatedResponse } from '../../types';

export default function BeritaDetail() {
  const { slug } = useParams();

  const { data: post, isLoading: isPostLoading, isError, refetch } = useQuery<Post>({
    queryKey: ['public-post', slug],
    queryFn: async () => {
      const response = await api.get(`/public/posts/${slug}`);
      return response.data;
    },
    retry: 1,
  });

  const { data: relatedPostsData } = useQuery<PaginatedResponse<Post>>({
    queryKey: ['related-posts', post?.id],
    queryFn: async () => {
      const response = await api.get('/public/posts', { params: { limit: 4 } });
      return response.data;
    },
    enabled: !!post?.id,
  });

  const { data: homeData } = useQuery<any>({
    queryKey: ['home-data-sidebar'],
    queryFn: async () => {
      const response = await api.get('/public/home');
      return response.data;
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const isLoading = isPostLoading;
  const relatedPosts = (relatedPostsData?.data || [])
    .filter((p) => p.id !== post?.id)
    .slice(0, 3);

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto py-40 px-4 text-center">
          <div className="bg-red-50 text-red-500 p-12 rounded-[40px] border border-red-100 max-w-2xl mx-auto shadow-2xl shadow-red-50">
             <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Gagal Menghubungkan</h1>
             <p className="text-red-500/70 font-bold mb-10 italic leading-relaxed">Maaf, kami tidak dapat memuat konten berita saat ini. Pastikan koneksi internet Anda stabil atau coba beberapa saat lagi.</p>
             <div className="flex justify-center gap-4">
                <button onClick={() => refetch()} className="bg-red-500 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95">Klik Muat Ulang</button>
                <Link to="/publikasi" className="bg-white border border-red-200 text-red-500 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95">HALAMAN PUBLIKASI</Link>
             </div>
          </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 bg-white">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-2/3 space-y-8">
            <Skeleton width="150px" height="24px" className="rounded-lg" />
            <Skeleton height="400px" className="rounded-3xl w-full" />
            <div className="space-y-4">
              <Skeleton height="32px" width="80%" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" width="60%" />
            </div>
          </div>
          <div className="lg:w-1/3 space-y-8">
            <Skeleton height="300px" className="rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
      return (
          <div className="max-w-7xl mx-auto py-40 px-4 text-center">
              <h1 className="text-4xl font-black text-gray-200 uppercase tracking-tighter mb-4">404 NOT FOUND</h1>
              <p className="text-gray-500 font-bold mb-8">Berita yang Anda cari tidak ditemukan atau telah dihapus.</p>
              <Link to="/publikasi" className="bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest shadow-xl">Kembali ke Publikasi</Link>
          </div>
      );
  }

  const articleSchema = post ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "image": [post.cover_image ? getImageUrl(post.cover_image) : ""],
    "datePublished": post.created_at,
    "dateModified": post.updated_at,
    "author": [{
        "@type": "Person",
        "name": post.user?.name || "Redaksi",
        "url": window.location.origin
      }]
  } : undefined;

  const finalCoverImage = post.cover_image_obj 
    ? getImageUrl(post.cover_image_obj.file_path)
    : (post.cover_image ? getImageUrl(post.cover_image) : null);

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title={post.title}
        description={post.excerpt || post.content?.replace(/<[^>]+>/g, '').slice(0, 160)}
        image={finalCoverImage || undefined}
        type="article"
        structuredData={articleSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Main Content */}
          <article className="lg:w-2/3">
            <Breadcrumbs items={[
                { label: 'Publikasi', path: '/publikasi' },
                { label: post?.title || 'Detail Berita' }
            ]} />
            
            <div className="mb-12 mt-8">
               <div className="flex items-center gap-3 mb-8">
                <span className="bg-secondary text-black text-[10px] font-black px-4 py-1.5 rounded-lg shadow-lg shadow-secondary/20 uppercase tracking-widest">
                    {post.category?.name || 'Warta'}
                </span>
                <div className="h-px bg-gray-100 flex-1"></div>
               </div>

               {finalCoverImage && (
                   <div className="w-full aspect-[16/9] bg-gray-50 rounded-3xl mb-12 overflow-hidden relative shadow-2xl shadow-black/5 ring-1 ring-gray-100">
                      <img src={finalCoverImage} alt={post.title} loading="lazy" className="w-full h-full object-cover" />
                   </div>
               )}

               <div className="flex flex-wrap items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary/60" /> {new Date(post.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-secondary/60" /> {post.user?.name || 'Redaksi'}</div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary/60" /> 5 Menit Baca</div>
               </div>
               
               <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-[1.3] mb-12 tracking-tighter uppercase italic">
                 {post.title}
               </h1>

               <div className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed font-medium">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} className="rich-text-content" />
               </div>

               {/* Share Button */}
               <div className="mt-20 p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-secondary shadow-lg">
                        <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-black text-gray-900 block text-sm uppercase tracking-tighter">Bagikan Artikel</span>
                        <span className="text-xs text-gray-400 font-medium italic">Sebarkan manfaat seluas-luasnya</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Tautan disalin!'); }}
                    className="flex items-center gap-2 px-8 py-3 bg-white hover:bg-primary hover:text-white border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                  >
                     Salin Tautan
                  </button>
               </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
             <div className="sticky top-32 space-y-12">
                <div className="bg-white rounded-3xl p-10 shadow-2xl shadow-black/5 border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-8 border-l-8 border-secondary pl-4 text-sm uppercase tracking-widest">Eksplorasi Lainnya</h3>
                    
                    <div className="space-y-8">
                    {relatedPosts.map((item) => (
                        <Link to={`/berita/${item.slug}`} key={item.id} className="flex gap-5 group items-start">
                             <div className="w-20 h-20 shrink-0 bg-gray-50 rounded-2xl overflow-hidden group-hover:shadow-xl transition-all border border-gray-100 relative">
                                {item.cover_image ? (
                                    <img src={getImageUrl(item.cover_image)} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-primary/10"><BookOpen className="w-8 h-8" /></div>
                                )}
                             </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-3">
                                    {item.title}
                                </h4>
                                <span className="text-[10px] font-black text-gray-300 mt-2 block flex items-center gap-2 uppercase tracking-widest">
                                    <Calendar className="w-3 h-3 text-secondary/50" /> {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                        </Link>
                    ))}
                    </div>
                    
                    <Link to="/publikasi" className="mt-12 w-full flex items-center justify-center py-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-gray-400">
                        LIHAT SEMUA BERITA &rarr;
                    </Link>
                </div>

                {/* Sinema Pesantren Section */}
                <div className="bg-primary-dark rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/40 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl"></div>
                    <h4 className="text-lg font-black tracking-tighter mb-6 leading-tight relative z-10 uppercase italic">Sinema <span className="text-secondary">Pesantren</span></h4>
                    
                    <div className="relative z-10">
                        <div className="aspect-video bg-gray-900 rounded-2xl mb-6 relative flex items-center justify-center overflow-hidden border border-white/10 shadow-inner group/vid">
                            {homeData?.featured_video ? (
                                <>
                                    <img 
                                        src={`https://img.youtube.com/vi/${(homeData.featured_video.youtube_url || homeData.featured_video.video_url || '').split('v=')[1]?.split('&')[0] || ''}/maxresdefault.jpg`} 
                                        alt="Video cover" 
                                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover/vid:opacity-70 group-hover/vid:scale-110 transition-all duration-700" 
                                    />
                                    <a href={homeData.featured_video.youtube_url || homeData.featured_video.video_url} target="_blank" rel="noreferrer" className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center z-10 text-primary shadow-2xl hover:scale-110 active:scale-95 transition-all outline outline-8 outline-secondary/10">
                                        <Play className="w-6 h-6 ml-1 fill-primary" />
                                    </a>
                                </>
                            ) : (
                                <div className="text-white/20"><Play className="w-10 h-10" /></div>
                            )}
                        </div>
                        <h5 className="font-bold text-sm mb-2 leading-tight uppercase italic line-clamp-1">{homeData?.featured_video?.title || 'Dokumentasi Video'}</h5>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic line-clamp-2">{homeData?.featured_video?.description || 'Tonton cuplikan kegiatan eksklusif kami.'}</p>
                    </div>
                </div>
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
