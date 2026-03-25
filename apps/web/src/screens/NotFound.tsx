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
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_12%_18%,rgba(255,206,220,0.52),transparent_40%),radial-gradient(circle_at_86%_8%,rgba(255,224,160,0.48),transparent_32%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_58%,#f8eff6_100%)]">
      <Navbar />
      <div className="flex-1 px-4 py-12">
        <div className="container section-panel flex min-h-[52vh] items-center justify-center text-center">
          <div className="rounded-3xl border border-[#7a2038]/15 bg-[linear-gradient(160deg,rgba(255,255,255,0.92)_0%,rgba(255,247,250,0.82)_50%,rgba(255,249,235,0.72)_100%)] px-8 py-10 shadow-[0_18px_42px_rgba(95,20,40,0.14)]">
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
