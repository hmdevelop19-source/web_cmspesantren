import { useState, useEffect } from 'react';
import { 
  Target, Compass, Save, Loader2, CheckCircle2, 
  AlertCircle, History, Layout, Image as ImageIcon,
  X, Plus
} from 'lucide-react';
import api from '../../lib/api';
import RichTextEditor from '../../components/admin/RichTextEditor';
import MediaSelector from '../../components/admin/MediaSelector';

type ProfileSection = 'sejarah' | 'visi-misi' | 'misi-strategis';

interface SectionData {
  id?: number;
  title: string;
  content: string;
  status: 'published' | 'draft';
  slug: string;
  image_url?: string;
  image_id?: number | null;
}

export default function ProfileInstitusi() {
  const [activeTab, setActiveTab] = useState<ProfileSection>('sejarah');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Preview for Media Library selection
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [data, setData] = useState<{ [key in ProfileSection]: SectionData }>({
    sejarah: { title: 'Sejarah Singkat', content: '', status: 'published', slug: 'sejarah', image_id: null },
    'visi-misi': { title: 'Visi & Misi', content: '', status: 'published', slug: 'visi-misi' },
    'misi-strategis': { title: 'Misi Strategis', content: '', status: 'published', slug: 'misi-strategis' }
  });

  useEffect(() => {
    const fetchAllSections = async () => {
      setIsLoading(true);
      try {
        const slugs: ProfileSection[] = ['sejarah', 'visi-misi', 'misi-strategis'];
        const results = await Promise.all(
          slugs.map(slug => api.get(`/pages/slug/${slug}`).catch(() => ({ data: null })))
        );

        setData(prev => {
          const newData = { ...prev };
          results.forEach((res, index) => {
            if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
              const sectionKey = slugs[index];
              const sectionData = res.data;
              
              newData[sectionKey] = {
                ...newData[sectionKey],
                ...sectionData
              };

              // Handle image from relation if available
              if (sectionData.imageRelation) {
                newData[sectionKey].image_url = `http://localhost:8000${sectionData.imageRelation.file_path}`;
                newData[sectionKey].image_id = sectionData.imageRelation.id;
              } else if (sectionData.image_obj) {
                 newData[sectionKey].image_url = `http://localhost:8000${sectionData.image_obj.file_path}`;
                 newData[sectionKey].image_id = sectionData.image_obj.id;
              }

              // Set initial preview if it's the active tab
              if (sectionKey === activeTab) {
                setImagePreview(newData[sectionKey].image_url || null);
              }
            }
          });
          return newData;
        });
      } catch (error) {
        console.error('Error fetching profile sections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllSections();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    const currentData = data[activeTab];

    // Ensure slugs are correct
    const expectedSlugs: Record<ProfileSection, string> = {
      'sejarah': 'sejarah',
      'visi-misi': 'visi-misi',
      'misi-strategis': 'misi-strategis'
    };
    const slug = expectedSlugs[activeTab];

    try {
      let response;
      const payload = {
        title: currentData.title,
        content: currentData.content,
        status: currentData.status,
        slug: slug,
        image_id: currentData.image_id
      };

      if (currentData.id) {
        response = await api.put(`/pages/${currentData.id}`, payload);
      } else {
        response = await api.post('/pages', payload);
      }
      
      const updatedItem = response.data.data;
      
      // Sync back image data
      if (updatedItem.imageRelation) {
        updatedItem.image_url = `http://localhost:8000${updatedItem.imageRelation.file_path}`;
        updatedItem.image_id = updatedItem.imageRelation.id;
      }

      setData(prev => ({
        ...prev,
        [activeTab]: updatedItem
      }));
      
      setMessage({ type: 'success', text: `Konten ${activeTab.replace('-', ' ')} berhasil disimpan.` });
    } catch (error: any) {
      console.error('Save error details:', error.response?.data);
      const errors = error.response?.data?.errors;
      let errorMsg = error.response?.data?.message || 'Gagal menyimpan konten. Silakan coba lagi.';
      
      if (errors) {
        const details = Object.values(errors).flat().join(', ');
        errorMsg = `${error.response.data.message}: ${details}`;
      }
      
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const clearImage = () => {
    handleInputChange('image_id', null);
    handleInputChange('image_url', '');
    setImagePreview(null);
  };

  // Handle switching tabs - update preview
  useEffect(() => {
    setImagePreview(data[activeTab].image_url || null);
  }, [activeTab]);

  const handleInputChange = (field: keyof SectionData, value: any) => {
    setData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value
      }
    }));
  };

  const onMediaSelect = (media: any) => {
    const fullUrl = `http://localhost:8000${media.file_path}`;
    setImagePreview(fullUrl);
    handleInputChange('image_id', media.id);
    handleInputChange('image_url', fullUrl);
    setIsMediaSelectorOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Memuat Profil Lembaga...</p>
      </div>
    );
  }

  const tabs: { id: ProfileSection; label: string; icon: any }[] = [
    { id: 'sejarah', label: 'Sejarah', icon: History },
    { id: 'visi-misi', label: 'Visi & Misi', icon: Target },
    { id: 'misi-strategis', label: 'Misi Strategis', icon: Compass }
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal text-gray-800 tracking-tight flex items-center gap-3">
             <Layout className="w-6 h-6 text-primary" />
             Edit Profil Lembaga
          </h1>
          <p className="text-sm text-gray-500 mt-1 italic">Kelola narasi utama yang muncul pada halaman profil publik.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-secondary px-6 py-2.5 rounded font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Bagian Ini
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Tab Header */}
      <div className="flex border-b border-gray-200 mb-8 bg-white/50 backdrop-blur-sm sticky top-0 z-10 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMessage(null); }}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative whitespace-nowrap
              ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-secondary' : 'text-gray-300'}`} />
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        
        {/* Editor Main Section */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
            <div className="p-6 border-b border-gray-100">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 text-left">Judul Bagian</label>
               <input 
                  type="text"
                  value={data[activeTab]?.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full text-xl font-bold text-gray-900 border-none focus:ring-0 px-0 placeholder-gray-200"
                  placeholder="Masukkan judul..."
               />
            </div>
            <div className="p-6">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 text-left">Konten Narasi</label>
               <RichTextEditor 
                  key={activeTab}
                  content={data[activeTab]?.content || ''}
                  onChange={(newContent) => handleInputChange('content', newContent)}
               />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6 text-left">
           <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden text-left">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 text-left">
                 <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-widest text-left font-serif">Pengaturan Publikasi</h3>
              </div>
              <div className="p-4 space-y-4">
                 <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left block">Status Terbit</label>
                    <select 
                      value={data[activeTab].status}
                      onChange={(e) => handleInputChange('status', e.target.value as any)}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-xs font-bold text-gray-700 bg-white cursor-pointer"
                    >
                       <option value="published">DITERBITKAN</option>
                       <option value="draft">DRAF / SEMBUNYIKAN</option>
                    </select>
                 </div>
                 <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left block">Slug (URL)</label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono text-gray-500">
                       /profil &#8594; #{activeTab}
                    </div>
                 </div>
              </div>
              <div className="bg-gray-50/80 px-4 py-3 border-t border-gray-100 text-center">
                 <p className="text-[10px] text-gray-400 italic">Terakhir diubah: {data[activeTab].id ? 'Oleh Admin' : 'Belum pernah disimpan'}</p>
              </div>
           </div>

            {/* Featured Image Sidebar (Specific to Sejarah) */}
            {activeTab === 'sejarah' && (
              <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden text-left">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between text-left">
                  <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2 text-left font-serif">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Foto Utama Sejarah
                  </h3>
                  {imagePreview && (
                    <button onClick={clearImage} className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1 hover:text-red-700 transition-colors">
                      <X className="w-3 h-3" /> Hapus
                    </button>
                  )}
                </div>
                <div className="p-4 text-left">
                  <div className="relative aspect-[4/5] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden group">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <button 
                             onClick={() => setIsMediaSelectorOpen(true)}
                             className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 hover:bg-white/40 transition-all"
                           >
                             Ganti Foto
                           </button>
                        </div>
                      </>
                    ) : (
                      <button 
                         onClick={() => setIsMediaSelectorOpen(true)}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 active:scale-95 transition-all"
                      >
                        <Plus className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pilih Dari Media</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 mt-3 italic leading-relaxed text-left opacity-70">
                    * Pilih foto dari Media Library untuk ditampilkan di profil sejarah pesantren.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-primary-dark rounded-2xl p-6 text-white shadow-xl shadow-primary/10 text-left">
               <div className="w-10 h-10 bg-secondary rounded-lg mb-4 flex items-center justify-center text-left">
                  <Compass className="w-6 h-6 text-primary-dark" />
               </div>
               <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-secondary text-left font-serif">Instruksi Profil</h4>
               <p className="text-[11px] text-gray-300 leading-relaxed font-medium text-left">
                  Pastikan narasi yang ditulis mencerminkan nilai-nilai heritage pesantren. Gunakan bahasa yang formal namun tetap mengalir.
               </p>
            </div>
          </div>

      </div>

      <MediaSelector 
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={onMediaSelect}
      />
    </div>
  );
}
