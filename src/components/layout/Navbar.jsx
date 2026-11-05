import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinkClasses = ({ isActive }) =>
    `font-heading text-xs lg:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
      isActive
        ? 'text-primary'
        : 'text-on-surface-variant hover:text-on-surface'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/30 pt-safe">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-2 lg:gap-4">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/favicon.svg"
              alt="CampusNest Malawi Logo"
              className="w-9 h-9 rounded-lg shadow-sm group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col shrink-0">
              <span className="font-heading font-bold text-lg text-primary tracking-tight leading-none whitespace-nowrap">
                CampusNest
              </span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none mt-0.5 whitespace-nowrap">
                Malawi
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-5 xl:gap-6 overflow-x-auto no-scrollbar py-1" aria-label="Main navigation">
          <NavLink to="/" className={navLinkClasses} end>
            Home
          </NavLink>
          <NavLink to="/explore" className={navLinkClasses}>
            Explore Rooms
          </NavLink>
          {isAuthenticated && (user?.role === 'admin' || user?.email === 'admin@campusnest.mw') && (
            <NavLink to="/admin" className={navLinkClasses}>
              Admin Console
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'landlord' && (
            <NavLink to="/landlord/dashboard" className={navLinkClasses}>
              Landlord Portal
            </NavLink>
          )}
          {isAuthenticated && user?.role !== 'admin' && user?.email !== 'admin@campusnest.mw' && user?.role !== 'landlord' && (
            <NavLink to="/dashboard" className={navLinkClasses}>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/safety" className={navLinkClasses}>
            Safety & Verification
          </NavLink>
          <NavLink to="/faq" className={navLinkClasses}>
            Help & FAQs
          </NavLink>
        </nav>

        {/* Right: Quick Actions & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Shortcut */}
          <Link
            to="/explore"
            aria-label="Search listings"
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </Link>

          {/* Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-1 shrink-0">
              <Link
                to="/profile"
                className="flex items-center gap-2 sm:gap-2.5 py-1 px-1 sm:px-2 rounded-full hover:bg-surface-container/70 active:scale-95 transition-all group shrink-0"
                title={`${user?.fullName || 'User'} — Profile (${user?.role || 'student'})`}
                aria-label={`Profile for ${user?.fullName ? user.fullName.trim().split(/\s+/)[0] : 'User'}`}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#004d40] text-white flex items-center justify-center font-heading font-extrabold text-xs sm:text-[13px] tracking-wide ring-[2.5px] ring-[#80dfc8] shadow-xs shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {user?.fullName
                        ? user.fullName
                            .trim()
                            .split(/\s+/)
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()
                        : 'CB'}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left max-w-[120px]">
                  <span className="font-heading font-bold text-xs sm:text-sm text-on-surface tracking-tight truncate">
                    {user?.fullName ? user.fullName.trim().split(/\s+/)[0] : 'User'}
                  </span>
                  {(user?.role === 'admin' || user?.email === 'admin@campusnest.mw') && (
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider -mt-0.5">
                      Admin
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/login"
                className="hidden sm:inline-flex text-xs font-semibold px-3 py-2 rounded-lg text-primary hover:bg-surface-container transition-colors whitespace-nowrap"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="inline-flex text-xs font-bold px-3.5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm whitespace-nowrap"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-outline-variant/40 px-4 pt-3 pb-6 flex flex-col gap-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-1 pb-3 border-b border-outline-variant/20">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">home</span>
              <span>Home</span>
            </Link>
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
              <span>Explore Accommodations</span>
            </Link>
            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <span>Safety & Trust Standards</span>
            </Link>
            <Link
              to="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">help</span>
              <span>Help & FAQs</span>
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="flex flex-col gap-1 pt-1">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container flex items-center gap-3 bg-surface-container-low"
              >
                <div className="w-9 h-9 rounded-full bg-[#004d40] text-white flex items-center justify-center font-heading font-extrabold text-xs ring-[2px] ring-[#80dfc8] shrink-0">
                  {user?.fullName
                    ? user.fullName
                        .trim()
                        .split(/\s+/)
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'CB'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-on-surface text-sm truncate">
                    {user?.fullName || 'User'}
                  </span>
                  <span className="text-[11px] text-primary font-medium">
                    {user?.role === 'admin' || user?.email === 'admin@campusnest.mw'
                      ? 'Administrator Profile & Console'
                      : user?.role === 'landlord'
                      ? 'Landlord Profile & Settings'
                      : 'Student Profile & Settings'}
                  </span>
                </div>
              </Link>
              {(user?.role === 'admin' || user?.email === 'admin@campusnest.mw') && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg text-sm font-semibold text-primary hover:bg-surface-container flex items-center gap-2.5"
                >
                  <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                  <span>Admin Console & Approvals</span>
                </Link>
              )}
              {user?.role === 'landlord' && (
                <Link
                  to="/landlord/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg text-sm font-semibold text-primary hover:bg-surface-container flex items-center gap-2.5"
                >
                  <span className="material-symbols-outlined text-[20px]">real_estate_agent</span>
                  <span>Landlord Portal & Properties</span>
                </Link>
              )}
              {user?.role !== 'admin' && user?.email !== 'admin@campusnest.mw' && user?.role !== 'landlord' && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2.5"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">dashboard</span>
                  <span>Student Dashboard & Bookings</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-error hover:bg-error-container/30 flex items-center gap-2.5"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold rounded-lg border border-primary text-primary hover:bg-surface-container"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold rounded-lg bg-primary text-on-primary hover:bg-primary-container shadow-sm"
              >
                Create Student Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
