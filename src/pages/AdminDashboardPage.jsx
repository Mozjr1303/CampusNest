import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { accommodationsService } from '../services/accommodations.service';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatMWK } from '../utils/formatMWK';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [hostelFilter, setHostelFilter] = useState('all'); // 'all' | 'pending' | 'verified' | 'flagged'

  // Sync active tab whenever query parameter changes
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [auditModal, setAuditModal] = useState({
    open: false,
    action: null,
    targetId: null,
    targetType: null,
    reason: '',
    title: '',
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // 1. Fetch Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getStats,
  });

  // 2. Fetch Hostels
  const { data: hostels = [], isLoading: hostelsLoading } = useQuery({
    queryKey: ['admin', 'hostels', hostelFilter],
    queryFn: () => adminService.getHostels(hostelFilter),
  });

  // 3. Fetch Reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: adminService.getReports,
  });

  // 4. Fetch Users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminService.getUsers,
  });

  // 5. Fetch Audit Logs
  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: adminService.getAuditLogs,
  });

  // Mutations
  const approveHostelMutation = useMutation({
    mutationFn: ({ hostelId, reason }) => adminService.approveHostel(hostelId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setAuditModal({ open: false, action: null, targetId: null, targetType: null, reason: '', title: '' });
    },
  });

  const rejectHostelMutation = useMutation({
    mutationFn: ({ hostelId, reason }) => adminService.rejectHostel(hostelId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setAuditModal({ open: false, action: null, targetId: null, targetType: null, reason: '', title: '' });
    },
  });

  const deleteHostelMutation = useMutation({
    mutationFn: ({ hostelId, reason }) => accommodationsService.deleteAccommodation(hostelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setAuditModal({ open: false, action: null, targetId: null, targetType: null, reason: '', title: '' });
    },
  });

  const moderateMutation = useMutation({
    mutationFn: ({ listingId, action, reason }) => adminService.moderateListing(listingId, { action, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setAuditModal({ open: false, action: null, targetId: null, targetType: null, reason: '', title: '' });
    },
  });

  const userStatusMutation = useMutation({
    mutationFn: ({ userId, status, reason }) => adminService.updateUserStatus(userId, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setAuditModal({ open: false, action: null, targetId: null, targetType: null, reason: '', title: '' });
    },
  });

  const handleOpenApproveHostel = (hostel) => {
    setAuditModal({
      open: true,
      action: 'approve',
      targetId: hostel.id,
      targetType: 'hostel_approve',
      reason: 'Physical inspection and landlord verification passed. Property approved for scholar viewings.',
      title: `Approve & Verify "${hostel.title}"`,
    });
  };

  const handleOpenRejectHostel = (hostel) => {
    setAuditModal({
      open: true,
      action: 'reject',
      targetId: hostel.id,
      targetType: 'hostel_reject',
      reason: '',
      title: `Reject / Request Updates for "${hostel.title}"`,
    });
  };

  const handleOpenDeleteHostel = (hostel) => {
    setAuditModal({
      open: true,
      action: 'delete',
      targetId: hostel.id,
      targetType: 'hostel_delete',
      reason: 'Violates platform housing safety policy or permanently removed by platform administrator.',
      title: `Permanently Remove "${hostel.title}"`,
    });
  };

  const handleOpenModeration = (listingId, action) => {
    setAuditModal({
      open: true,
      action,
      targetId: listingId,
      targetType: 'listing',
      reason: '',
      title: `Moderation Action: ${action.toUpperCase()}`,
    });
  };

  const handleOpenUserStatus = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setAuditModal({
      open: true,
      action: nextStatus,
      targetId: userId,
      targetType: 'user',
      reason: '',
      title: `${nextStatus === 'suspended' ? 'Suspend' : 'Reactivate'} User Account`,
    });
  };

  const handleAuditSubmit = (e) => {
    e.preventDefault();
    if (!auditModal.reason.trim()) return;

    if (auditModal.targetType === 'hostel_approve') {
      approveHostelMutation.mutate({
        hostelId: auditModal.targetId,
        reason: auditModal.reason,
      });
    } else if (auditModal.targetType === 'hostel_reject') {
      rejectHostelMutation.mutate({
        hostelId: auditModal.targetId,
        reason: auditModal.reason,
      });
    } else if (auditModal.targetType === 'hostel_delete') {
      deleteHostelMutation.mutate({
        hostelId: auditModal.targetId,
        reason: auditModal.reason,
      });
    } else if (auditModal.targetType === 'listing') {
      moderateMutation.mutate({
        listingId: auditModal.targetId,
        action: auditModal.action,
        reason: auditModal.reason,
      });
    } else if (auditModal.targetType === 'user') {
      userStatusMutation.mutate({
        userId: auditModal.targetId,
        status: auditModal.action,
        reason: auditModal.reason,
      });
    }
  };

  const pendingHostelsCount = stats?.pendingHostels ?? hostels.filter((h) => h.isPending).length;

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">admin_panel_settings</span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">
              Administrator Moderation Portal
            </h1>
          </div>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1">
            CampusNest Admin Console: approve landlord hostels, review fraud reports, manage users, and maintain audit logs.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-surface-container p-1 rounded-xl border border-outline-variant/30">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard', count: null },
            {
              id: 'hostels',
              label: 'Hostel Approvals',
              icon: 'domain_verification',
              count: pendingHostelsCount,
              badgeColor: 'bg-amber-500 text-white',
            },
            {
              id: 'reports',
              label: 'Reports',
              icon: 'flag',
              count: reports.filter((r) => r.status === 'open').length,
              badgeColor: 'bg-error text-white',
            },
            { id: 'users', label: 'Users', icon: 'group', count: users.length },
            { id: 'logs', label: 'Audit Logs', icon: 'history', count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all
                ${
                  activeTab === tab.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }
              `}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none ${
                    tab.badgeColor || (activeTab === tab.id ? 'bg-white text-primary' : 'bg-surface-container-highest text-on-surface')
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab: KPI Cards */}
      {activeTab === 'overview' && (
        <div className="mt-8 space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Pending Approvals KPI Card */}
            <div
              onClick={() => handleTabChange('hostels')}
              className="bg-amber-500/10 border border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col cursor-pointer hover:bg-amber-500/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Hostels Pending</span>
                <span className="material-symbols-outlined text-amber-600 text-[20px]">pending_actions</span>
              </div>
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-amber-600 mt-2">
                {pendingHostelsCount}
              </span>
              <span className="text-[11px] text-amber-700 mt-1 font-medium">Awaiting Admin Approval →</span>
            </div>

            <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Active Listings</span>
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-secondary mt-2">
                {stats?.activeListings || 0}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-1">Across 7 Universities</span>
            </div>

            <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Open Reports</span>
              <span className={`font-heading font-extrabold text-3xl sm:text-4xl mt-2 ${stats?.openReports > 0 ? 'text-error' : 'text-primary'}`}>
                {stats?.openReports || 0}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-1">Needs moderation</span>
            </div>

            <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Verified Badges</span>
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-primary mt-2">
                {stats?.verifiedListings || 0}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-1">Physically audited</span>
            </div>

            <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Users</span>
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-on-surface mt-2">
                {stats?.totalUsers || 0}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-1">Scholars & Landlords</span>
            </div>
          </div>

          {/* Pending Approval Callout Banner */}
          {pendingHostelsCount > 0 && (
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">domain_verification</span>
                </div>
                <div>
                  <h2 className="font-heading font-bold text-sm sm:text-base text-on-surface">
                    {pendingHostelsCount} Landlord Hostel{pendingHostelsCount > 1 ? 's' : ''} Awaiting Approval
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Landlords have submitted hostel accommodation requests. Inspect photos, amenities, and verify safety before publishing.
                  </p>
                </div>
              </div>
              <Button size="sm" variant="primary" onClick={() => handleTabChange('hostels')}>
                Review Hostel Requests ({pendingHostelsCount})
              </Button>
            </div>
          )}

          {/* Quick Action Banner */}
          <div className="bg-surface-container-low border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <h2 className="font-heading font-bold text-sm sm:text-base text-on-surface">
                  Malawi Verification Standards Active
                </h2>
                <p className="text-xs text-on-surface-variant">
                  NRB ID cross-checks, Airtel/TNM mobile identity verification, and measured distance audits.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleTabChange('reports')}>
              Review Open Reports
            </Button>
          </div>
        </div>
      )}

      {/* Hostels Tab: Approvals Queue */}
      {activeTab === 'hostels' && (
        <div className="mt-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-bold text-lg sm:text-xl text-primary">
                Landlord Hostel Requests & Verification
              </h2>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Inspect and approve hostel accommodation listings before they appear in public search results.
              </p>
            </div>

            {/* Sub-filters */}
            <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-outline-variant/30 text-xs font-heading font-semibold">
              {[
                { id: 'all', label: `All (${hostels.length})` },
                { id: 'pending', label: `Pending (${hostels.filter((h) => h.isPending).length})` },
                { id: 'verified', label: `Verified (${hostels.filter((h) => h.isVerified).length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setHostelFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    hostelFilter === f.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {hostels.length === 0 ? (
            <div className="bg-surface p-12 rounded-2xl border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">domain_verification</span>
              <p className="font-heading font-bold text-sm text-on-surface">No Hostels Found</p>
              <p className="text-xs text-on-surface-variant">There are currently no hostels matching this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {hostels.map((hostel) => {
                const isPending = hostel.isPending;
                const isVerified = hostel.isVerified;

                return (
                  <div
                    key={hostel.id}
                    className={`bg-surface rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all ${
                      isPending ? 'border-amber-500/40 bg-amber-500/5' : 'border-outline-variant/30'
                    }`}
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
                      <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-surface-container shrink-0 relative">
                        <img
                          src={hostel.images?.[0] || '/hero-room.jpg'}
                          alt={hostel.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                          {hostel.images?.length || 1} photo{hostel.images?.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                            {hostel.universityId?.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-container text-on-surface-variant">
                            {hostel.roomType || 'Single Room'}
                          </span>

                          {/* Status Pill */}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>Pending Admin Approval</span>
                            </span>
                          )}
                          {isVerified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              <span>CampusNest Verified</span>
                            </span>
                          )}
                          {!isPending && !isVerified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-error/15 text-error">
                              <span>Needs Updates / Flagged</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading font-bold text-base sm:text-lg text-on-surface leading-snug">
                          {hostel.title}
                        </h3>

                        <p className="text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                          <span>{hostel.area}</span>
                          <span className="mx-1">•</span>
                          <strong className="text-primary font-semibold">{formatMWK(hostel.price)} / mo</strong>
                          {hostel.deposit > 0 && <span className="text-[11px] text-on-surface-variant">(Deposit: {formatMWK(hostel.deposit)})</span>}
                        </p>

                        {/* Landlord contact card */}
                        <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-on-surface-variant">
                          <span className="font-semibold text-on-surface">Host:</span>
                          <span>{hostel.landlordName || 'Landlord'}</span>
                          {hostel.landlordPhone && (
                            <span className="font-mono bg-surface-container px-1.5 py-0.5 rounded text-[10px] text-on-surface">
                              {hostel.landlordPhone}
                            </span>
                          )}
                          {hostel.landlordPhone && (
                            <a
                              href={`https://wa.me/${hostel.landlordPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#25D366] font-bold hover:underline inline-flex items-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[13px]">chat</span>
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap md:flex-col items-stretch sm:items-center md:items-end gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            icon="check_circle"
                            className="bg-[#059669] hover:bg-[#047857] text-white w-full sm:w-auto"
                            onClick={() => handleOpenApproveHostel(hostel)}
                          >
                            Approve & Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            icon="block"
                            className="text-error border-error/30 hover:bg-error/10 w-full sm:w-auto"
                            onClick={() => handleOpenRejectHostel(hostel)}
                          >
                            Reject / Request Changes
                          </Button>
                        </>
                      ) : isVerified ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#059669] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">check_circle</span>
                            <span>Live & Verified</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenRejectHostel(hostel)}
                            className="text-xs text-error hover:underline px-2 py-1 rounded"
                          >
                            Revoke
                          </button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-[#059669] text-white"
                          onClick={() => handleOpenApproveHostel(hostel)}
                        >
                          Re-Approve
                        </Button>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          to={`/listings/${hostel.id}`}
                          target="_blank"
                          className="text-xs font-heading font-semibold text-primary hover:underline px-2 py-1 flex items-center gap-1"
                        >
                          <span>Preview Listing</span>
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteHostel(hostel)}
                          className="text-xs font-heading font-semibold text-error hover:underline px-2 py-1 flex items-center gap-1 rounded hover:bg-error/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab: Moderation Queue */}
      {activeTab === 'reports' && (
        <div className="mt-8 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-primary">Reported Listings Queue (FR-14)</h2>
            <span className="text-xs text-on-surface-variant font-medium">
              {reports.length} total reports filed
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="bg-surface p-8 rounded-2xl border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">check_circle</span>
              <p className="font-heading font-bold text-sm text-on-surface">Queue is Clean</p>
              <p className="text-xs text-on-surface-variant">No unresolved listing reports.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="bg-surface p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-error/15 text-error">
                        {rep.reason}
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant">
                        Status: <strong className="text-on-surface">{rep.status}</strong>
                      </span>
                      <span className="text-[11px] text-on-surface-variant/70">
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base text-on-surface">
                      {rep.accommodationTitle}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      <strong>Report Details:</strong> {rep.details}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      Reporter: {rep.reporterName} ({rep.reporterEmail}) • Location: {rep.accommodationArea} • Rent: {formatMWK(rep.price)}
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-error border-error/30 hover:bg-error/10"
                      onClick={() => handleOpenModeration(rep.accommodationId, 'hide')}
                    >
                      Hide Listing
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-primary"
                      onClick={() => handleOpenModeration(rep.accommodationId, 'restore')}
                    >
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-error hover:bg-error/90 text-white"
                      onClick={() => handleOpenModeration(rep.accommodationId, 'remove')}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab: Account Suspension & Status (FR-19) */}
      {activeTab === 'users' && (
        <div className="mt-8 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-primary">User Management (FR-19)</h2>
            <span className="text-xs text-on-surface-variant font-medium">{users.length} registered accounts</span>
          </div>

          <div className="bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container border-b border-outline-variant/30 text-on-surface-variant uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-4 font-heading font-bold text-on-surface">{u.fullName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-primary/20 text-primary' : u.role === 'landlord' ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">
                        {u.email || u.phone}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.accountStatus === 'active' ? 'bg-primary/10 text-primary' : 'bg-error/15 text-error'
                        }`}>
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleOpenUserStatus(u.id, u.accountStatus)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                              u.accountStatus === 'active'
                                ? 'border-error/40 text-error hover:bg-error/10'
                                : 'border-primary/40 text-primary hover:bg-primary/10'
                            }`}
                          >
                            {u.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="mt-8 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-primary">Administrator Audit Logs (SRS Sec 7)</h2>
            <span className="text-xs text-on-surface-variant font-medium">{auditLogs.length} logged actions</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="bg-surface p-8 rounded-2xl border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">history</span>
              <p className="font-heading font-bold text-sm text-on-surface">No Audit Logs Yet</p>
              <p className="text-xs text-on-surface-variant">All moderation, approval, and suspension actions will appear here with reasons.</p>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
              <div className="divide-y divide-outline-variant/20 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-on-surface">{log.action}</span>
                        <span className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">
                          {log.targetType} #{log.targetId}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">
                        <strong>Reason:</strong> {log.reason}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold text-primary block">{log.adminName}</span>
                      <span className="text-[10px] text-on-surface-variant/70">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit Justification Modal */}
      {auditModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface w-full max-w-md p-6 rounded-2xl border border-outline-variant/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-primary">
                {auditModal.title || 'Record Moderation Audit Note'}
              </h3>
              <button
                type="button"
                onClick={() => setAuditModal({ open: false, action: null, targetId: null, targetType: null, reason: '', title: '' })}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              SRS Compliance Rule: Every approval or moderation action ({auditModal.action} on {auditModal.targetType}) requires a recorded justification note in the immutable audit log.
            </p>

            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Audit Justification Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={auditModal.reason}
                  onChange={(e) => setAuditModal({ ...auditModal, reason: e.target.value })}
                  placeholder="e.g. Verified borehole water pump and landlord National ID; passed inspection."
                  className="w-full text-xs p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAuditModal({ open: false, action: null, targetId: null, targetType: null, reason: '', title: '' })}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  loading={
                    approveHostelMutation.isPending ||
                    rejectHostelMutation.isPending ||
                    moderateMutation.isPending ||
                    userStatusMutation.isPending
                  }
                >
                  Confirm & Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
