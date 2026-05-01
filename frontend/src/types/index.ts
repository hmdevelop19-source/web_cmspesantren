/**
 * Core Type Definitions
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Media {
  id: number;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  alt_text?: string;
  created_at: string;
  updated_at: string;
  show_in_gallery?: boolean;
  category?: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  content: string;
  cover_image?: string;
  cover_image_id?: number;
  cover_image_obj?: Media;
  status: 'published' | 'draft';
  category_id?: number;
  category?: Category;
  user_id?: number;
  user?: User;
  excerpt?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  content: string;
  image_id?: number;
  image_obj?: Media;
  image?: string;
  image_url?: string;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface Agenda {
  id: number;
  title: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  content: string;
  location?: string;
  event_date: string;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  content: string;
  status: 'published' | 'draft';
  priority?: 'normal' | 'high';
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: number;
  title: string;
  video_url: string;
  youtube_url?: string;
  description?: string;
  is_active: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: number;
  title: string;
  slug: string;
  description?: string;
  image_id?: number;
  image_url?: string;
  icon?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


export interface Settings {
  site_name: string;
  site_tagline: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  site_logo: string;
  site_favicon?: string;
  site_address?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  stats_santri?: string;
  stats_asatidz?: string;
  stats_alumni?: string;
  stats_institusi?: string;
  site_description?: string;
  site_full_name?: string;
  header_right_text?: string;
  hide_top_bar?: string;
  sidebar_banner_label?: string;
  sidebar_banner_title?: string;
  sidebar_banner_image?: string;
}

export interface Banner {
  id: number;
  title?: string;
  subtitle?: string;
  image_path: string;
  link_url?: string;
  order: number;
  is_active: boolean | number;
  created_at: string;
  updated_at: string;
}
export interface HomeData {
  banners: Banner[];
  latest_posts: Post[];
  agendas: Agenda[];
  announcements: Announcement[];
  featured_video: Video;
  stats: {
    santri: string;
    asatidz: string;
    alumni: string;
    institusi: string;
  };
  gallery: Media[];
  facilities: Facility[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
  updated_at: string;
}

export interface Menu {
  id: number;
  label: string;
  url: string;
  order: number;
  is_active: boolean;
  parent_id?: number;
  children?: Menu[];
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  links?: any[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
