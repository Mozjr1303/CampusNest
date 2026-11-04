import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accommodationsService } from '../services/accommodations.service';
import { UNIVERSITIES } from '../constants/universities';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import { formatMWK } from '../utils/formatMWK';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial query params
  const paramUni = searchParams.get('university') || 'all';
  const paramArea = searchParams.get('area') || 'all';
  const paramMaxPrice = searchParams.get('maxPrice') || '120000';
  const paramType = searchParams.get('type') || 'all';
  const paramSort = searchParams.get('sort') || 'newest';
  const paramPage = Number(searchParams.get('page')) || 1;
  const paramFacilities = searchParams.get('facilities')
    ? searchParams.get('facilities').split(',')
    : [];

  // Local filter states
  const [university, setUniversity] = useState(paramUni);
  const [area, setArea] = useState(paramArea);
  const [maxPrice, setMaxPrice] = useState(paramMaxPrice);
  const [roomType, setRoomType] = useState(paramType);
  const [sort, setSort] = useState(paramSort);
  const [page, setPage] = useState(paramPage);
  const [selectedFacilities, setSelectedFacilities] = useState(paramFacilities);

  // Mobile filters drawer toggle
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync state changes to searchParams
  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || v === 'all' || (Array.isArray(v) && v.length === 0)) {
        params.delete(k);
      } else if (Array.isArray(v)) {
        params.set(k, v.join(','));
      } else {
        params.set(k, String(v));
      }
    });
    setSearchParams(params);
  };

  const handleUniversityChange = (val) => {
    setUniversity(val);
    setArea('all');
    setPage(1);
    updateUrlParams({ university: val, area: 'all', page: 1 });
  };

  const handleBudgetChange = (val) => {
    setMaxPrice(val);
    setPage(1);
    updateUrlParams({ maxPrice: val, page: 1 });
  };

  const handleTypeToggle = (typeVal) => {
    const nextType = roomType === typeVal ? 'all' : typeVal;
    setRoomType(nextType);
    setPage(1);
    updateUrlParams({ type: nextType, page: 1 });
  };

  const handleFacilityToggle = (facId) => {
    const next = selectedFacilities.includes(facId)
      ? selectedFacilities.filter((f) => f !== facId)
      : [...selectedFacilities, facId];
    setSelectedFacilities(next);
    setPage(1);
    updateUrlParams({ facilities: next, page: 1 });
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    updateUrlParams({ sort: newSort });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setUniversity('all');
    setArea('all');
    setMaxPrice('120000');
    setRoomType('all');
    setSelectedFacilities([]);
    setSort('newest');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  // TanStack Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['accommodations', university, area, maxPrice, roomType, selectedFacilities, sort, page],
    queryFn: () =>
      accommodationsService.getAccommodations({
        university: university !== 'all' ? university : undefined,
        area: area !== 'all' ? area : undefined,
        maxPrice: maxPrice !== 'any' ? maxPrice : undefined,
        type: roomType !== 'all' ? roomType : undefined,
        facilities: selectedFacilities.length > 0 ? selectedFacilities : undefined,
        sort,
        page,
        limit: 6,
      }),
  });

  const listings = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Top Greeting & Low Data Status */}
      <section className="bg-surface-container-low border-b border-outline-variant/30 py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">school</span>
                <span>2025/2026 Academic Intake</span>
              </span>
              <span className="inline-flex items-center gap-1 text-on-surface-variant text-xs">
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                <span>Low-Data Mode Active</span>
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">
              Explore Verified Student Rooms
            </h1>
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant">
              Find safe student accommodation within walking distance of your campus gate in Malawi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Drawer Button */}
            <Button
              variant="outline"
              size="md"
              icon="tune"
              className="md:hidden"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            >
              Filters {selectedFacilities.length > 0 || roomType !== 'all' ? `(${selectedFacilities.length + (roomType !== 'all' ? 1 : 0)})` : ''}
            </Button>
          </div>
        </div>
      </section>

      {/* University Horizontal Quick Selector Pills */}
      <section className="border-b border-outline-variant/30 py-3 px-4 sm:px-6 bg-surface">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar items-center">
          {UNIVERSITIES.map((u) => {
            const isSelected = university === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => handleUniversityChange(u.id)}
                className={`
                  px-4 h-10 rounded-full font-heading text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all
                  ${
                    isSelected
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }
                `}
              >
                {u.id === 'all' ? (
                  <span className="material-symbols-outlined text-[16px]">domain</span>
                ) : u.logo ? (
                  <img src={u.logo} alt="" className="w-5 h-5 object-contain rounded-full bg-white p-0.5 border border-outline-variant/30 shrink-0" />
                ) : null}
                <span>{u.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area: Sidebar Filters & Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Desktop Filter Sidebar / Mobile Collapsible Drawer */}
        <aside
          className={`
            md:block md:col-span-1
            ${showFiltersMobile ? 'block' : 'hidden'}
          `}
        >
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 shadow-sm flex flex-col gap-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2 text-primary font-heading font-bold text-base">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                <span>Refine Search</span>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Clear all
              </button>
            </div>

            {/* University Vicinity / Area Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filter-area" className="text-xs font-bold font-heading text-on-surface uppercase tracking-wider">
                Select Campus Vicinity
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3.5 text-primary text-[18px] pointer-events-none">
                  location_city
                </span>
                <select
                  id="filter-area"
                  value={university}
                  onChange={(e) => handleUniversityChange(e.target.value)}
                  className="w-full h-11 pl-9 pr-8 bg-surface-container-low rounded-lg text-xs font-sans text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none border border-outline-variant/30"
                >
                  <option value="all">Across All Campuses in Malawi</option>
                  <option value="unima">UNIMA — Chikanda / Chirunga (Zomba)</option>
                  <option value="must">MUST — Goliati / Ndata (Thyolo)</option>
                  <option value="kuhes">KUHeS & MUBAS — Chichiri / Maselema (BT)</option>
                  <option value="luanar">LUANAR — Bunda Campus (Lilongwe)</option>
                  <option value="mzuni">MZUNI — Luwinga / Zolozolo (Mzuzu)</option>
                  <option value="dmi">DMI — Mangochi Boma / St. John (Mangochi)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-on-surface-variant text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Room Style Quick Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold font-heading text-on-surface uppercase tracking-wider">
                Preferred Layout
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'single', label: 'Single Room', icon: 'single_bed' },
                  { id: 'bedsitter', label: 'Self-Contained', icon: 'apartment' },
                  { id: 'shared', label: 'Shared 2-Bed', icon: 'group' },
                  { id: 'hostel-block', label: 'Hostel Block', icon: 'holiday_village' },
                ].map((item) => {
                  const active = roomType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTypeToggle(item.id)}
                      className={`
                        h-10 px-2 rounded-lg text-xs font-heading font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all
                        ${
                          active
                            ? 'bg-primary-container text-on-primary shadow-sm'
                            : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                        }
                      `}
                    >
                      <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monthly Budget Slider in MWK */}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-heading text-on-surface uppercase tracking-wider">
                  Max Rent (MWK)
                </span>
                <span className="font-heading font-bold text-sm text-primary tnum">
                  {formatMWK(maxPrice)}
                </span>
              </div>
              <div className="w-full flex items-center gap-2">
                <span className="text-[11px] text-on-surface-variant">35k</span>
                <input
                  type="range"
                  min="35000"
                  max="180000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  aria-label="Monthly budget in Malawi Kwacha"
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-on-surface-variant">180k+</span>
              </div>
            </div>

            {/* Facilities Checkboxes */}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
              <span className="text-xs font-bold font-heading text-on-surface uppercase tracking-wider">
                Must-Have Facilities
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'borehole_water', label: '24/7 Borehole Water', icon: 'solar_power' },
                  { id: 'solar_backup', label: 'Backup Solar Lights', icon: 'light_mode' },
                  { id: 'burglar_bars', label: 'Welded Burglar Proofing', icon: 'grid_view' },
                  { id: 'ensuite_bath', label: 'Private Bathroom', icon: 'shower' },
                  { id: 'wifi', label: 'Fiber Wi-Fi Included', icon: 'wifi' },
                ].map((f) => (
                  <label
                    key={f.id}
                    className="flex items-center gap-2 cursor-pointer select-none text-xs text-on-surface-variant hover:text-on-surface"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFacilities.includes(f.id)}
                      onChange={() => handleFacilityToggle(f.id)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-[16px] text-primary">{f.icon}</span>
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Button */}
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={handleClearFilters}
              icon="restart_alt"
            >
              Reset Filters
            </Button>

            {/* Mobile Done Button */}
            {showFiltersMobile && (
              <Button
                variant="accent"
                size="sm"
                fullWidth
                className="md:hidden"
                onClick={() => setShowFiltersMobile(false)}
                icon="check"
              >
                Apply & View Results ({pagination.total})
              </Button>
            )}
          </div>
        </aside>

        {/* Listings Result Column */}
        <main className="col-span-1 md:col-span-3 flex flex-col gap-5">
          {/* Controls Bar: Count, Sort Dropdown */}
          <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-on-surface-variant">
              <span className="font-heading font-bold text-on-surface text-base">
                {isLoading ? 'Searching...' : `${pagination.total} listings available`}
              </span>
              {university !== 'all' && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold text-xs">
                  {university.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <label htmlFor="sort-select" className="text-xs font-semibold text-on-surface-variant shrink-0">
                Sort by:
              </label>
              <div className="relative">
                <select
                  id="sort-select"
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30"
                >
                  <option value="newest">Newest Listed</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="distance">Nearest to Gate</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Error State */}
          {isError && (
            <ErrorMessage
              title="Unable to fetch accommodations"
              message="Please check your internet connection or reload the page."
              onRetry={refetch}
            />
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ListingCardSkeleton />
              <ListingCardSkeleton />
              <ListingCardSkeleton />
              <ListingCardSkeleton />
              <ListingCardSkeleton />
              <ListingCardSkeleton />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && listings.length === 0 && (
            <EmptyState
              title="No listings match your filters"
              description="We could not find student rooms matching your current criteria. Try raising your monthly budget or unticking some of the facility requirements."
              actionLabel="Clear all filters"
              onAction={handleClearFilters}
            />
          )}

          {/* Listings Grid */}
          {!isLoading && !isError && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && !isError && pagination.totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-6 flex items-center justify-center gap-2 pt-4 border-t border-outline-variant/30"
            >
              <Button
                variant="outline"
                size="sm"
                icon="chevron_left"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1 font-heading text-xs font-semibold text-on-surface">
                <span>Page {page} of {pagination.totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                <span>Next</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Button>
            </nav>
          )}

          {/* Student Trust Disclaimer Banner */}
          <div className="mt-6 bg-surface-container-high rounded-xl p-4 flex items-start gap-3 border border-outline-variant/30">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-heading font-bold text-xs sm:text-sm text-primary">
                Verified Landlords & Safe Scouting
              </span>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Every landlord has phone and National ID physically cross-checked. Precise house numbers and private gate entrances are concealed until viewing is confirmed to safeguard student privacy.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
