import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accommodationsService } from '../services/accommodations.service';
import { formatMWK } from '../utils/formatMWK';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import ViewingRequestForm from '../components/listings/ViewingRequestForm';
import GoogleMapLocation from '../components/maps/GoogleMapLocation';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isListingSaved, toggleSaveListing } = useAuth();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const {
    data: listing,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['accommodation', id],
    queryFn: () => accommodationsService.getAccommodationById(id),
    enabled: Boolean(id),
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saved = listing ? isListingSaved(listing.id) : false;

  const handleToggleSave = () => {
    if (!listing) return;
    toggleSaveListing(listing.id);
    showToast(saved ? 'Removed from saved' : 'Saved to your wishlist!');
  };

  const handleShare = async () => {
    if (navigator.share && listing) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out ${listing.title} on CampusNest Malawi`,
          url: window.location.href,
        });
      } catch {
        // Fallback
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6 w-full">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="w-full aspect-[16/10] rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 w-full">
        <ErrorMessage
          title="Listing Not Found"
          message="We could not find the student room you requested. It may have been unlisted or taken."
          onRetry={refetch}
        />
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/explore')}>
            Browse Other Hostels
          </Button>
        </div>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="flex flex-col w-full pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 bg-inverse-surface text-inverse-on-surface py-3 px-4 rounded-xl text-sm font-semibold shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2"
        >
          <span>{toastMessage}</span>
          <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">
            done_all
          </span>
        </div>
      )}

      {/* Top Navigation & Actions Bar */}
      <div className="border-b border-outline-variant/30 bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-primary text-xs sm:text-sm font-heading font-bold hover:underline active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to listings</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share property link"
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
            <button
              type="button"
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save to favorites'}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-secondary active:scale-90 transition-all"
            >
              <span
                className={`material-symbols-outlined text-[22px] ${saved ? 'text-secondary' : 'text-on-surface-variant'}`}
                style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
              >
                {saved ? 'favorite' : 'favorite_border'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full pt-4 flex flex-col gap-6">
        {/* Photo Gallery Carousel Card */}
        <div className="flex flex-col gap-2">
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-sm bg-surface-container-high group border border-outline-variant/40">
            <img
              src={images[activePhotoIndex]}
              alt={`${listing.title} view ${activePhotoIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/70 via-transparent to-black/20 pointer-events-none" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
              <span className="bg-primary text-on-primary font-heading font-semibold text-xs px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                <span>{listing.roomTypeName || 'Single Room'}</span>
              </span>
              {listing.availabilityStatus && (
                <span className="bg-secondary text-on-secondary font-heading font-bold text-xs px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">bolt</span>
                  <span>{listing.availabilityStatus}</span>
                </span>
              )}
            </div>

            {/* Photo Index Counter */}
            <div className="absolute bottom-3 right-3">
              <span className="bg-surface/90 backdrop-blur-md text-on-surface font-heading text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                <span>{activePhotoIndex + 1} of {images.length}</span>
              </span>
            </div>

            {/* Verified Badge on Photo */}
            <div className="absolute bottom-3 left-3">
              <span className="bg-tertiary-container text-on-tertiary-container font-heading text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>Verified Campus Spot</span>
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery Strip */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`
                    relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-container transition-all
                    ${activePhotoIndex === idx ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'}
                  `}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 right-1 text-center text-[10px] bg-on-surface/60 text-white font-semibold rounded px-1">
                    Photo {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title, General Location & Price Card */}
        <div className="flex flex-col gap-3">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface tracking-tight">
            {listing.title}
          </h1>

          {/* Location & Walking Distance */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2 text-primary font-heading font-semibold text-sm">
                <span className="material-symbols-outlined text-[18px] text-secondary">distance</span>
                <span>{listing.area}</span>
                {listing.distanceToGate && (
                  <>
                    <span className="text-outline-variant">•</span>
                    <span className="tnum">{listing.distanceToGate}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-[15px] text-tertiary">shield</span>
                <span>General neighborhood mapped — exact gate disclosed after confirming viewing.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('hostel-location-map');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-heading text-xs font-bold transition-colors w-fit border border-outline-variant/30 active:scale-95 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span>View on Map</span>
            </button>
          </div>

          {/* Pricing Bento Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container border border-outline-variant/40 flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-on-surface font-heading font-extrabold text-2xl sm:text-3xl tracking-tight tnum">
                  {formatMWK(listing.price)}
                </span>
                <span className="text-on-surface-variant text-sm font-sans"> / month</span>
              </div>
              <span className="bg-primary-fixed text-on-primary-fixed text-xs font-heading font-bold px-2.5 py-1 rounded-full">
                {listing.electricityType || 'Sub-metered'}
              </span>
            </div>

            <p className="text-on-surface-variant text-xs sm:text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-tertiary">water_drop</span>
              <span>{listing.utilitiesDetails || 'Water & trash collection included in base rent; ESCOM prepaid sub-metered.'}</span>
            </p>

            <div className="pt-2 border-t border-outline-variant/30 flex items-center gap-1.5 text-on-surface text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
              <span>Refundable Security Deposit: {formatMWK(listing.deposit)} (held securely in accordance with Malawian tenancy norms)</span>
            </div>
          </div>
        </div>

        {/* About this Accommodation */}
        <section className="flex flex-col gap-3">
          <h2 className="font-heading font-bold text-lg sm:text-xl text-on-surface">
            About this Student Room
          </h2>
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-4 text-sm text-on-surface-variant leading-relaxed">
            <p>{listing.description}</p>

            {listing.rules && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-outline-variant/30 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">menu_book</span>
                  <span><strong>Quiet Hours:</strong> {listing.rules.quietHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">local_library</span>
                  <span><strong>Campus Gate:</strong> {listing.rules.libraryDistance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">soup_kitchen</span>
                  <span><strong>Cooking:</strong> {listing.rules.cooking}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">support_agent</span>
                  <span><strong>Caretaker:</strong> {listing.rules.caretaker}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Campus Essentials & Amenities Grid */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-on-surface">
              Campus Essentials & Utilities
            </h2>
            <span className="text-xs font-heading font-bold uppercase text-primary tracking-wider">
              {listing.facilities?.length || 0} Amenities
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {listing.facilities?.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/40 flex items-start gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{f.icon || 'check_circle'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-xs text-on-surface">{f.label}</span>
                  <span className="text-[11px] text-on-surface-variant leading-tight mt-0.5">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hostel Location & Directions (Google Maps) */}
        <section id="hostel-location-map" className="flex flex-col gap-3 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-primary">map</span>
              <h2 className="font-heading font-bold text-lg sm:text-xl text-on-surface">
                Location & Directions
              </h2>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">
              {listing.area}
            </span>
          </div>

          <div className="rounded-2xl bg-surface-container-low p-4 sm:p-5 border border-outline-variant/40 flex flex-col gap-3">
            <GoogleMapLocation
              mode="view"
              latitude={listing.latitude}
              longitude={listing.longitude}
              title={listing.title}
              area={listing.area}
              universityId={listing.universityId || listing.university_nearby}
              height="360px"
            />
          </div>
        </section>

        {/* Verification Audit Section */}
        <section className="rounded-2xl bg-surface-container-low p-5 border border-outline-variant/40 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
              <h2 className="font-heading font-bold text-base sm:text-lg text-on-surface">
                CampusNest Trust & Verification Audit
              </h2>
            </div>
            <span className="bg-tertiary-container text-on-tertiary-container text-xs font-heading font-bold px-2.5 py-0.5 rounded-full">
              Audit Verified
            </span>
          </div>

          <p className="text-xs italic text-on-surface-variant">
            "We verify physical facts, not assumptions."
          </p>

          <div className="flex flex-col gap-2">
            {listing.verification?.audits?.map((audit, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-surface border border-outline-variant/30">
                <span
                  className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div className="flex flex-col text-xs">
                  <span className="text-on-surface">
                    <strong className="font-heading font-bold text-primary">{audit.title}</strong>{' '}
                    <span className="text-on-surface-variant">({audit.date})</span>
                  </span>
                  <span className="text-on-surface-variant text-[11px] mt-0.5">{audit.detail}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Explicit Legal & Safety Disclaimer (Never Claim 100% Safe) */}
          <div className="p-3.5 rounded-xl bg-error-container text-on-error-container flex items-start gap-2.5 border border-error/20">
            <span className="material-symbols-outlined text-[20px] text-error shrink-0 mt-0.5">warning</span>
            <p className="text-xs leading-relaxed">
              <strong className="font-bold">Important Disclaimer:</strong> CampusNest performs rigorous spot audits but never claims 100% immunity from disputes. Always inspect the premises in person. Exact address is withheld until your viewing is confirmed. <span className="font-bold underline">Never pay any advance fee</span> before inspecting.
            </p>
          </div>

          {/* Report Listing Button */}
          <Link
            to={`/listings/${listing.id}/report`}
            className="flex items-center justify-center gap-1.5 text-error text-xs font-heading font-bold py-1 hover:underline active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">flag</span>
            <span>Notice inaccurate info or suspicious requests? Report this listing</span>
          </Link>
        </section>

        {/* Host Profile Card */}
        {listing.landlord && (
          <section className="p-5 rounded-2xl bg-surface-container border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={listing.landlord.avatar}
                  alt={listing.landlord.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-fixed"
                />
                <div className="absolute -bottom-1 -right-1 bg-tertiary text-on-tertiary rounded-full p-0.5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="font-heading font-bold text-base text-on-surface">
                  {listing.landlord.name}
                </h3>
                <p className="text-xs text-on-surface-variant">{listing.landlord.role}</p>
                <div className="flex items-center gap-1 text-tertiary text-xs font-semibold mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span>{listing.landlord.responseSpeed}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                icon="chat"
                className="flex-1 sm:flex-none"
                onClick={() => setContactModalOpen(true)}
              >
                Contact Host
              </Button>
              <Button
                variant="accent"
                size="sm"
                icon="calendar_month"
                className="flex-1 sm:flex-none"
                onClick={() => setViewingModalOpen(true)}
              >
                Book Viewing
              </Button>
            </div>
          </section>
        )}

        {/* Student Reviews Section */}
        {listing.reviews && listing.reviews.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-lg sm:text-xl text-on-surface">
                  Student Reviews
                </h2>
                <span className="bg-surface-container text-on-surface text-xs font-heading font-semibold px-2 py-0.5 rounded-full">
                  {listing.reviews.length} verified
                </span>
              </div>
              <div className="flex items-center gap-1 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span>4.8 / 5.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {listing.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-heading font-bold flex items-center justify-center text-xs">
                        {rev.avatarInitials}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-xs text-on-surface">{rev.author}</h4>
                        <p className="text-[11px] text-on-surface-variant">{rev.program}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-secondary">
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="font-bold text-xs text-on-surface ml-0.5">{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface leading-relaxed mt-1">"{rev.comment}"</p>
                  <span className="text-[10px] text-on-surface-variant">{rev.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Booking Bar (Optimized for Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-outline-variant/40 px-4 py-3 pb-safe shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col shrink-0">
            <span className="font-heading font-extrabold text-base sm:text-lg text-primary tnum leading-tight">
              {formatMWK(listing.price)}
            </span>
            <span className="text-[11px] text-on-surface-variant">/ month</span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              type="button"
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save to favorites'}
              className="h-11 px-3 rounded-lg bg-surface-container text-on-surface text-xs font-heading font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform shrink-0"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${saved ? 'text-secondary' : 'text-on-surface-variant'}`}
                style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
              >
                {saved ? 'favorite' : 'favorite_border'}
              </span>
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="h-11 px-3 rounded-lg bg-surface-container text-primary text-xs font-heading font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform shrink-0"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">chat</span>
              <span className="hidden sm:inline">Contact</span>
            </button>

            <Button
              variant="accent"
              size="md"
              icon="calendar_month"
              onClick={() => setViewingModalOpen(true)}
              className="flex-1 max-w-xs"
            >
              Request a Viewing
            </Button>
          </div>
        </div>
      </div>

      {/* Viewing Request Modal */}
      <Modal
        isOpen={viewingModalOpen}
        onClose={() => setViewingModalOpen(false)}
        title="Schedule In-Person Walkthrough"
        icon="calendar_month"
      >
        <ViewingRequestForm
          listing={listing}
          onSuccess={() => {
            setViewingModalOpen(false);
            showToast('Viewing requested! The host has been notified.');
          }}
          onCancel={() => setViewingModalOpen(false)}
        />
      </Modal>

      {/* Contact Host Modal */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title="Contact Landlord / Caretaker"
        icon="support_agent"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
            <img
              src={listing.landlord?.avatar}
              alt={listing.landlord?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h4 className="font-heading font-bold text-sm text-on-surface">
                {listing.landlord?.name}
              </h4>
              <p className="text-xs text-on-surface-variant">{listing.landlord?.role}</p>
            </div>
          </div>

          <div className="p-3 bg-secondary-fixed/50 rounded-xl text-xs text-on-secondary-fixed">
            <strong className="block mb-1">Safety Reminder:</strong>
            Never pay any advance booking fees or key deposits via mobile money before inspecting the room in person.
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <a
              href={`https://wa.me/${listing.landlord?.whatsapp || '265991600735'}?text=${encodeURIComponent(`Hello Mr. Phiri, I am interested in viewing ${listing.title} on CampusNest.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-full rounded-lg bg-[#25D366] text-white text-sm font-heading font-bold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>Open WhatsApp Chat</span>
            </a>

            <a
              href={`tel:${listing.landlord?.phone || '+265991600735'}`}
              className="h-12 w-full rounded-lg bg-surface-container text-on-surface text-sm font-heading font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-high active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
              <span>Direct Phone Call ({listing.landlord?.phone || '+265 991 600 735'})</span>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
