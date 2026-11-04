import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/40 pt-12 pb-16 text-on-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        {/* Civic Alert Banner */}
        <div className="bg-secondary-fixed/50 rounded-2xl p-5 border border-secondary-fixed-dim/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">security</span>
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm sm:text-base text-on-secondary-fixed">
                Malawi Student Rental Safety Guarantee
              </h4>
              <p className="font-sans text-xs sm:text-sm text-on-secondary-fixed-variant mt-0.5 max-w-2xl">
                CampusNest enforces a strict Zero Advance Fee policy. Never transfer funds via Airtel Money or Mpamba to anyone before physically inspecting the premises and verifying student tenancy documents.
              </p>
            </div>
          </div>
          <Link
            to="/safety"
            className="w-full sm:w-auto text-center shrink-0 px-3.5 py-2 rounded-lg bg-secondary text-on-secondary text-xs font-heading font-bold active:scale-95 transition-transform"
          >
            Safety Guidelines
          </Link>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Info */}
          <div className="sm:col-span-2 md:col-span-1 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/favicon.svg"
                alt="CampusNest Malawi Logo"
                className="w-8 h-8 rounded-lg shadow-sm shrink-0"
              />
              <span className="font-heading font-bold text-lg text-primary tracking-tight">
                CampusNest
              </span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Empowering Malawian tertiary students with transparent, verified off-campus housing near major university gates.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-primary text-xs font-semibold w-fit">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>Low-Data Optimized</span>
            </div>
          </div>

          {/* Universities */}
          <div className="flex flex-col gap-2.5">
            <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
              Universities Covered
            </h5>
            <ul className="flex flex-col gap-2 font-sans text-xs text-on-surface-variant">
              <li><Link to="/explore?university=unima" className="hover:text-primary transition-colors">UNIMA (Chancellor College)</Link></li>
              <li><Link to="/explore?university=must" className="hover:text-primary transition-colors">MUST (Thyolo Campus)</Link></li>
              <li><Link to="/explore?university=kuhes" className="hover:text-primary transition-colors">KUHeS (Blantyre Campus)</Link></li>
              <li><Link to="/explore?university=mubas" className="hover:text-primary transition-colors">MUBAS (Chichiri Campus)</Link></li>
              <li><Link to="/explore?university=luanar" className="hover:text-primary transition-colors">LUANAR (Bunda / NRC)</Link></li>
              <li><Link to="/explore?university=mzuni" className="hover:text-primary transition-colors">MZUNI (Mzuzu Campus)</Link></li>
              <li><Link to="/explore?university=dmi" className="hover:text-primary transition-colors">DMI (Mangochi Campus)</Link></li>
            </ul>
          </div>

          {/* Student Hub */}
          <div className="flex flex-col gap-2.5">
            <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
              Student Resources
            </h5>
            <ul className="flex flex-col gap-2 font-sans text-xs text-on-surface-variant">
              <li><Link to="/explore" className="hover:text-primary transition-colors">Browse Verified Hostels</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Viewing Requests Tracker</Link></li>
              <li><Link to="/safety" className="hover:text-primary transition-colors">Physical Inspection Checklist</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Campus Ambassador Desk</Link></li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="flex flex-col gap-2.5">
            <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
              Safety & Terms
            </h5>
            <ul className="flex flex-col gap-2 font-sans text-xs text-on-surface-variant">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Student Privacy & Gate Data</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Emergency Fraud Hotline</Link></li>
              <li><a href="https://wa.me/265991600735" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1 text-secondary font-bold">
                <span className="material-symbols-outlined text-[14px]">chat</span>
                <span>WhatsApp: +265 991 600 735</span>
              </a></li>
            </ul>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <p>© {new Date().getFullYear()} CampusNest Malawi. Built for Malawian university scholars.</p>
          <p className="flex items-center gap-1">
            <span>Powered by Malawi Kwacha transparent rates</span>
            <span className="font-semibold text-primary">• Free viewing appointments</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
