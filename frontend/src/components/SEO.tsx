import { Helmet } from 'react-helmet-async';
import { useSettingsStore } from '../store/settingsStore';
import { getImageUrl } from '../lib/utils';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  structuredData
}: SEOProps) => {
  const { settings } = useSettingsStore();
  
  const siteName = settings?.site_name || 'CMS Pesantren';
  const defaultDescription = settings?.site_description || 'Portal Resmi Pesantren';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || defaultDescription;
  
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Favicon */}
      {settings?.site_favicon && (
        <link rel="icon" type="image/png" href={getImageUrl(settings.site_favicon)} />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
