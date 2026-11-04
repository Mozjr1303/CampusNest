import db from '../config/db.js';

export const accommodationsController = {
  // Public listing browse & search with filters (SRS FR-04, FR-05, FR-22)
  async getAccommodations(req, res) {
    try {
      const {
        university,
        area,
        minPrice,
        maxPrice,
        type,
        facilities,
        sort = 'newest',
        page = 1,
        limit = 6,
      } = req.query;

      let whereConditions = [
        "a.availability_status = 'available'",
        "a.verification_status = 'verified'",
      ];
      let params = [];

      // Filter by university
      if (university && university !== 'all') {
        whereConditions.push('LOWER(a.university_nearby) = LOWER(?)');
        params.push(university);
      }

      // Filter by area
      if (area && area !== 'all') {
        whereConditions.push('LOWER(a.area) LIKE ?');
        params.push(`%${area.toLowerCase()}%`);
      }

      // Price range
      if (minPrice) {
        whereConditions.push('a.rent_mwk >= ?');
        params.push(Number(minPrice));
      }
      if (maxPrice && maxPrice !== 'any') {
        whereConditions.push('a.rent_mwk <= ?');
        params.push(Number(maxPrice));
      }

      // Room type
      if (type && type !== 'all') {
        whereConditions.push('LOWER(a.room_type) = LOWER(?)');
        params.push(type);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Sorting
      let orderBy = 'ORDER BY a.created_at DESC';
      if (sort === 'price_asc') {
        orderBy = 'ORDER BY a.rent_mwk ASC';
      } else if (sort === 'price_desc') {
        orderBy = 'ORDER BY a.rent_mwk DESC';
      }

      // Total count query
      const countStmt = db.prepare(`SELECT COUNT(*) as total FROM accommodations a ${whereClause}`);
      const countResult = countStmt.get(...params);
      const total = countResult ? countResult.total : 0;

      // Pagination
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Number(limit));
      const offset = (pageNum - 1) * limitNum;
      const totalPages = Math.ceil(total / limitNum) || 1;

      // Select accommodations
      const queryStmt = db.prepare(`
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
          u.phone as landlordPhone
        FROM accommodations a
        LEFT JOIN users u ON a.landlord_id = u.user_id
        ${whereClause}
        ${orderBy}
        LIMIT ? OFFSET ?
      `);

      const rows = queryStmt.all(...params, limitNum, offset);

      // Attach photos and parse facilities JSON for each accommodation
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
          isAvailable: row.availabilityStatus === 'available',
          isVerified: row.verificationStatus === 'verified',
        };
      });

      return res.status(200).json({
        success: true,
        data: items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      });
    } catch (err) {
      console.error('getAccommodations error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving listings.' });
    }
  },

  // Single listing details (SRS FR-06)
  async getAccommodationById(req, res) {
    try {
      const { id } = req.params;

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
          u.phone as landlordPhone,
          u.email as landlordEmail
        FROM accommodations a
        LEFT JOIN users u ON a.landlord_id = u.user_id
        WHERE a.accommodation_id = ?
      `);

      const row = stmt.get(id);
      if (!row) {
        return res.status(404).json({ success: false, message: 'Accommodation listing not found.' });
      }

      // Photos
      const photoStmt = db.prepare('SELECT image_url, alt_text FROM accommodation_photos WHERE accommodation_id = ? ORDER BY uploaded_at ASC');
      const photos = photoStmt.all(id);
      const images = photos.map((p) => p.image_url);

      // Reviews
      const reviewStmt = db.prepare(`
        SELECT r.review_id as id, r.rating, r.comment, r.created_at as createdAt, u.full_name as author
        FROM reviews r
        LEFT JOIN users u ON r.student_id = u.user_id
        WHERE r.accommodation_id = ? AND r.moderation_status = 'approved'
        ORDER BY r.created_at DESC
      `);
      const reviews = reviewStmt.all(id);

      // Verification records
      const verifStmt = db.prepare('SELECT check_type as key, notes as detail, checked_at as date FROM verification_records WHERE accommodation_id = ?');
      const verifAudits = verifStmt.all(id);

      let parsedFacilities = [];
      try {
        parsedFacilities = JSON.parse(row.facilities);
      } catch {
        parsedFacilities = [];
      }

      const listing = {
        ...row,
        images: images.length > 0 ? images : ['/hero-room.jpg'],
        facilities: parsedFacilities,
        isAvailable: row.availabilityStatus === 'available',
        isVerified: row.verificationStatus === 'verified',
        reviews,
        verification: {
          isVerified: row.verificationStatus === 'verified',
          badgeText: row.verificationStatus === 'verified' ? 'CampusNest Verified' : 'Standard Listing',
          audits: verifAudits,
          disclaimer: 'CampusNest inspects premises conditions. Always view rooms before agreeing on tenancy.',
        },
        landlord: {
          id: row.landlordId,
          name: row.landlordName,
          phone: row.landlordPhone,
          whatsapp: row.landlordPhone ? row.landlordPhone.replace(/\D/g, '') : null,
          isVerified: row.verificationStatus === 'verified',
        },
      };

      return res.status(200).json({ success: true, data: listing });
    } catch (err) {
      console.error('getAccommodationById error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving accommodation details.' });
    }
  },

  // Landlord's own accommodations & dashboard metrics (SRS FR-08, FR-09, Sec 10.vi)
  async getLandlordAccommodations(req, res) {
    try {
      const landlordId = req.user.user_id;

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
          a.created_at as createdAt
        FROM accommodations a
        WHERE a.landlord_id = ?
        ORDER BY a.created_at DESC
      `);

      const rows = stmt.all(landlordId);

      const listings = rows.map((row) => {
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
          isAvailable: row.availabilityStatus === 'available',
          isVerified: row.verificationStatus === 'verified',
        };
      });

      const activeCount = listings.filter((l) => l.availabilityStatus === 'available').length;
      const archivedCount = listings.filter((l) => l.availabilityStatus === 'archived' || l.availabilityStatus === 'unavailable').length;

      const viewingsStmt = db.prepare(`
        SELECT COUNT(*) as count 
        FROM viewing_requests v
        JOIN accommodations a ON v.accommodation_id = a.accommodation_id
        WHERE a.landlord_id = ? AND v.status = 'pending'
      `);
      const pendingViewings = viewingsStmt.get(landlordId)?.count || 0;

      return res.status(200).json({
        success: true,
        listings,
        stats: {
          active: activeCount,
          pendingViewings,
          archived: archivedCount,
        },
      });
    } catch (err) {
      console.error('getLandlordAccommodations error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving landlord accommodations.' });
    }
  },

  // Create listing (SRS FR-07 - Landlord only)
  async createAccommodation(req, res) {
    try {
      const {
        title,
        description,
        area,
        university,
        price,
        deposit,
        roomType = 'single',
        facilities = [],
        images = [],
      } = req.body;

      if (!title || !area || !university || !price) {
        return res.status(400).json({
          success: false,
          message: 'Title, area corridor, university, and monthly rent (MWK) are required.',
        });
      }

      const accommodationId = `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const landlordId = req.user.user_id;
      const isRoleAdmin = req.user.role === 'admin';
      const initialAvailability = isRoleAdmin ? 'available' : 'pending';
      const initialVerification = isRoleAdmin ? 'verified' : 'unverified';

      const stmt = db.prepare(`
        INSERT INTO accommodations (
          accommodation_id, landlord_id, title, description, area,
          university_nearby, rent_mwk, deposit_mwk, room_type, facilities,
          availability_status, verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        accommodationId,
        landlordId,
        title,
        description || '',
        area,
        university,
        Number(price),
        deposit ? Number(deposit) : 0,
        roomType,
        JSON.stringify(facilities),
        initialAvailability,
        initialVerification
      );

      // Photos
      if (Array.isArray(images) && images.length > 0) {
        const photoStmt = db.prepare(`
          INSERT INTO accommodation_photos (photo_id, accommodation_id, image_url, alt_text)
          VALUES (?, ?, ?, ?)
        `);
        images.forEach((imgUrl, idx) => {
          if (imgUrl) {
            photoStmt.run(`photo-${Date.now()}-${idx}`, accommodationId, imgUrl, `${title} photo ${idx + 1}`);
          }
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Accommodation listing published successfully.',
        accommodationId,
      });
    } catch (err) {
      console.error('createAccommodation error:', err);
      return res.status(500).json({ success: false, message: 'Server error creating listing.' });
    }
  },

  // Update own listing (SRS FR-08 - Owner Landlord only)
  async updateAccommodation(req, res) {
    try {
      const { id } = req.params;
      const listing = db.prepare('SELECT landlord_id FROM accommodations WHERE accommodation_id = ?').get(id);

      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found.' });
      }

      if (listing.landlord_id !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own listings.' });
      }

      const {
        title,
        description,
        area,
        university,
        price,
        deposit,
        roomType,
        facilities,
        images,
      } = req.body;

      const stmt = db.prepare(`
        UPDATE accommodations
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            area = COALESCE(?, area),
            university_nearby = COALESCE(?, university_nearby),
            rent_mwk = COALESCE(?, rent_mwk),
            deposit_mwk = COALESCE(?, deposit_mwk),
            room_type = COALESCE(?, room_type),
            facilities = COALESCE(?, facilities)
        WHERE accommodation_id = ?
      `);

      stmt.run(
        title || null,
        description || null,
        area || null,
        university || null,
        price ? Number(price) : null,
        deposit !== undefined ? Number(deposit) : null,
        roomType || null,
        facilities ? JSON.stringify(facilities) : null,
        id
      );

      // Update photos if provided
      if (Array.isArray(images) && images.length > 0) {
        db.prepare('DELETE FROM accommodation_photos WHERE accommodation_id = ?').run(id);
        const photoStmt = db.prepare(`
          INSERT INTO accommodation_photos (photo_id, accommodation_id, image_url, alt_text)
          VALUES (?, ?, ?, ?)
        `);
        images.forEach((imgUrl, idx) => {
          if (imgUrl) {
            photoStmt.run(`photo-${Date.now()}-${idx}`, id, imgUrl, `Photo ${idx + 1}`);
          }
        });
      }

      return res.status(200).json({ success: true, message: 'Listing updated successfully.' });
    } catch (err) {
      console.error('updateAccommodation error:', err);
      return res.status(500).json({ success: false, message: 'Server error updating listing.' });
    }
  },

  // Change availability / archive status (SRS FR-08, FR-09)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['available', 'pending', 'unavailable', 'archived'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be one of: available, pending, unavailable, archived.',
        });
      }

      const listing = db.prepare('SELECT landlord_id FROM accommodations WHERE accommodation_id = ?').get(id);
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found.' });
      }

      if (listing.landlord_id !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only change status of your own listings.' });
      }

      db.prepare('UPDATE accommodations SET availability_status = ? WHERE accommodation_id = ?').run(status, id);

      return res.status(200).json({ success: true, message: `Listing marked as ${status}.` });
    } catch (err) {
      console.error('updateStatus error:', err);
      return res.status(500).json({ success: false, message: 'Server error updating listing status.' });
    }
  },

  // Delete / Remove listing (SRS FR-08 - Owner Landlord or Admin)
  async deleteAccommodation(req, res) {
    try {
      const { id } = req.params;
      const listing = db.prepare('SELECT landlord_id, title FROM accommodations WHERE accommodation_id = ?').get(id);

      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found.' });
      }

      if (listing.landlord_id !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only remove your own listings.' });
      }

      // Record audit log if deleted by admin
      if (req.user.role === 'admin') {
        const logId = `log-${Date.now()}`;
        db.prepare(`
          INSERT INTO admin_audit_logs (log_id, admin_id, action, target_type, target_id, reason)
          VALUES (?, ?, 'delete_listing', 'accommodation', ?, ?)
        `).run(logId, req.user.user_id, id, req.body?.reason || 'Listing permanently removed by platform administrator');
      }

      db.prepare('DELETE FROM accommodations WHERE accommodation_id = ?').run(id);

      return res.status(200).json({
        success: true,
        message: `Listing "${listing.title}" removed successfully.`,
      });
    } catch (err) {
      console.error('deleteAccommodation error:', err);
      return res.status(500).json({ success: false, message: 'Server error deleting listing.' });
    }
  },

  // Request a viewing (SRS FR-10 - Student)
  async requestViewing(req, res) {
    try {
      const { id } = req.params;
      const { preferredDate, preferredTimeSlot, contactPhone, notes } = req.body;

      if (!preferredDate) {
        return res.status(400).json({ success: false, message: 'Preferred viewing date is required.' });
      }

      const studentId = req.user.user_id;
      const requestId = `view-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const requestedDatetime = `${preferredDate} ${preferredTimeSlot || ''}`.trim();

      const stmt = db.prepare(`
        INSERT INTO viewing_requests (request_id, accommodation_id, student_id, requested_datetime, message, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `);

      stmt.run(requestId, id, studentId, requestedDatetime, notes || '');

      // Create in-app notification for landlord
      const listing = db.prepare('SELECT landlord_id, title FROM accommodations WHERE accommodation_id = ?').get(id);
      if (listing) {
        const notifId = `notif-${Date.now()}`;
        db.prepare('INSERT INTO notifications (notification_id, user_id, message, type) VALUES (?, ?, ?, ?)')
          .run(notifId, listing.landlord_id, `New viewing request for "${listing.title}" on ${requestedDatetime}`, 'info');
      }

      return res.status(201).json({
        success: true,
        message: 'Viewing request submitted to landlord.',
        requestId,
      });
    } catch (err) {
      console.error('requestViewing error:', err);
      return res.status(500).json({ success: false, message: 'Server error submitting viewing request.' });
    }
  },

  // Report a listing (SRS FR-13 - User/Student)
  async reportListing(req, res) {
    try {
      const { id } = req.params;
      const { reason, details } = req.body;

      if (!reason || !details) {
        return res.status(400).json({ success: false, message: 'Reason and report details are required.' });
      }

      const reporterId = req.user.user_id;
      const reportId = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const stmt = db.prepare(`
        INSERT INTO reports (report_id, reporter_id, accommodation_id, reason, details, status)
        VALUES (?, ?, ?, ?, ?, 'open')
      `);

      stmt.run(reportId, reporterId, id, reason, details);

      return res.status(201).json({
        success: true,
        message: 'Report submitted for administrator moderation review.',
        reportId,
      });
    } catch (err) {
      console.error('reportListing error:', err);
      return res.status(500).json({ success: false, message: 'Server error submitting report.' });
    }
  },

  // Submit review (SRS FR-16 - Student)
  async submitReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!rating || !comment) {
        return res.status(400).json({ success: false, message: 'Rating (1-5) and comment are required.' });
      }

      const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const studentId = req.user.user_id;

      const stmt = db.prepare(`
        INSERT INTO reviews (review_id, student_id, accommodation_id, rating, comment, moderation_status)
        VALUES (?, ?, ?, ?, ?, 'approved')
      `);

      stmt.run(reviewId, studentId, id, Math.min(5, Math.max(1, Number(rating))), comment);

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully.',
        reviewId,
      });
    } catch (err) {
      console.error('submitReview error:', err);
      return res.status(500).json({ success: false, message: 'Server error submitting review.' });
    }
  },

  // Save / Bookmark listing (SRS FR-17 - Student)
  async toggleSaveListing(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.user_id;

      const existing = db.prepare('SELECT * FROM saved_listings WHERE student_id = ? AND accommodation_id = ?').get(studentId, id);

      if (existing) {
        db.prepare('DELETE FROM saved_listings WHERE student_id = ? AND accommodation_id = ?').run(studentId, id);
        return res.status(200).json({ success: true, saved: false, message: 'Removed from saved listings.' });
      } else {
        db.prepare('INSERT INTO saved_listings (student_id, accommodation_id) VALUES (?, ?)').run(studentId, id);
        return res.status(200).json({ success: true, saved: true, message: 'Saved to wishlist.' });
      }
    } catch (err) {
      console.error('toggleSaveListing error:', err);
      return res.status(500).json({ success: false, message: 'Server error toggling saved listing.' });
    }
  },
};
