import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  let errorMessage = 'Terjadi kesalahan sistem.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      errorMessage = 'Halaman yang Anda cari tidak ditemukan.';
    } else {
      errorMessage = error.statusText;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Ups!</h1>
      <p className="text-lg text-gray-600 mb-8">{errorMessage}</p>
      <a href="/" className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors">
        Kembali ke Beranda
      </a>
    </div>
  );
}
