import db from '../config/db.js';

export const viewingsController = {
  // Landlord viewing requests for their properties (SRS FR-11)
  async getLandlordViewings(req, res) {
    try {
      const landlordId = req.user.user_id;

      const stmt = db.prepare(`
        SELECT 
          v.request_id as id,
          v.accommodation_id as accommodationId,
          v.requested_datetime as requestedDatetime,
          v.message,
          v.status,
          v.status_note as statusNote,
          v.created_at as createdAt,
          a.title as accommodationTitle,
          a.area as accommodationArea,
          a.university_nearby as universityId,
          a.rent_mwk as price,
          u.full_name as studentName,
          u.phone as studentPhone,
          u.email as studentEmail
        FROM viewing_requests v
        JOIN accommodations a ON v.accommodation_id = a.accommodation_id
        JOIN users u ON v.student_id = u.user_id
        WHERE a.landlord_id = ?
        ORDER BY v.created_at DESC
      `);

      const rows = stmt.all(landlordId);
      return res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error('getLandlordViewings error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving landlord viewings.' });
    }
  },

  // Student viewings (SRS FR-10)
  async getStudentViewings(req, res) {
    try {
      const studentId = req.user.user_id;

      const stmt = db.prepare(`
        SELECT 
          v.request_id as id,
          v.accommodation_id as accommodationId,
          v.requested_datetime as requestedDatetime,
          v.message,
          v.status,
          v.status_note as statusNote,
          v.created_at as createdAt,
          a.title as accommodationTitle,
          a.area as accommodationArea,
          a.rent_mwk as price,
          u.full_name as landlordName,
          u.phone as landlordPhone
        FROM viewing_requests v
        JOIN accommodations a ON v.accommodation_id = a.accommodation_id
        JOIN users u ON a.landlord_id = u.user_id
        WHERE v.student_id = ?
        ORDER BY v.created_at DESC
      `);

      const rows = stmt.all(studentId);
      return res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error('getStudentViewings error:', err);
      return res.status(500).json({ success: false, message: 'Server error retrieving student viewings.' });
    }
  },

  // Update viewing status (SRS FR-11 - Landlord updates status)
  async updateViewingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, statusNote } = req.body;

      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be one of: pending, confirmed, completed, cancelled.',
        });
      }

      // Check ownership
      const viewing = db.prepare(`
        SELECT v.*, a.landlord_id, a.title
        FROM viewing_requests v
        JOIN accommodations a ON v.accommodation_id = a.accommodation_id
        WHERE v.request_id = ?
      `).get(id);

      if (!viewing) {
        return res.status(404).json({ success: false, message: 'Viewing request not found.' });
      }

      if (viewing.landlord_id !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only update viewings for your own listings.' });
      }

      const stmt = db.prepare(`
        UPDATE viewing_requests
        SET status = ?, status_note = COALESCE(?, status_note)
        WHERE request_id = ?
      `);

      stmt.run(status, statusNote || null, id);

      // Create notification for student
      const notifId = `notif-${Date.now()}`;
      db.prepare('INSERT INTO notifications (notification_id, user_id, message, type) VALUES (?, ?, ?, ?)')
        .run(notifId, viewing.student_id, `Your viewing request for "${viewing.title}" was ${status}. ${statusNote || ''}`, 'info');

      return res.status(200).json({ success: true, message: `Viewing request marked as ${status}.` });
    } catch (err) {
      console.error('updateViewingStatus error:', err);
      return res.status(500).json({ success: false, message: 'Server error updating viewing request.' });
    }
  },
};
