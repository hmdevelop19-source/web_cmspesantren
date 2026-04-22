import { createBrowserRouter } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';

import Dashboard from '../pages/admin/Dashboard';
import Posts from '../pages/admin/Posts';
import PostsCreate from '../pages/admin/PostsCreate';
import Pages from '../pages/admin/Pages';
import PagesCreate from '../pages/admin/PagesCreate';
import PagesEdit from '../pages/admin/PagesEdit';
import Media from '../pages/admin/Media';
import Settings from '../pages/admin/Settings';
import HeroSettings from '../pages/admin/HeroSettings';
import HeaderSettings from '../pages/admin/HeaderSettings';
import Agendas from '../pages/admin/Agendas';
import AgendasCreate from '../pages/admin/AgendasCreate';
import AgendasEdit from '../pages/admin/AgendasEdit';
import Pengumumans from '../pages/admin/Pengumumans';
import PengumumansCreate from '../pages/admin/PengumumansCreate';
import PengumumansEdit from '../pages/admin/PengumumansEdit';
import Videos from '../pages/admin/Videos';
import VideosCreate from '../pages/admin/VideosCreate';
import VideosEdit from '../pages/admin/VideosEdit';
import Users from '../pages/admin/Users';
import UsersCreate from '../pages/admin/UsersCreate';
import Permissions from '../pages/admin/Permissions';
import Categories from '../pages/admin/Categories';
import PostsEdit from '../pages/admin/PostsEdit';
import Profile from '../pages/admin/Profile';
import ProfileInstitusi from '../pages/admin/ProfileInstitusi';
import ContactMessages from '../pages/admin/ContactMessages';
import SidebarBanner from '../pages/admin/SidebarBanner';

import Home from '../pages/public/Home';
import Profil from '../pages/public/Profil';
import Berita from '../pages/public/Berita';
import BeritaDetail from '../pages/public/BeritaDetail';
import ArtikelDetail from '../pages/public/ArtikelDetail';
import AgendasPublic from '../pages/public/Agendas';
import AgendasDetailPublic from '../pages/public/AgendasDetail';
import AnnouncementsPublic from '../pages/public/Pengumuman';
import AnnouncementDetailPublic from '../pages/public/PengumumanDetail';
import Kontak from '../pages/public/Kontak';
import PublicGaleri from '../pages/public/PublicGaleri';
import PageDetail from '../pages/public/PageDetail';
import ErrorPage from '../components/ErrorPage';

import Login from '../pages/auth/Login';
import ProtectedRoute from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'profil',
        element: <Profil />,
      },
      {
        path: 'profil/:slug',
        element: <PageDetail />,
      },
      {
        path: 'berita',
        element: <Berita />,
      },
      {
        path: 'berita/:slug',
        element: <BeritaDetail />,
      },
      {
        path: 'artikel/:slug',
        element: <ArtikelDetail />,
      },
      {
        path: 'agenda',
        element: <AgendasPublic />,
      },
      {
        path: 'agenda/:slug',
        element: <AgendasDetailPublic />,
      },
      {
        path: 'pengumuman',
        element: <AnnouncementsPublic />,
      },
      {
        path: 'pengumuman/:slug',
        element: <AnnouncementDetailPublic />,
      },
      {
        path: 'kontak',
        element: <Kontak />,
      },
      {
        path: 'galeri',
        element: <PublicGaleri />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
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
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'profil-lembaga',
            element: <ProfileInstitusi />,
          },
          {
            path: 'posts',
            element: <Posts />,
          },
          {
            path: 'posts/create',
            element: <PostsCreate />,
          },
          {
            path: 'posts/edit/:id',
            element: <PostsEdit />,
          },
          {
            path: 'pages',
            element: <Pages />,
          },
          {
            path: 'pages/create',
            element: <PagesCreate />,
          },
          {
            path: 'pages/edit/:id',
            element: <PagesEdit />,
          },
          {
            path: 'media',
            element: <Media />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
          {
            path: 'hero',
            element: <HeroSettings />,
          },
          {
            path: 'header',
            element: <HeaderSettings />,
          },
          {
            path: 'sidebar-banner',
            element: <SidebarBanner />,
          },
          {
            path: 'agendas',
            element: <Agendas />,
          },
          {
            path: 'agendas/create',
            element: <AgendasCreate />,
          },
          {
            path: 'agendas/edit/:id',
            element: <AgendasEdit />,
          },
          {
            path: 'pengumumans',
            element: <Pengumumans />,
          },
          {
            path: 'pengumumans/create',
            element: <PengumumansCreate />,
          },
          {
            path: 'pengumumans/edit/:id',
            element: <PengumumansEdit />,
          },
          {
            path: 'videos',
            element: <Videos />,
          },
          {
            path: 'videos/create',
            element: <VideosCreate />,
          },
          {
            path: 'videos/edit/:id',
            element: <VideosEdit />,
          },
          {
            path: 'users',
            element: <Users />,
          },
          {
            path: 'users/create',
            element: <UsersCreate />,
          },
          {
            path: 'users/edit/:id',
            element: <UsersCreate />,
          },
          {
            path: 'permissions',
            element: <Permissions />,
          },
          {
            path: 'categories',
            element: <Categories />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
          {
            path: 'contact-messages',
            element: <ContactMessages />,
          },
        ],
      },
    ],
  },
]);
