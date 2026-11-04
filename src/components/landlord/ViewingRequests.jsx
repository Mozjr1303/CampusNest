// src/components/landlord/ViewingRequests.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function ViewingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchViewingRequests();
  }, []);

  const fetchViewingRequests = async () => {
    try {
      const response = await apiClient.get('/viewings/landlord');
      setRequests(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching viewing requests:', err);
      setError('Failed to load viewing requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (viewingId, newStatus) => {
    try {
      await apiClient.patch(`/viewings/${viewingId}`, { status: newStatus });
      fetchViewingRequests();
    } catch (err) {
      console.error('Error updating viewing request status:', err);
      alert('Failed to update viewing status.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-surface-container border-t-primary rounded-full animate-spin" />
        <span className="mt-3 font-heading text-xs font-semibold text-primary">
          Loading viewing requests...
        </span>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669]">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>Accepted</span>
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{status === 'rejected' ? 'Rejected' : 'Cancelled'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-fixed text-on-secondary-fixed">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface tracking-tight">
          Student Viewing Requests
        </h1>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1">
          Review and respond to scheduled walkthrough appointments from prospective student tenants.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-error-container text-on-error-container rounded-xl text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-2">
              <span className="material-symbols-outlined text-[24px]">calendar_today</span>
            </div>
            <p className="text-sm font-heading font-semibold text-on-surface">No viewing requests found</p>
            <p className="text-xs text-on-surface-variant mt-0.5">When students book a viewing on your properties, they will appear here.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-xs font-heading font-semibold border-b border-outline-variant/20">
                    <th className="py-3 px-6">Property</th>
                    <th className="py-3 px-6">Student Name</th>
                    <th className="py-3 px-6">Requested Date & Time</th>
                    <th className="py-3 px-6">Message</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-xs sm:text-sm text-on-surface">
                  {requests.map((item) => (
                    <tr key={item.viewing_id || item.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6 font-heading font-bold text-on-surface">
                        {item.property_title || item.accommodationTitle || 'Property'}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">{item.student_name || item.contactPhone || 'Student'}</td>
                      <td className="py-4 px-6 text-on-surface-variant tnum">
                        {item.requested_datetime
                          ? new Date(item.requested_datetime).toLocaleString()
                          : `${item.preferredDate || ''} ${item.preferredTimeSlot || ''}`}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant italic max-w-xs truncate">
                        {item.message || item.studentNotes || 'No notes provided'}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {item.status === 'pending' ? (
                          <>
                            <button 
                              type="button"
                              onClick={() => handleStatusUpdate(item.viewing_id || item.id, 'accepted')}
                              className="bg-[#059669] text-white px-3 py-1.5 rounded-lg text-xs font-heading font-bold hover:bg-[#047857] shadow-xs active:scale-95 transition-all"
                            >
                              Accept
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleStatusUpdate(item.viewing_id || item.id, 'rejected')}
                              className="bg-error text-on-error px-3 py-1.5 rounded-lg text-xs font-heading font-bold hover:bg-error/90 shadow-xs active:scale-95 transition-all"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-on-surface-variant text-xs font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards View (< 768px) */}
            <div className="md:hidden divide-y divide-outline-variant/20">
              {requests.map((item) => (
                <div key={item.viewing_id || item.id} className="p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface line-clamp-1">
                        {item.property_title || item.accommodationTitle || 'Property'}
                      </h3>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                        <span>{item.student_name || item.contactPhone || 'Student'}</span>
                      </p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-on-surface font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                      <span>
                        {item.requested_datetime
                          ? new Date(item.requested_datetime).toLocaleString()
                          : `${item.preferredDate || ''} — ${item.preferredTimeSlot || ''}`}
                      </span>
                    </div>
                    {(item.message || item.studentNotes) && (
                      <p className="text-on-surface-variant italic pt-1 border-t border-outline-variant/20">
                        "{item.message || item.studentNotes}"
                      </p>
                    )}
                  </div>

                  {item.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(item.viewing_id || item.id, 'accepted')}
                        className="py-2.5 px-3 rounded-lg bg-[#059669] text-white text-xs font-heading font-bold text-center shadow-xs active:scale-98 transition-transform"
                      >
                        Accept Walkthrough
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(item.viewing_id || item.id, 'rejected')}
                        className="py-2.5 px-3 rounded-lg bg-surface-container text-error text-xs font-heading font-bold text-center border border-error/20 active:scale-98 transition-transform"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
