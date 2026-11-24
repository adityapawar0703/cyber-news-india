import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { api } from '../../lib/api';

let hasTrackedVisitThisLoad = false;

export function PublicLayout() {
  useEffect(() => {
    if (hasTrackedVisitThisLoad) return;
    hasTrackedVisitThisLoad = true;
    api.trackSiteVisit().catch(() => {
      // Non-blocking telemetry
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#070A10] text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
