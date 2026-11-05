import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { viewingsService } from '../services/viewings.service';
import { accommodationsService } from '../services/accommodations.service';
import { REAL_NOTIFICATIONS } from '../data/accommodationsData';

import { formatMWK } from '../utils/formatMWK';
import { ListingCard } from '../components/listings/ListingCard';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'requests';
  const { user, savedListingIds, toggleSaveListing } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState(REAL_NOTIFICATIONS);
  const [reviewModal, setReviewModal] = useState({ open: false, accommodationId: null, title: '', rating: 5, comment: '' });

  // Automatic role redirection: Landlords belong on Landlord Portal, Admins on Admin Console
  React.useEffect(() => {
    if (user?.role === 'landlord') {
      navigate('/landlord/dashboard', { replace: true });
    } else if (user?.role === 'admin' || user?.email === 'admin@campusnest.mw') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  if (user?.role === 'landlord' || user?.role === 'admin' || user?.email === 'admin@campusnest.mw') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-surface-container border-t-primary rounded-full animate-spin" />
        <span className="mt-3 font-heading text-xs font-semibold text-primary">
          Redirecting to {user?.role === 'landlord' ? 'Landlord Portal' : 'Admin Console'}...
        </span>
      </div>
    );
  }

  const switchTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Fetch Viewings
  const { data: viewings = [], isLoading: isLoadingViewings } = useQuery({
    queryKey: ['viewings'],
    queryFn: () => viewingsService.getViewings(),
  });

  // Fetch Saved Listings
  const { data: allListingsData } = useQuery({
    queryKey: ['accommodations', 'all-for-dashboard'],
    queryFn: () => accommodationsService.getAccommodations({ limit: 50 }),
  });

  const savedListings = (allListingsData?.data || []).filter((item) =>
    savedListingIds.includes(item.id)
  );

  // Cancel viewing mutation
  const cancelMutation = useMutation({
    mutationFn: (id) => viewingsService.cancelViewing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
    },
  });

  // Review mutation (SRS FR-16)
  const reviewMutation = useMutation({
    mutationFn: ({ accommodationId, rating, comment }) =>
      accommodationsService.submitReview(accommodationId, { rating, comment }),
    onSuccess: () => {
      alert('Thank you! Your verified accommodation review was submitted.');
      setReviewModal({ open: false, accommodationId: null, title: '', rating: 5, comment: '' });
    },
  });

  const unreadAlertsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col w-full pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-6">
      {/* Student Profile Hero Card */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/40 shadow-sm mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading font-extrabold text-xl shadow-sm ring-2 ring-primary-fixed">
                {user?.fullName
                  ? user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                  : 'CB'}
              </div>
              <span
                className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-tertiary-fixed border-2 border-surface-container-lowest"
                title="Active student session"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-bold text-lg sm:text-2xl text-on-surface leading-tight">
                  {user?.fullName || 'Chisomo Banda'}
                </h1>
                <Badge variant="verified" size="sm" icon="verified">
                  Verified Student
                </Badge>
              </div>

              <p className="font-heading text-xs sm:text-sm text-primary font-semibold truncate mt-0.5">
                {user?.university?.toUpperCase() || 'UNIMA'} • {user?.program || '2nd Year Student'}
              </p>
              <p className="font-sans text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span>{user?.campusLocation || 'Malawi University Campus'}</span>
              </p>
            </div>
          </div>

          <Link
            to="/profile"
            aria-label="Account Settings"
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
          </Link>
        </div>

        {/* Contact details line */}
        <div className="mt-4 pt-3 border-t border-outline-variant/30 flex flex-wrap items-center gap-x-6 gap-y-1 text-on-surface-variant font-sans text-xs">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-primary">call</span>
            <span>{user?.phone || '+265 991 600 735'}</span>
          </span>
          <span className="flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-[15px] text-primary">mail</span>
            <span>{user?.email || 'chisomo.banda@unima.ac.mw'}</span>
          </span>
        </div>

        {/* Quick Action Stat Counters */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-3 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={() => switchTab('requests')}
            className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${activeTab === 'requests' ? 'bg-primary/10 ring-1 ring-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
          >
            <span className="font-heading font-extrabold text-lg sm:text-xl text-primary leading-none">
              {viewings.length}
            </span>
            <span className="font-sans text-[11px] sm:text-xs text-on-surface-variant mt-1 font-medium">
              Viewings
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('saved')}
            className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${activeTab === 'saved' ? 'bg-secondary/10 ring-1 ring-secondary' : 'bg-surface-container hover:bg-surface-container-high'}`}
          >
            <span className="font-heading font-extrabold text-lg sm:text-xl text-secondary leading-none">
              {savedListings.length}
            </span>
            <span className="font-sans text-[11px] sm:text-xs text-on-surface-variant mt-1 font-medium">
              Saved Rooms
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('notifications')}
            className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${activeTab === 'notifications' ? 'bg-primary/10 ring-1 ring-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
          >
            <span className="font-heading font-extrabold text-lg sm:text-xl text-primary leading-none">
              {unreadAlertsCount}
            </span>
            <span className="font-sans text-[11px] sm:text-xs text-on-surface-variant mt-1 font-medium">
              Alerts
            </span>
          </button>
        </div>
      </section>

      {/* Civic Security Banner */}
      <section className="bg-secondary-fixed/50 rounded-xl p-3.5 border border-secondary-fixed-dim/40 flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <p className="font-sans text-xs text-on-secondary-fixed truncate">
            <strong>Free Viewings:</strong> Never pay advance booking fees via Airtel Money or Mpamba.
          </p>
        </div>
        <Link
          to="/safety"
          className="shrink-0 px-2.5 py-1 rounded-lg bg-secondary text-on-secondary text-xs font-heading font-bold"
        >
          Safety Guide
        </Link>
      </section>

      {/* Segmented Tabs Navigation */}
      <nav
        aria-label="Dashboard views"
        className="sticky top-16 z-30 bg-surface/95 backdrop-blur-md py-2 mb-4"
      >
        <div className="p-1 rounded-xl bg-surface-container flex items-center justify-between gap-1 shadow-sm border border-outline-variant/30">
          <button
            type="button"
            onClick={() => switchTab('requests')}
            className={`
              flex-1 py-2.5 px-2 rounded-lg text-center font-heading text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all
              ${activeTab === 'requests' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}
            `}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>Viewings</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary-container text-on-primary text-[10px] leading-[18px] inline-flex items-center justify-center">
              {viewings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('saved')}
            className={`
              flex-1 py-2.5 px-2 rounded-lg text-center font-heading text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all
              ${activeTab === 'saved' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}
            `}
          >
            <span className="material-symbols-outlined text-[16px]">bookmark</span>
            <span>Saved Rooms</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-surface-variant text-on-surface-variant text-[10px] leading-[18px] inline-flex items-center justify-center">
              {savedListings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('notifications')}
            className={`
              flex-1 py-2.5 px-2 rounded-lg text-center font-heading text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all
              ${activeTab === 'notifications' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}
            `}
          >
            <span className="material-symbols-outlined text-[16px]">notifications</span>
            <span>Alerts</span>
            {unreadAlertsCount > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* TAB CONTENT */}

      {/* TAB 1: VIEWINGS */}
      {activeTab === 'requests' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base sm:text-lg text-on-surface">
              Scheduled Walkthroughs ({viewings.length})
            </h2>
            <Link
              to="/explore"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>+ Book another viewing</span>
            </Link>
          </div>

          {isLoadingViewings ? (
            <div className="p-8 text-center text-xs text-on-surface-variant">Loading viewings...</div>
          ) : viewings.length === 0 ? (
            <EmptyState
              icon="calendar_month"
              title="No active viewings scheduled"
              description="Explore rooms near your university gate and schedule a free in-person tour."
              actionLabel="Explore Hostels"
              onAction={() => navigate('/explore')}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {viewings.map((viewing) => {
                const isConfirmed = viewing.status === 'confirmed';
                const isPending = viewing.status === 'pending';
                const isCompleted = viewing.status === 'completed';
                const isCancelled = viewing.status === 'cancelled';

                return (
                  <article
                    key={viewing.id}
                    className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-outline-variant/20">
                      <div>
                        <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                          Walkthrough Request
                        </span>
                        <h3 className="font-heading font-bold text-base text-on-surface">
                          <Link to={`/listings/${viewing.accommodationId}`} className="hover:text-primary transition-colors">
                            {viewing.accommodationTitle}
                          </Link>
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                          <span>{viewing.accommodationArea}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isConfirmed && <Badge variant="verified" icon="check_circle">Confirmed by Host</Badge>}
                        {isPending && <Badge variant="warning" icon="schedule">Pending Confirmation</Badge>}
                        {isCompleted && <Badge variant="neutral" icon="done_all">Completed</Badge>}
                        {isCancelled && <Badge variant="error" icon="cancel">Cancelled</Badge>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-surface-container flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                        <div>
                          <span className="text-on-surface-variant block text-[10px]">Date</span>
                          <strong className="text-on-surface font-heading">{viewing.preferredDate}</strong>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-surface-container flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                        <div>
                          <span className="text-on-surface-variant block text-[10px]">Time Slot</span>
                          <strong className="text-on-surface font-heading">{viewing.preferredTimeSlot}</strong>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-surface-container flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                        <div>
                          <span className="text-on-surface-variant block text-[10px]">Rent</span>
                          <strong className="text-on-surface font-heading tnum">{formatMWK(viewing.price)} / mo</strong>
                        </div>
                      </div>
                    </div>

                    {viewing.statusNote && (
                      <p className="text-xs text-on-surface-variant bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                        {viewing.statusNote}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/20">
                      <div className="text-xs text-on-surface-variant">
                        <span>Host: <strong>{viewing.landlordName}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {viewing.landlordWhatsapp && (
                          <a
                            href={`https://wa.me/${viewing.landlordWhatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-heading font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                          >
                            <span className="material-symbols-outlined text-[16px]">chat</span>
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {isCompleted && (
                          <button
                            type="button"
                            onClick={() =>
                              setReviewModal({
                                open: true,
                                accommodationId: viewing.accommodationId,
                                title: viewing.accommodationTitle,
                                rating: 5,
                                comment: '',
                              })
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-heading font-bold bg-primary text-on-primary hover:bg-primary-container shadow-xs active:scale-95 transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">rate_review</span>
                            <span>Rate & Review</span>
                          </button>
                        )}

                        {!isCancelled && !isCompleted && (
                          <button
                            type="button"
                            onClick={() => cancelMutation.mutate(viewing.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-heading font-semibold text-error hover:bg-error-container/40 active:scale-95 transition-transform"
                          >
                            Cancel Slot
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: SAVED LISTINGS */}
      {activeTab === 'saved' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base sm:text-lg text-on-surface">
              Saved Hostels ({savedListings.length})
            </h2>
            <Link
              to="/explore"
              className="text-xs font-bold text-primary hover:underline"
            >
              Find More Rooms
            </Link>
          </div>

          {savedListings.length === 0 ? (
            <EmptyState
              icon="bookmark_border"
              title="No saved hostels yet"
              description="Save student rooms by clicking the heart button on any listing card to compare them later."
              actionLabel="Explore Verified Hostels"
              onAction={() => navigate('/explore')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onToggleSave={toggleSaveListing} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base sm:text-lg text-on-surface">
              Student Alerts & Announcements ({notifications.length})
            </h2>
            <button
              type="button"
              onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Mark all as read
            </button>
          </div>

          {notifications.length === 0 ? (
            <EmptyState
              icon="notifications_off"
              title="No Notifications"
              description="You have no new alerts or announcements at this time."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`
                    p-4 rounded-xl border flex items-start gap-3 transition-colors
                    ${notif.read ? 'bg-surface-container-low border-outline-variant/30' : 'bg-surface-container-lowest border-primary/30 shadow-sm'}
                  `}
                >
                  <div
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5
                      ${notif.type === 'warning' ? 'bg-secondary-fixed text-secondary' : 'bg-primary/10 text-primary'}
                    `}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {notif.type === 'warning' ? 'warning' : 'notifications'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading font-bold text-xs sm:text-sm text-on-surface">
                        {notif.title}
                      </h3>
                      <span className="text-[10px] text-on-surface-variant shrink-0">{notif.timestamp}</span>
                    </div>
                    <p className="font-sans text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      {/* Review Submission Modal (SRS FR-16) */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface w-full max-w-md p-6 rounded-2xl border border-outline-variant/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-primary">
                Review Accommodation (FR-16)
              </h3>
              <button
                type="button"
                onClick={() => setReviewModal({ open: false, accommodationId: null, title: '', rating: 5, comment: '' })}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Share your verified walkthrough experience for <strong>{reviewModal.title}</strong> to help fellow scholars.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                reviewMutation.mutate({
                  accommodationId: reviewModal.accommodationId,
                  rating: reviewModal.rating,
                  comment: reviewModal.comment,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewModal({ ...reviewModal, rating: star })}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[28px]">
                        {star <= reviewModal.rating ? 'star' : 'star_outline'}
                      </span>
                    </button>
                  ))}
                  <span className="text-xs font-bold text-on-surface ml-2">
                    {reviewModal.rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Your Feedback *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewModal.comment}
                  onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })}
                  placeholder="How was the water pressure, security, quietness, and distance to campus gate?"
                  className="w-full text-xs p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal({ open: false, accommodationId: null, title: '', rating: 5, comment: '' })}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-heading font-bold hover:bg-primary-container shadow-xs disabled:opacity-50"
                >
                  {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
