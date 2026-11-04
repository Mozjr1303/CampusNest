import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Lazy load all routes for optimal performance on limited Malawian mobile data
const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ReportListingPage = lazy(() => import('./pages/ReportListingPage'));
const SafetyPage = lazy(() => import('./pages/SafetyPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AuthPage = lazy(() => import('./components/auth/AuthPage'));
const CreateListingForm = lazy(() => import('./components/landlord/CreateListingForm'));
const EditListingForm = lazy(() => import('./components/landlord/EditListingForm'));
const LandlordDashboard = lazy(() => import('./components/landlord/LandlordDashboard'));
const ViewingRequests = lazy(() => import('./components/landlord/ViewingRequests'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

// Configure TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Lightweight Suspense fallback
function PageLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-surface-container border-t-primary rounded-full animate-spin" />
      <span className="mt-3 font-heading text-xs font-semibold text-primary">
        Loading CampusNest...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public Student Routes */}
                <Route index element={<HomePage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="listings/:id" element={<ListingDetailPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="safety" element={<SafetyPage />} />
                <Route path="faq" element={<FaqPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="contact" element={<ContactPage />} />

                {/* Protected Student Routes */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="listings/:id/report"
                  element={
                    <ProtectedRoute>
                      <ReportListingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Auth Route */}
                <Route path="auth" element={<AuthPage />} />

                {/* Landlord Routes */}
                <Route
                  path="landlord/dashboard"
                  element={
                    <ProtectedRoute>
                      <LandlordDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="landlord/listings/new"
                  element={
                    <ProtectedRoute>
                      <CreateListingForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="landlord/listings/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditListingForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="landlord/viewings"
                  element={
                    <ProtectedRoute>
                      <ViewingRequests />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Routes (SRS FR-14, FR-15, FR-19, FR-20, Sec 10.ix) */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
