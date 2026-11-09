import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthContext } from '../context/AuthContext';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import LoginPage from '../pages/LoginPage';

// Helper component to display current path for verification
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname + location.search}</div>;
}

function MockAdminDashboard() {
  return <div data-testid="admin-dashboard-page">Admin Dashboard Content</div>;
}

function MockStudentDashboard() {
  return <div data-testid="student-dashboard-page">Student Dashboard Content</div>;
}

function MockLandlordDashboard() {
  return <div data-testid="landlord-dashboard-page">Landlord Dashboard Content</div>;
}

describe('Admin Authentication and Dashboard Access Control', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users attempting to access /admin to /login?redirect=%2Fadmin', () => {
    const authContextValue = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="login" element={<LocationDisplay />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MockAdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('location-display')).toHaveTextContent('/login?redirect=%2Fadmin');
    expect(screen.queryByTestId('admin-dashboard-page')).not.toBeInTheDocument();
  });

  it('blocks student accounts from accessing /admin and redirects them to /dashboard', () => {
    const authContextValue = {
      user: { id: 'usr-student-1', fullName: 'Chisomo Phiri', role: 'student', email: 'chisomo@unima.ac.mw' },
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="dashboard" element={<MockStudentDashboard />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MockAdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('student-dashboard-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard-page')).not.toBeInTheDocument();
  });

  it('blocks landlord accounts from accessing /admin and redirects them to /landlord/dashboard', () => {
    const authContextValue = {
      user: { id: 'usr-landlord-1', fullName: 'Mr. B. Phiri', role: 'landlord', email: 'phiri@campusnest.mw' },
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="landlord/dashboard" element={<MockLandlordDashboard />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MockAdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('landlord-dashboard-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard-page')).not.toBeInTheDocument();
  });

  it('allows authenticated administrator to access /admin', () => {
    const authContextValue = {
      user: { id: 'usr-admin-1', fullName: 'Yamikani Chanza (Admin)', role: 'admin', email: 'admin@campusnest.mw' },
      token: 'mock-admin-token',
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MockAdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('admin-dashboard-page')).toBeInTheDocument();
  });

  it('redirects administrator to /admin upon login when no explicit redirect is set', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      token: 'mock-admin-jwt',
      role: 'admin',
      user: { id: 'usr-admin-1', role: 'admin', email: 'admin@campusnest.mw' },
    });

    const authContextValue = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      login: mockLogin,
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="admin" element={<MockAdminDashboard />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const identifierInput = screen.getByLabelText(/Email or Malawian Phone/i);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Sign In to CampusNest/i });

    fireEvent.change(identifierInput, { target: { value: 'admin@campusnest.mw' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        identifier: 'admin@campusnest.mw',
        password: 'admin123',
        rememberMe: true,
      });
      expect(screen.getByTestId('admin-dashboard-page')).toBeInTheDocument();
    });
  });

  it('honours explicit redirect param to /admin when logging in', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      token: 'mock-admin-jwt',
      role: 'admin',
      user: { id: 'usr-admin-1', role: 'admin', email: 'admin@campusnest.mw' },
    });

    const authContextValue = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      login: mockLogin,
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter initialEntries={['/login?redirect=%2Fadmin']}>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="admin" element={<MockAdminDashboard />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const identifierInput = screen.getByLabelText(/Email or Malawian Phone/i);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Sign In to CampusNest/i });

    fireEvent.change(identifierInput, { target: { value: 'admin@campusnest.mw' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard-page')).toBeInTheDocument();
    });
  });
});
