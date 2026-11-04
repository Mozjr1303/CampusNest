import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accommodationsService } from '../services/accommodations.service';
import { UNIVERSITIES } from '../constants/universities';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingCardSkeleton } from '../components/ui/Skeleton';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';

function CampusCard({ uni, isSelected, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = Boolean(uni.image) && !imgFailed;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative rounded-xl overflow-hidden aspect-[4/3] text-left transition-all duration-200 border flex flex-col justify-between
        ${
          isSelected
            ? 'ring-2 ring-primary ring-offset-2 border-primary shadow-md scale-[1.02]'
            : 'border-outline-variant/30 hover:shadow-md hover:border-primary/50 hover:scale-[1.01]'
        }
        ${!showPhoto ? `bg-gradient-to-br ${uni.bgColor || 'from-[#002244] to-[#001122]'}` : 'bg-surface-container'}
      `}
    >
      {showPhoto ? (
        <>
          <img
            src={uni.image}
            alt={`${uni.short} Campus in ${uni.city}`}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-3 pb-8">
          {uni.logo ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-white/20 p-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <img
                src={uni.logo}
                alt={`${uni.short} Logo`}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white font-heading font-extrabold text-base">
              {uni.short}
            </div>
          )}
        </div>
      )}

      {/* Top logo watermark if photo exists */}
      {showPhoto && uni.logo && (
        <div className="relative z-10 p-2">
          <div className="w-7 h-7 rounded-full bg-white/95 shadow-xs p-0.5 flex items-center justify-center">
            <img
              src={uni.logo}
              alt=""
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>
      )}

      {/* Bottom Text & Location */}
      <div className="relative z-10 mt-auto p-2.5 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/45 to-transparent w-full">
        <span className="font-heading font-bold text-xs sm:text-sm text-white leading-tight drop-shadow-sm truncate">
          {uni.short}
        </span>
        <span className="text-[10px] text-white/80 font-medium truncate">
          {uni.city}
        </span>
        {isSelected && (
          <span className="mt-1 w-fit text-[9px] font-bold bg-primary px-1.5 py-0.5 rounded text-on-primary shadow-xs">
            Selected
          </span>
        )}
      </div>
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  // Search Bento State
  const [university, setUniversity] = useState('unima');
  const [maxRent, setMaxRent] = useState('80000');
  const [roomType, setRoomType] = useState('all');
  const [verifiedUtilitiesOnly, setVerifiedUtilitiesOnly] = useState(true);

  // Active Campus Pill State
  const [selectedCampus, setSelectedCampus] = useState('all');

  // Fetch Featured Listings
  const {
    data: listingsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['accommodations', 'featured', selectedCampus],
    queryFn: () =>
      accommodationsService.getAccommodations({
        university: selectedCampus !== 'all' ? selectedCampus : undefined,
        limit: 4,
      }),
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (university) params.set('university', university);
    if (maxRent && maxRent !== 'any') params.set('maxPrice', maxRent);
    if (roomType && roomType !== 'all') params.set('type', roomType);
    if (verifiedUtilitiesOnly) params.set('facilities', 'borehole_water,solar_backup');
    navigate(`/explore?${params.toString()}`);
  };

  const handleCampusPillClick = (campusId) => {
    setSelectedCampus(campusId);
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Full-Screen Viewport Hero Section with User Provided Student Room Image */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden border-b border-outline-variant/30">
        {/* Background Image Container */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/hero-room.jpg"
            alt="Authentic Student Accommodation Room in Malawi"
            className="w-full h-full object-cover object-center scale-100"
          />
          {/* Atmospheric Warm Civic Gradient Overlay for High Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#001817]/95 via-[#002b28]/70 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001817]/85 via-[#002b28]/50 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto w-full flex flex-col gap-6 my-auto pt-4">
          {/* Title & Subhead */}
          <div className="flex flex-col gap-2 max-w-3xl">
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-white font-extrabold tracking-tight leading-[1.15] drop-shadow-md">
              Find your student home near campus
            </h1>
            <p className="font-sans text-sm sm:text-lg text-white/90 font-medium leading-relaxed max-w-2xl drop-shadow-sm">
              Browse verified student hostels within walking distance of Malawian university gates. Clear pricing in Malawi Kwacha (MWK) with zero advance booking fees.
            </p>
          </div>

          {/* Search Form Bento Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/80 flex flex-col gap-4 text-on-surface">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
              {/* University Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="campus-select"
                  className="font-heading text-xs sm:text-sm text-on-surface font-bold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">school</span>
                  <span>Select University / Area</span>
                </label>
                <div className="relative flex items-center">
                  <select
                    id="campus-select"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full h-12 pl-3 pr-10 rounded-lg bg-surface-container-low text-on-surface font-sans text-sm sm:text-base appearance-none focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30"
                  >
                    <option value="unima">UNIMA — Chikanda / Chirunga, Zomba</option>
                    <option value="must">MUST — Goliati / Thyolo</option>
                    <option value="kuhes">KUHeS & MUBAS — Chichiri, Blantyre</option>
                    <option value="luanar">LUANAR — Bunda / Turn-off, Lilongwe</option>
                    <option value="mzuni">MZUNI — Luwinga, Mzuzu</option>
                    <option value="dmi">DMI — Mangochi Boma / St. John, Mangochi</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 pointer-events-none text-on-surface-variant text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Price & Type 2-Col Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Max Rent Filter */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="rent-select"
                    className="font-heading text-xs sm:text-sm text-on-surface font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
                    <span>Max Monthly Rent</span>
                  </label>
                  <div className="relative flex items-center">
                    <select
                      id="rent-select"
                      value={maxRent}
                      onChange={(e) => setMaxRent(e.target.value)}
                      className="w-full h-12 pl-3 pr-9 rounded-lg bg-surface-container-low text-on-surface font-sans text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30"
                    >
                      <option value="50000">≤ MWK 50,000</option>
                      <option value="80000">≤ MWK 80,000</option>
                      <option value="120000">≤ MWK 120,000</option>
                      <option value="any">Any Budget</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 pointer-events-none text-on-surface-variant text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Room Type Filter */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="room-type"
                    className="font-heading text-xs sm:text-sm text-on-surface font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">bed</span>
                    <span>Room Style</span>
                  </label>
                  <div className="relative flex items-center">
                    <select
                      id="room-type"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full h-12 pl-3 pr-9 rounded-lg bg-surface-container-low text-on-surface font-sans text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30"
                    >
                      <option value="all">All Room Types</option>
                      <option value="single">Single Room</option>
                      <option value="shared">Shared 2-Bed</option>
                      <option value="bedsitter">Self-Contained Bedsitter</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 pointer-events-none text-on-surface-variant text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Borehole & Power Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                <input
                  type="checkbox"
                  checked={verifiedUtilitiesOnly}
                  onChange={(e) => setVerifiedUtilitiesOnly(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
                <span className="font-sans text-xs sm:text-sm text-on-surface-variant flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-[16px] text-tertiary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span>Verified Borehole Water & Backup Power Only</span>
                </span>
              </label>

              {/* Primary Action Button */}
              <Button type="submit" variant="accent" size="lg" fullWidth icon="search">
                Search Verified Rooms
              </Button>
            </form>
          </div>

          {/* Bottom Scroll Indicator */}
          <div className="flex justify-center pt-2">
            <a
              href="#campuses-section"
              className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-white/80 hover:text-white transition-colors py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 active:scale-95"
            >
              <span>Explore Campuses Below</span>
              <span className="material-symbols-outlined text-[16px] animate-bounce">
                keyboard_arrow_down
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Popular Campuses Horizontal Selector */}
      <section id="campuses-section" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 w-full scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px] shrink-0">account_balance</span>
            <div>
              <h2 className="font-heading font-bold text-base sm:text-lg text-on-surface">
                Explore by University Campus
              </h2>
              <p className="font-sans text-xs text-on-surface-variant">
                Select your university to view verified hostels within walking distance of the gates
              </p>
            </div>
          </div>
          <Link
            to="/explore"
            className="self-end sm:self-auto text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
          >
            <span>All Hostels</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        {/* Visual Campus Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 mb-4">
          {UNIVERSITIES.filter((uni) => uni.id !== 'all').map((uni) => {
            const isSelected = selectedCampus === uni.id;
            return (
              <CampusCard
                key={uni.id}
                uni={uni}
                isSelected={isSelected}
                onClick={() => handleCampusPillClick(uni.id)}
              />
            );
          })}
        </div>

        {/* Scrollable Pills */}
        <div
          role="tablist"
          aria-label="Campuses"
          className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1"
        >
          {UNIVERSITIES.map((uni) => {
            const isSelected = selectedCampus === uni.id;
            return (
              <button
                key={uni.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleCampusPillClick(uni.id)}
                className={`
                  h-9 px-3.5 rounded-full font-heading text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all
                  ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }
                `}
              >
                {uni.id === 'all' ? (
                  <span className="material-symbols-outlined text-[16px]">domain</span>
                ) : uni.logo ? (
                  <img src={uni.logo} alt="" className="w-4 h-4 object-contain rounded-full" />
                ) : null}
                <span>{uni.short}</span>
                {uni.city && uni.id !== 'all' && (
                  <span className="opacity-75 text-[11px]">({uni.city})</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Verified Listings Section */}
      <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-on-surface tracking-tight">
              Featured Verified Hostels
            </h2>
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Inspected in person with verified SIM identity, National ID, and active borehole water.
            </p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>All Listings</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ListingCardSkeleton />
            <ListingCardSkeleton />
            <ListingCardSkeleton />
            <ListingCardSkeleton />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <ErrorMessage
            title="Failed to load hostels"
            message="We could not connect to the accommodations registry. Please retry."
            onRetry={refetch}
          />
        )}

        {/* Listings Grid */}
        {!isLoading && !isError && listingsData?.data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listingsData.data.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <div className="sm:hidden mt-2 text-center">
          <Link
            to="/explore"
            className="w-full py-3 inline-flex items-center justify-center gap-1 font-heading font-bold text-sm text-primary rounded-lg bg-surface-container"
          >
            <span>Browse All Available Hostels</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* How CampusNest Works Bento Section */}
      <section className="py-10 bg-surface-container-low my-6 border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-secondary">
              Designed For Malawian Scholars
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary">
              How CampusNest Protects You
            </h2>
            <p className="font-sans text-sm text-on-surface-variant">
              From finding rooms near Chancellor College, MUST, KUHeS, MUBAS, LUANAR or MZUNI to moving in safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 flex flex-col gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-heading font-extrabold text-xl">
                1
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                Filter by Campus Walking Distance
              </h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Filter rooms within minutes of your university gate. See actual walking times and general neighborhood zones without exposing private landlord gates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 flex flex-col gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-heading font-extrabold text-xl">
                2
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                Free In-Person Walkthrough
              </h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Schedule a physical viewing around your class timetable. Tour the room, test solar backup lights, check water pressure, and inspect security grilles at zero cost.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 flex flex-col gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center font-heading font-extrabold text-xl">
                3
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                Strict Zero Advance Fee Policy
              </h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Never send mobile money before entering the room. CampusNest safeguards students from ghost listings and fraudulent middlemen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Fraud Prevention Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4">
        <div className="bg-surface-container-high rounded-2xl p-5 sm:p-6 border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-primary">
                Verified Landlords & Physical Audits
              </h3>
              <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-0.5 max-w-2xl leading-relaxed">
                Every registered property owner has had their phone SIM verified via OTP and National Registration Bureau (NRB) card audited. We spot-check water pumps and boundary security.
              </p>
            </div>
          </div>

          <Link
            to="/safety"
            className="shrink-0 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-heading font-semibold text-xs sm:text-sm hover:bg-primary-container active:scale-98 transition-all"
          >
            Read Safety Standards
          </Link>
        </div>
      </section>
    </div>
  );
}
