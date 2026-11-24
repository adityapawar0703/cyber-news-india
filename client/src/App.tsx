import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ScrollToTop } from './components/common/ScrollToTop';
import { PublicLayout } from './components/layout/PublicLayout';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { LatestNewsPage } from './pages/LatestNewsPage';
import { SearchPage } from './pages/SearchPage';
import { AboutPage } from './pages/AboutPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminLayout = lazy(() =>
  import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminArticlesPage = lazy(() =>
  import('./pages/admin/AdminArticlesPage').then((m) => ({ default: m.AdminArticlesPage }))
);
const AdminEditorPage = lazy(() =>
  import('./pages/admin/AdminEditorPage').then((m) => ({ default: m.AdminEditorPage }))
);

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#070A10] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-sky-400 animate-spin" />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public Publication Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/latest" element={<LatestNewsPage />} />
                  <Route path="/article/:slug" element={<ArticlePage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<LegalPage type="privacy" />} />
                  <Route path="/terms" element={<LegalPage type="terms" />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Separate Admin Login Route */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Dashboard & CMS Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="articles" element={<AdminArticlesPage />} />
                  <Route path="articles/new" element={<AdminEditorPage />} />
                  <Route path="articles/:id/edit" element={<AdminEditorPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
