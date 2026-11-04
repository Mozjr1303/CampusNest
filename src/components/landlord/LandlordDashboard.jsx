// src/components/landlord/LandlordDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export default function LandlordDashboard() {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({ active: 0, pendingViewings: 0, archived: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandlordData();
  }, []);

  const fetchLandlordData = async () => {
    try {
      const response = await apiClient.get('/landlord/accommodations');
      const landlordListings = response.data?.listings || [];
      const landlordStats = response.data?.stats || {
        active: landlordListings.filter((l) => l.availabilityStatus === 'available').length,
        pendingViewings: 0,
        archived: landlordListings.filter((l) => l.availabilityStatus === 'archived' || l.availabilityStatus === 'unavailable').length,
      };

      setListings(landlordListings);
      setStats(landlordStats);
    } catch (error) {
      console.error('Error fetching landlord dashboard data:', error);
      // Offline fallback: strictly match the logged-in user's ID
      const user = JSON.parse(localStorage.getItem('campusnest_user') || '{}');
      const allRaw = localStorage.getItem('campusnest_accommodations');
      const all = allRaw ? JSON.parse(allRaw) : [];
      const userListings = all.filter((item) => user.id && (item.landlordId === user.id || item.landlord?.id === user.id));

      setListings(userListings);
      setStats({
        active: userListings.filter((l) => l.availabilityStatus === 'available').length,
        pendingViewings: 0,
        archived: userListings.filter((l) => l.availabilityStatus === 'archived' || l.availabilityStatus === 'unavailable').length,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    try {
      await apiClient.patch(`/accommodations/${id}/status`, { status: newStatus });
      fetchLandlordData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteListing = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${title}"? This property listing will be permanently removed from CampusNest.`
    );
    if (!confirmed) return;

    try {
      await apiClient.delete(`/accommodations/${id}`);
      fetchLandlordData();
    } catch (error) {
      console.error('Error removing listing:', error);
      alert('Failed to remove listing. Please check connection and try again.');
    }
  };

  const renderStatusBadge = (item) => {
    const avail = item.availability_status || item.availabilityStatus || item.status;
    const verif = item.verification_status || item.verificationStatus;

    if (avail === 'pending' || verif === 'unverified') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Pending Admin Approval</span>
        </span>
      );
    }

    if (verif === 'flagged') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-error-container text-on-error-container">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>Needs Changes / Flagged</span>
        </span>
      );
    }

    if (avail === 'available') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          <span>Verified & Available</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span>{avail || 'Occupied'}</span>
      </span>
    );
  };

  const pendingApprovalCount = listings.filter(
    (l) =>
      (l.availability_status || l.availabilityStatus || l.status) === 'pending' ||
      (l.verification_status || l.verificationStatus) === 'unverified'
  ).length;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-surface-container border-t-primary rounded-full animate-spin" />
        <span className="mt-3 font-heading text-xs font-semibold text-primary">
          Loading landlord dashboard...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface tracking-tight">
            Landlord Dashboard
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1">
            Manage your student accommodations, occupancy status, and inspection bookings.
          </p>
        </div>
        <Link 
          to="/landlord/listings/new" 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-heading text-xs sm:text-sm font-bold shadow-sm hover:bg-primary-container active:scale-98 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add New Listing</span>
        </Link>
      </div>

      {/* Pending Admin Approvals Info Banner */}
      {pendingApprovalCount > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start sm:items-center gap-3">
          <span className="material-symbols-outlined text-amber-700 text-[22px] shrink-0 mt-0.5 sm:mt-0">
            schedule
          </span>
          <div className="flex-1 text-xs">
            <span className="font-heading font-bold text-amber-900">
              Hostel Approvals Notice:
            </span>{' '}
            <span className="text-amber-800">
              You have {pendingApprovalCount} property submission{pendingApprovalCount > 1 ? 's' : ''} undergoing CampusNest safety verification.
              Our administrators will physically inspect and verify your hostel before publishing it to scholars.
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-xs border border-outline-variant/30 flex sm:flex-col justify-between sm:justify-start items-center sm:items-start">
          <div>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium">Active Listings</p>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-primary mt-1">{stats.active}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center sm:hidden">
            <span className="material-symbols-outlined text-[20px]">home</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-xs border border-outline-variant/30 flex sm:flex-col justify-between sm:justify-start items-center sm:items-start">
          <div>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium">Pending Viewing Requests</p>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-secondary mt-1">{stats.pendingViewings}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center sm:hidden">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-xs border border-outline-variant/30 flex sm:flex-col justify-between sm:justify-start items-center sm:items-start">
          <div>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium">Archived Listings</p>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface-variant mt-1">{stats.archived}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center sm:hidden">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-heading font-bold text-on-surface">
            My Properties ({listings.length})
          </h2>
          <Link to="/landlord/viewings" className="text-xs font-heading font-semibold text-primary hover:underline flex items-center gap-1">
            <span>View all viewing requests</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-2">
              <span className="material-symbols-outlined text-[24px]">home_work</span>
            </div>
            <p className="text-sm font-heading font-semibold text-on-surface">No properties listed yet</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Click "Add New Listing" to publish your first student accommodation.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-xs font-heading font-semibold border-b border-outline-variant/20">
                    <th className="py-3 px-6">Title</th>
                    <th className="py-3 px-6">Area / Location</th>
                    <th className="py-3 px-6">Rent (MWK)</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-xs sm:text-sm text-on-surface">
                  {listings.map((item) => (
                    <tr key={item.accommodation_id || item.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6 font-heading font-bold text-on-surface">
                        {item.title}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">{item.area}</td>
                      <td className="py-4 px-6 font-semibold tnum text-primary">
                        MK {Number(item.rent_mwk || item.price || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        {renderStatusBadge(item)}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link 
                          to={`/landlord/listings/${item.accommodation_id || item.id}/edit`} 
                          className="text-xs font-heading font-bold text-primary hover:underline px-2 py-1 rounded hover:bg-primary/5 transition-colors"
                        >
                          Edit
                        </Link>
                        <button 
                          type="button"
                          onClick={() => handleStatusToggle(item.accommodation_id || item.id, item.availability_status || item.status)}
                          className="text-xs font-heading font-semibold text-on-surface-variant hover:text-on-surface px-2 py-1 rounded hover:bg-surface-container transition-colors"
                        >
                          Toggle Status
                        </button>
                        <Link 
                          to={`/landlord/viewings?property=${item.accommodation_id || item.id}`} 
                          className="text-xs font-heading font-bold text-secondary hover:underline px-2 py-1 rounded hover:bg-secondary/5 transition-colors"
                        >
                          Viewings
                        </Link>
                        <button 
                          type="button"
                          onClick={() => handleDeleteListing(item.accommodation_id || item.id, item.title)}
                          className="text-xs font-heading font-bold text-error hover:underline px-2 py-1 rounded hover:bg-error/10 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards View (< 768px) */}
            <div className="md:hidden divide-y divide-outline-variant/20">
              {listings.map((item) => (
                <div key={item.accommodation_id || item.id} className="p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                        <span className="truncate">{item.area}</span>
                      </p>
                    </div>
                    <div className="shrink-0">
                      {renderStatusBadge(item)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-on-surface-variant">Monthly Rent:</span>
                    <span className="font-heading font-bold text-primary tnum text-sm">
                      MK {Number(item.rent_mwk || item.price || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-outline-variant/20">
                    <Link
                      to={`/landlord/listings/${item.accommodation_id || item.id}/edit`}
                      className="py-2 px-1 text-center rounded-lg bg-surface-container text-xs font-heading font-bold text-primary active:scale-98 transition-transform"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(item.accommodation_id || item.id, item.availability_status || item.status)}
                      className="py-2 px-1 text-center rounded-lg bg-surface-container text-xs font-heading font-semibold text-on-surface-variant active:scale-98 transition-transform"
                    >
                      Toggle
                    </button>
                    <Link
                      to={`/landlord/viewings?property=${item.accommodation_id || item.id}`}
                      className="py-2 px-1 text-center rounded-lg bg-secondary/10 text-xs font-heading font-bold text-secondary active:scale-98 transition-transform"
                    >
                      Viewings
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteListing(item.accommodation_id || item.id, item.title)}
                      className="py-2 px-1 text-center rounded-lg bg-error-container/30 text-xs font-heading font-bold text-error active:scale-98 transition-transform"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
