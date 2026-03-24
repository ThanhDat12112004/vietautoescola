import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_15%_20%,rgba(255,214,224,0.45),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(255,228,171,0.45),transparent_35%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_55%,#f7eef5_100%)]">
      <Navbar />
      <div className="flex-1 px-4 py-12">
        <div className="container section-panel flex min-h-[52vh] items-center justify-center text-center">
          <div>
            <h1 className="mb-3 font-display text-5xl font-black text-[#64172f] md:text-6xl">404</h1>
            <p className="mb-6 text-lg text-muted-foreground md:text-xl">Oops! Page not found</p>
            <a
              href="/"
              className="inline-flex items-center rounded-xl bg-[linear-gradient(135deg,#7a2038_0%,#b23d58_65%,#ca8a04_100%)] px-5 py-2.5 font-semibold text-white shadow-[0_10px_22px_rgba(95,20,40,0.2)] hover:opacity-95"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
