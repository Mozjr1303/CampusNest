import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { adminService } from '../services/admin.service';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isLandlord = user?.role === 'landlord';

  const [fullName, setFullName] = useState(user?.fullName || (isAdmin ? 'Yamikani Chanza (Admin)' : 'Chisomo Banda'));
  const [phone, setPhone] = useState(user?.phone || (isAdmin ? '+265991600700' : '+265 991 600 735'));
  const [email] = useState(user?.email || (isAdmin ? 'admin@campusnest.mw' : 'chisomo.banda@unima.ac.mw'));
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Student / Landlord alert preferences
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  // Admin specific preferences
  const [hostelReviewAlerts, setHostelReviewAlerts] = useState(true);
  const [fraudEscalationAlerts, setFraudEscalationAlerts] = useState(true);

  // Admin stats query for pending counts
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getStats,
    enabled: isAdmin,
  });

  const pendingHostelsCount = stats?.pendingHostels ?? 2;
  const openReportsCount = stats?.openReports ?? 0;

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col w-full pb-20 max-w-4xl mx-auto px-4 sm:px-6 pt-6 gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">
            {isAdmin
              ? 'Administrator Profile & Console'
              : isLandlord
              ? 'Landlord Profile & Settings'
              : 'Student Profile & Settings'}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {isAdmin
              ? 'Manage administrator credentials, approve landlord hostel submissions, and enforce student safety.'
              : isLandlord
              ? 'Manage your landlord credentials, property listings, and viewing communications.'
              : 'Manage your verified student credentials and viewing communication preferences.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="self-start sm:self-auto text-xs font-heading font-bold text-error hover:bg-error-container/30 px-3.5 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all border border-error/20"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Log Out</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-semibold flex items-center gap-2 shadow-xs">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* ADMIN QUICK ACTIONS CONSOLE */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-[#004d40]/10 via-[#004d40]/5 to-surface-container-low border border-primary/20 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[24px]">
                admin_panel_settings
              </span>
              <h2 className="font-heading font-bold text-base sm:text-lg text-on-surface">
                Administrator Actions & Moderation Console
              </h2>
            </div>
            <Link
              to="/admin"
              className="text-xs font-heading font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Open Full Admin Console</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            As an administrator, your primary duty is to review and verify new hostel listings submitted by landlords before students can view or book them.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {/* Action 1: Hostel Approvals */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-primary/25 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-amber-700">
                      Action Required
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-on-surface mt-1">
                    Hostel Approvals
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Landlords awaiting verification & publishing.
                  </p>
                </div>
                <span className="min-w-[24px] h-6 px-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold flex items-center justify-center">
                  {pendingHostelsCount}
                </span>
              </div>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => navigate('/admin?tab=hostels')}
                icon="verified"
              >
                Approve Hostels
              </Button>
            </div>

            {/* Action 2: Reports Queue */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-heading font-semibold text-xs text-on-surface-variant">
                    Safety & Trust
                  </span>
                  <h3 className="font-heading font-bold text-sm text-on-surface mt-0.5">
                    Listing Reports
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Student fraud flags & safety alerts.
                  </p>
                </div>
                {openReportsCount > 0 ? (
                  <span className="min-w-[22px] h-5 px-1.5 rounded-full bg-error-container text-on-error-container text-xs font-bold flex items-center justify-center">
                    {openReportsCount}
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    check_circle
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/admin?tab=reports')}
                icon="flag"
              >
                Review Reports
              </Button>
            </div>

            {/* Action 3: Users & Audit */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-3">
              <div>
                <span className="font-heading font-semibold text-xs text-on-surface-variant">
                  Platform Oversight
                </span>
                <h3 className="font-heading font-bold text-sm text-on-surface mt-0.5">
                  Users & Audit Logs
                </h3>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Account status, roles & audit trails.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/admin?tab=users')}
                icon="manage_accounts"
              >
                Manage Users
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LANDLORD QUICK BANNER */}
      {isLandlord && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">real_estate_agent</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-on-surface">
                Landlord Property Manager
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Add student accommodations, monitor inspection bookings, and update availability.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/landlord/dashboard')}
            icon="dashboard"
          >
            Go to Landlord Dashboard
          </Button>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/40 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading font-extrabold text-2xl shadow-sm shrink-0">
            {fullName
              ? fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
              : isAdmin
              ? 'YC'
              : 'ST'}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-bold text-lg text-on-surface">{fullName}</h2>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#004d40] text-white">
                  <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                  <span>System Administrator</span>
                </span>
              ) : isLandlord ? (
                <Badge variant="verified" size="sm" icon="verified">
                  Registered Landlord
                </Badge>
              ) : (
                <Badge variant="verified" size="sm" icon="verified">
                  ID Verified Student
                </Badge>
              )}
            </div>
            <p className="text-xs text-primary font-semibold mt-1">
              {isAdmin
                ? 'CampusNest Platform Administrator • Safety & Verification Officer'
                : isLandlord
                ? 'Verified Property Owner • Campus Accommodation Provider'
                : `${user?.university?.toUpperCase() || 'UNIMA'} • Computer Science (Year 2)`}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {isAdmin
                ? 'National Administrative Console • Republic of Malawi'
                : isLandlord
                ? 'Registered Landlord Partner • Malawi Student Housing'
                : 'Zomba Campus, Chirunga Corridor'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4 pt-4 border-t border-outline-variant/30">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon="person"
          />

          <Input
            label={isAdmin ? 'Official Administrator Email' : isLandlord ? 'Contact Email' : 'College Email'}
            value={email}
            disabled
            icon="mail"
            hint={
              isAdmin
                ? 'Official administrator email tied to audit logs and moderation actions'
                : isLandlord
                ? 'Official contact email for student inquiries and verification'
                : 'Email tied to your university student portal identity'
            }
          />

          <Input
            label="Malawian Contact Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon="phone_iphone"
            hint={
              isAdmin
                ? 'Receives urgent security alerts and system notifications'
                : isLandlord
                ? 'Receives instant WhatsApp / SMS viewing booking requests from students'
                : 'Receives instant SMS alerts when landlord confirms physical viewing'
            }
          />

          {/* Preferences */}
          <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/20">
            <h3 className="font-heading font-bold text-sm text-on-surface">
              {isAdmin ? 'System & Moderation Notifications' : 'Alert Preferences'}
            </h3>

            {isAdmin ? (
              <>
                <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-heading font-semibold text-xs text-on-surface">
                      Hostel Approval Alerts
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Receive notifications when landlords submit new hostels for review and verification
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hostelReviewAlerts}
                    onChange={(e) => setHostelReviewAlerts(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-heading font-semibold text-xs text-on-surface">
                      Urgent Safety Escalations
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Alert immediately when a listing receives multiple student fraud or deposit complaints
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={fraudEscalationAlerts}
                    onChange={(e) => setFraudEscalationAlerts(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-heading font-semibold text-xs text-on-surface">
                      SMS Notifications
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Receive SMS reminders for scheduled walkthroughs (recommended for spotty data)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-heading font-semibold text-xs text-on-surface">
                      WhatsApp Viewing Reminders
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {isLandlord
                        ? 'Allow students to receive your WhatsApp location pin when booking viewings'
                        : 'Allow verified landlords to send gate directions via WhatsApp'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </label>
              </>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="md">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
