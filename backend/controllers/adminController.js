import db from '../config/db.js';

export const adminController = {
  // Platform stats overview (SRS FR-20)
  async getStats(req, res) {
    try {
      const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      const listingsCount = db.prepare("SELECT COUNT(*) as count FROM accommodations WHERE availability_status != 'archived'").get().count;
      const pendingHostelsCount = db.prepare("SELECT COUNT(*) as count FROM accommodations WHERE availability_status = 'pending' OR verification_status = 'unverified'").get().count;
      const viewingsCount = db.prepare('SELECT COUNT(*) as count FROM viewing_requests').get().count;
      const reportsCount = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'open'").get().count;
      const verifiedListingsCount = db.prepare("SELECT COUNT(*) as count FROM accommodations WHERE verification_status = 'verified'").get().count;

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers: usersCount,
          activeListings: listingsCount,
          pendingHostels: pendingHostelsCount,
          viewingRequests: viewingsCount,
          openReports: reportsCount,
          verifiedListings: verifiedListingsCount,
        },
      });
    } catch (err) {
      console.error('getStats error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving admin stats.' });
    }
  },

  // Get reports for moderation (SRS FR-14)
  async getReports(req, res) {
    try {
      const stmt = db.prepare(`
        SELECT 
          r.report_id as id,
          r.reason,
          r.details,
          r.status,
          r.admin_note as adminNote,
          r.created_at as createdAt,
          a.accommodation_id as accommodationId,
          a.title as accommodationTitle,
          a.area as accommodationArea,
          a.rent_mwk as price,
          a.availability_status as listingStatus,
          u.full_name as reporterName,
          u.email as reporterEmail
        FROM reports r
        JOIN accommodations a ON r.accommodation_id = a.accommodation_id
        JOIN users u ON r.reporter_id = u.user_id
        ORDER BY r.created_at DESC
      `);

      const reports = stmt.all();
      return res.status(200).json({ success: true, data: reports });
    } catch (err) {
      console.error('getReports error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving reports.' });
    }
  },

  // Moderate listing (SRS FR-14: hide, restore, remove with audit note)
  async moderateListing(req, res) {
    try {
      const { id } = req.params;
      const { action, reason } = req.body; // action: 'hide' | 'restore' | 'remove'

      if (!['hide', 'restore', 'remove'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Action must be hide, restore, or remove.' });
      }

      if (!reason) {
        return res.status(400).json({ success: false, message: 'A moderation reason is required for the audit log.' });
      }

      const listing = db.prepare('SELECT * FROM accommodations WHERE accommodation_id = ?').get(id);
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found.' });
      }

      let newStatus = listing.availability_status;
      if (action === 'hide') newStatus = 'unavailable';
      if (action === 'restore') newStatus = 'available';
      if (action === 'remove') newStatus = 'archived';

      db.prepare('UPDATE accommodations SET availability_status = ? WHERE accommodation_id = ?').run(newStatus, id);

      // Record in admin audit log (SRS Sec 7, FR-14)
      const logId = `log-${Date.now()}`;
      db.prepare(`
        INSERT INTO admin_audit_logs (log_id, admin_id, action, target_type, target_id, reason)
        VALUES (?, ?, ?, 'accommodation', ?, ?)
      `).run(logId, req.user.user_id, `${action}_listing`, id, reason);

      return res.status(200).json({
        success: true,
        message: `Listing ${action}d successfully. Audit log recorded.`,
      });
    } catch (err) {
      console.error('moderateListing error:', err);
      return res.status(500).json({ success: false, message: 'Server error during listing moderation.' });
    }
  },

  // Resolve or update report status (SRS FR-14)
  async updateReport(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;

      if (!['open', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be open, reviewed, resolved, or dismissed.' });
      }

      db.prepare('UPDATE reports SET status = ?, admin_note = COALESCE(?, admin_note) WHERE report_id = ?').run(status, adminNote || null, id);

      return res.status(200).json({ success: true, message: `Report marked as ${status}.` });
    } catch (err) {
      console.error('updateReport error:', err);
      return res.status(500).json({ success: false, message: 'Server error updating report.' });
    }
  },

  // List users for admin management (SRS FR-19)
  async getUsers(req, res) {
    try {
      const stmt = db.prepare(`
        SELECT user_id as id, full_name as fullName, email, phone, role, account_status as accountStatus, created_at as createdAt
        FROM users
        ORDER BY created_at DESC
      `);
      const users = stmt.all();
      return res.status(200).json({ success: true, data: users });
    } catch (err) {
      console.error('getUsers error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving users.' });
    }
  },

  // Suspend or reactivate user account (SRS FR-19)
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body; // status: 'active' | 'suspended'

      if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be active or suspended.' });
      }

      if (status === 'suspended' && !reason) {
        return res.status(400).json({ success: false, message: 'A suspension reason is required for the audit record.' });
      }

      db.prepare('UPDATE users SET account_status = ? WHERE user_id = ?').run(status, id);

      // Record in audit log
      const logId = `log-${Date.now()}`;
      db.prepare(`
        INSERT INTO admin_audit_logs (log_id, admin_id, action, target_type, target_id, reason)
        VALUES (?, ?, ?, 'user', ?, ?)
      `).run(logId, req.user.user_id, `${status}_user`, id, reason || `User status changed to ${status}`);

      return res.status(200).json({
        success: true,
        message: `User account ${status === 'active' ? 'reactivated' : 'suspended'}. Audit log recorded.`,
      });
    } catch (err) {
      console.error('updateUserStatus error:', err);
      return res.status(500).json({ success: false, message: 'Server error updating user status.' });
    }
  },

  // Record verification checks (SRS FR-15)
  async recordVerification(req, res) {
    try {
      const { accommodationId, userId, checkType, status = 'passed', notes } = req.body;

      if (!checkType || (!accommodationId && !userId)) {
        return res.status(400).json({
          success: false,
          message: 'checkType and at least accommodationId or userId are required.',
        });
      }

      const verifId = `verif-${Date.now()}`;
      db.prepare(`
        INSERT INTO verification_records (verification_id, user_id, accommodation_id, check_type, status, checked_by, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(verifId, userId || null, accommodationId || null, checkType, status, req.user.user_id, notes || '');

      // If accommodation verification check passed, update accommodation status
      if (accommodationId && status === 'passed') {
        db.prepare("UPDATE accommodations SET verification_status = 'verified' WHERE accommodation_id = ?").run(accommodationId);
      }

      return res.status(201).json({
        success: true,
        message: 'Verification check recorded successfully.',
        verificationId: verifId,
      });
    } catch (err) {
      console.error('recordVerification error:', err);
      return res.status(500).json({ success: false, message: 'Server error recording verification.' });
    }
  },

  // View audit logs (SRS Sec 7, 10.ix)
  async getAuditLogs(req, res) {
    try {
      const stmt = db.prepare(`
        SELECT 
          l.log_id as id,
          l.action,
          l.target_type as targetType,
          l.target_id as targetId,
          l.reason,
          l.created_at as createdAt,
          u.full_name as adminName,
          u.email as adminEmail
        FROM admin_audit_logs l
        JOIN users u ON l.admin_id = u.user_id
        ORDER BY l.created_at DESC
        LIMIT 50
      `);

      const logs = stmt.all();
      return res.status(200).json({ success: true, data: logs });
    } catch (err) {
      console.error('getAuditLogs error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving audit logs.' });
    }
  },

  // Get all landlord hostel requests/listings for admin approval (SRS FR-14, FR-15)
  async getHostels(req, res) {
    try {
      const { status } = req.query; // 'pending' | 'verified' | 'flagged' | 'all'
      let whereClause = '';
      let params = [];

      if (status === 'pending') {
        whereClause = "WHERE a.availability_status = 'pending' OR a.verification_status = 'unverified'";
      } else if (status === 'verified') {
        whereClause = "WHERE a.verification_status = 'verified'";
      } else if (status === 'flagged') {
        whereClause = "WHERE a.verification_status = 'flagged' OR a.availability_status = 'unavailable'";
      }

      const stmt = db.prepare(`
        SELECT 
          a.accommodation_id as id,
          a.landlord_id as landlordId,
          a.title,
          a.description,
          a.area,
          a.university_nearby as universityId,
          a.rent_mwk as price,
          a.deposit_mwk as deposit,
          a.room_type as roomType,
          a.facilities,
          a.availability_status as availabilityStatus,
          a.verification_status as verificationStatus,
          a.created_at as createdAt,
          u.full_name as landlordName,
          u.email as landlordEmail,
          u.phone as landlordPhone
        FROM accommodations a
        LEFT JOIN users u ON a.landlord_id = u.user_id
        ${whereClause}
        ORDER BY a.created_at DESC
      `);

      const rows = stmt.all(...params);

      const items = rows.map((row) => {
        const photoStmt = db.prepare('SELECT image_url, alt_text FROM accommodation_photos WHERE accommodation_id = ? ORDER BY uploaded_at ASC');
        const photos = photoStmt.all(row.id);
        const images = photos.map((p) => p.image_url);

        let parsedFacilities = [];
        try {
          parsedFacilities = JSON.parse(row.facilities);
        } catch {
          parsedFacilities = [];
        }

        return {
          ...row,
          images: images.length > 0 ? images : ['/hero-room.jpg'],
          facilities: parsedFacilities,
          isPending: row.availabilityStatus === 'pending' || row.verificationStatus === 'unverified',
          isVerified: row.verificationStatus === 'verified',
        };
      });

      return res.status(200).json({ success: true, data: items });
    } catch (err) {
      console.error('getHostels error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving hostels.' });
    }
  },

  // Approve and verify a landlord's hostel listing
  async approveHostel(req, res) {
    try {
      const { id } = req.params;
      const { reason = 'Approved after initial verification audit' } = req.body;

      const listing = db.prepare('SELECT * FROM accommodations WHERE accommodation_id = ?').get(id);
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Hostel listing not found.' });
      }

      // Update accommodation to available and verified
      db.prepare(`
        UPDATE accommodations 
        SET availability_status = 'available', verification_status = 'verified'
        WHERE accommodation_id = ?
      `).run(id);

      // Record verification record
      const verifId = `verif-${Date.now()}`;
      db.prepare(`
        INSERT INTO verification_records (verification_id, user_id, accommodation_id, check_type, status, checked_by, notes)
        VALUES (?, ?, ?, 'admin_inspection', 'passed', ?, ?)
      `).run(verifId, listing.landlord_id, id, req.user.user_id, reason);

      // Record in admin audit logs
      const logId = `log-${Date.now()}`;
      db.prepare(`
        INSERT INTO admin_audit_logs (log_id, admin_id, action, target_type, target_id, reason)
        VALUES (?, ?, 'approve_hostel', 'accommodation', ?, ?)
      `).run(logId, req.user.user_id, id, reason);

      // Notify the landlord
      const notifId = `notif-${Date.now()}`;
      db.prepare(`
        INSERT INTO notifications (notification_id, user_id, message, type)
        VALUES (?, ?, ?, 'success')
      `).run(notifId, listing.landlord_id, `Congratulations! Your hostel listing "${listing.title}" has been approved and verified by the CampusNest administration.`);

      return res.status(200).json({
        success: true,
        message: 'Hostel approved and published with verified status.',
      });
    } catch (err) {
      console.error('approveHostel error:', err);
      return res.status(500).json({ success: false, message: 'Server error approving hostel.' });
    }
  },

  // Reject or flag a landlord's hostel listing
  async rejectHostel(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ success: false, message: 'A rejection reason is required for the landlord.' });
      }

      const listing = db.prepare('SELECT * FROM accommodations WHERE accommodation_id = ?').get(id);
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Hostel listing not found.' });
      }

      // Mark as unavailable & flagged
      db.prepare(`
        UPDATE accommodations 
        SET availability_status = 'unavailable', verification_status = 'flagged'
        WHERE accommodation_id = ?
      `).run(id);

      // Record in audit log
      const logId = `log-${Date.now()}`;
      db.prepare(`
        INSERT INTO admin_audit_logs (log_id, admin_id, action, target_type, target_id, reason)
        VALUES (?, ?, 'reject_hostel', 'accommodation', ?, ?)
      `).run(logId, req.user.user_id, id, reason);

      // Notify the landlord
      const notifId = `notif-${Date.now()}`;
      db.prepare(`
        INSERT INTO notifications (notification_id, user_id, message, type)
        VALUES (?, ?, ?, 'warning')
      `).run(notifId, listing.landlord_id, `Your hostel listing "${listing.title}" requires updates before approval: ${reason}`);

      return res.status(200).json({
        success: true,
        message: 'Hostel request rejected and feedback logged for landlord.',
      });
    } catch (err) {
      console.error('rejectHostel error:', err);
      return res.status(500).json({ success: false, message: 'Server error rejecting hostel.' });
    }
  },
};
