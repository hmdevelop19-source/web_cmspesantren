import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PageLoader from '../components/ui/PageLoader';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';

// Error & Guard
import ErrorPage from '../components/ErrorPage';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy Loaded Pages - Admin
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Posts = lazy(() => import('../pages/admin/Posts'));
const PostsCreate = lazy(() => import('../pages/admin/PostsCreate'));
const PostsEdit = lazy(() => import('../pages/admin/PostsEdit'));
const Pages = lazy(() => import('../pages/admin/Pages'));
const PagesCreate = lazy(() => import('../pages/admin/PagesCreate'));
const PagesEdit = lazy(() => import('../pages/admin/PagesEdit'));
const UsersEdit = lazy(() => import('../pages/admin/UsersEdit'));
const Facilities = lazy(() => import('../pages/admin/Facilities'));
const FacilitiesCreate = lazy(() => import('../pages/admin/FacilitiesCreate'));
const FacilitiesEdit = lazy(() => import('../pages/admin/FacilitiesEdit'));
const Media = lazy(() => import('../pages/admin/Media'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const HeroSettings = lazy(() => import('../pages/admin/HeroSettings'));
const Agendas = lazy(() => import('../pages/admin/Agendas'));
const AgendasCreate = lazy(() => import('../pages/admin/AgendasCreate'));
const AgendasEdit = lazy(() => import('../pages/admin/AgendasEdit'));
const Pengumumans = lazy(() => import('../pages/admin/Pengumumans'));
const PengumumansCreate = lazy(() => import('../pages/admin/PengumumansCreate'));
const PengumumansEdit = lazy(() => import('../pages/admin/PengumumansEdit'));
const Videos = lazy(() => import('../pages/admin/Videos'));
const VideosCreate = lazy(() => import('../pages/admin/VideosCreate'));
const VideosEdit = lazy(() => import('../pages/admin/VideosEdit'));
const Users = lazy(() => import('../pages/admin/Users'));
const UsersCreate = lazy(() => import('../pages/admin/UsersCreate'));
const Permissions = lazy(() => import('../pages/admin/Permissions'));
const Categories = lazy(() => import('../pages/admin/Categories'));
const MenuManager = lazy(() => import('../pages/admin/MenuManager'));
const Profile = lazy(() => import('../pages/admin/Profile'));
const ContactMessages = lazy(() => import('../pages/admin/ContactMessages'));
const LeadersManager = lazy(() => import('../pages/admin/LeadersManager'));
const Testimonials = lazy(() => import('../pages/admin/Testimonials'));

// Lazy Loaded Pages - Public
const Home = lazy(() => import('../pages/public/Home'));
const Profil = lazy(() => import('../pages/public/Profil'));
const Leaders = lazy(() => import('../pages/public/Leaders'));
const Berita = lazy(() => import('../pages/public/Berita'));
const BeritaDetail = lazy(() => import('../pages/public/BeritaDetail'));
const ArtikelDetail = lazy(() => import('../pages/public/ArtikelDetail'));
const AgendasPublic = lazy(() => import('../pages/public/Agendas'));
const AgendasDetailPublic = lazy(() => import('../pages/public/AgendasDetail'));
const AnnouncementsPublic = lazy(() => import('../pages/public/Pengumuman'));
const AnnouncementDetailPublic = lazy(() => import('../pages/public/PengumumanDetail'));
const Kontak = lazy(() => import('../pages/public/Kontak'));
const PublicGaleri = lazy(() => import('../pages/public/PublicGaleri'));
const FasilitasPublic = lazy(() => import('../pages/public/Fasilitas'));
const PageDetail = lazy(() => import('../pages/public/PageDetail'));
const Publications = lazy(() => import('../pages/public/Publications'));

// Lazy Loaded Pages - Auth
const Login = lazy(() => import('../pages/auth/Login'));

// Helper to wrap lazy components with Suspense
const Loadable = (Component: any) => (props: any) => (
  <Suspense fallback={<PageLoader />}>
    <Component {...props} />
  </Suspense>
);

// Wrapped Components
const DashboardPage = Loadable(Dashboard);
const PostsPage = Loadable(Posts);
const PostsCreatePage = Loadable(PostsCreate);
const PostsEditPage = Loadable(PostsEdit);
const PagesPage = Loadable(Pages);
const PagesCreatePage = Loadable(PagesCreate);
const PagesEditPage = Loadable(PagesEdit);
const UsersEditPage = Loadable(UsersEdit);
const FacilitiesPage = Loadable(Facilities);
const FacilitiesCreatePage = Loadable(FacilitiesCreate);
const FacilitiesEditPage = Loadable(FacilitiesEdit);
const MediaPage = Loadable(Media);
const SettingsPage = Loadable(Settings);
const HeroSettingsPage = Loadable(HeroSettings);
const AgendasPage = Loadable(Agendas);
const AgendasCreatePage = Loadable(AgendasCreate);
const AgendasEditPage = Loadable(AgendasEdit);
const PengumumansPage = Loadable(Pengumumans);
const PengumumansCreatePage = Loadable(PengumumansCreate);
const PengumumansEditPage = Loadable(PengumumansEdit);
const VideosPage = Loadable(Videos);
const VideosCreatePage = Loadable(VideosCreate);
const VideosEditPage = Loadable(VideosEdit);
const UsersPage = Loadable(Users);
const UsersCreatePage = Loadable(UsersCreate);
const PermissionsPage = Loadable(Permissions);
const CategoriesPage = Loadable(Categories);
const MenuManagerPage = Loadable(MenuManager);
const ProfilePage = Loadable(Profile);
const ContactMessagesPage = Loadable(ContactMessages);
const LeadersManagerPage = Loadable(LeadersManager);
const TestimonialsPage = Loadable(Testimonials);

const HomePage = Loadable(Home);
const ProfilPage = Loadable(Profil);
const LeadersPage = Loadable(Leaders);
const BeritaPage = Loadable(Berita);
const BeritaDetailPage = Loadable(BeritaDetail);
const ArtikelDetailPage = Loadable(ArtikelDetail);
const AgendasPublicPage = Loadable(AgendasPublic);
const AgendasDetailPublicPage = Loadable(AgendasDetailPublic);
const AnnouncementsPublicPage = Loadable(AnnouncementsPublic);
const AnnouncementDetailPublicPage = Loadable(AnnouncementDetailPublic);
const KontakPage = Loadable(Kontak);
const PublicGaleriPage = Loadable(PublicGaleri);
const FasilitasPublicPage = Loadable(FasilitasPublic);
const PageDetailPage = Loadable(PageDetail);
const PublicationsPage = Loadable(Publications);
const LoginPage = Loadable(Login);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'profil', element: <ProfilPage /> },
      { path: 'silsilah-pengasuh', element: <LeadersPage /> },
      { path: 'profil/:slug', element: <PageDetailPage /> },
      { path: 'news-pesantren', element: <BeritaPage /> },
      { path: 'berita', element: <BeritaPage /> },
      { path: 'artikel', element: <BeritaPage /> },
      { path: 'kajian', element: <BeritaPage /> },
      { path: 'news-pesantren/:slug', element: <BeritaDetailPage /> },
      { path: 'berita/:slug', element: <BeritaDetailPage /> },
      { path: 'artikel/:slug', element: <ArtikelDetailPage /> },
      { path: 'agenda', element: <AgendasPublicPage /> },
      { path: 'agenda/:slug', element: <AgendasDetailPublicPage /> },
      { path: 'pengumuman', element: <AnnouncementsPublicPage /> },
      { path: 'pengumuman/:slug', element: <AnnouncementDetailPublicPage /> },
      { path: 'kontak', element: <KontakPage /> },
      { path: 'galeri', element: <PublicGaleriPage /> },
      { path: 'fasilitas', element: <FasilitasPublicPage /> },
      { path: 'publikasi', element: <PublicationsPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'posts', element: <PostsPage /> },
          { path: 'posts/create', element: <PostsCreatePage /> },
          { path: 'posts/edit/:id', element: <PostsEditPage /> },
          { path: 'pages', element: <PagesPage /> },
          { path: 'pages/create', element: <PagesCreatePage /> },
          { path: 'pages/edit/:id', element: <PagesEditPage /> },
          { path: 'media', element: <MediaPage /> },
          { path: 'facilities', element: <FacilitiesPage /> },
          { path: 'facilities/create', element: <FacilitiesCreatePage /> },
          { path: 'facilities/edit/:id', element: <FacilitiesEditPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'hero', element: <HeroSettingsPage /> },
          { path: 'agendas', element: <AgendasPage /> },
          { path: 'agendas/create', element: <AgendasCreatePage /> },
          { path: 'agendas/edit/:id', element: <AgendasEditPage /> },
          { path: 'pengumumans', element: <PengumumansPage /> },
          { path: 'pengumumans/create', element: <PengumumansCreatePage /> },
          { path: 'pengumumans/edit/:id', element: <PengumumansEditPage /> },
          { path: 'videos', element: <VideosPage /> },
          { path: 'videos/create', element: <VideosCreatePage /> },
          { path: 'videos/edit/:id', element: <VideosEditPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'users/create', element: <UsersCreatePage /> },
          { path: 'users/edit/:id', element: <UsersEditPage /> },
          { path: 'permissions', element: <PermissionsPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'menus', element: <MenuManagerPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'contact-messages', element: <ContactMessagesPage /> },
          { path: 'leaders', element: <LeadersManagerPage /> },
          { path: 'testimonials', element: <TestimonialsPage /> },
        ],
      },
    ],
  },
]);
