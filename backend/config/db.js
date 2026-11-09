import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'campusnest.db');
export const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    -- 1. Users table (SRS FR-01, FR-02, FR-03, Sec 7)
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'landlord', 'admin')),
      account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended')),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Accommodations table (SRS FR-04, FR-06, FR-09, Sec 7)
    CREATE TABLE IF NOT EXISTS accommodations (
      accommodation_id TEXT PRIMARY KEY,
      landlord_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      area TEXT NOT NULL,
      university_nearby TEXT NOT NULL,
      rent_mwk REAL NOT NULL,
      deposit_mwk REAL DEFAULT 0,
      room_type TEXT NOT NULL,
      facilities TEXT NOT NULL DEFAULT '[]', -- JSON string of facilities
      availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'pending', 'unavailable', 'archived')),
      verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'flagged')),
      latitude REAL,
      longitude REAL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (landlord_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- 3. Accommodation Photos table (SRS FR-06, FR-07, Sec 7)
    CREATE TABLE IF NOT EXISTS accommodation_photos (
      photo_id TEXT PRIMARY KEY,
      accommodation_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT DEFAULT '',
      uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id) ON DELETE CASCADE
    );

    -- 4. Viewing Requests table (SRS FR-10, FR-11, Sec 7)
    CREATE TABLE IF NOT EXISTS viewing_requests (
      request_id TEXT PRIMARY KEY,
      accommodation_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      requested_datetime TEXT NOT NULL,
      message TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
      status_note TEXT DEFAULT '',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- 5. Reports table (SRS FR-13, FR-14, Sec 7)
    CREATE TABLE IF NOT EXISTS reports (
      report_id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      accommodation_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved', 'dismissed')),
      admin_note TEXT DEFAULT '',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id) ON DELETE CASCADE
    );

    -- 6. Reviews table (SRS FR-16, Sec 7)
    CREATE TABLE IF NOT EXISTS reviews (
      review_id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      accommodation_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'pending', 'hidden')),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id) ON DELETE CASCADE
    );

    -- 7. Saved Listings table (SRS FR-17, Sec 7)
    CREATE TABLE IF NOT EXISTS saved_listings (
      student_id TEXT NOT NULL,
      accommodation_id TEXT NOT NULL,
      saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (student_id, accommodation_id),
      FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id) ON DELETE CASCADE
    );

    -- 8. Verification Records table (SRS FR-15, Sec 7)
    CREATE TABLE IF NOT EXISTS verification_records (
      verification_id TEXT PRIMARY KEY,
      user_id TEXT,
      accommodation_id TEXT,
      check_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'passed' CHECK (status IN ('passed', 'failed', 'pending')),
      checked_by TEXT,
      checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      notes TEXT DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (accommodation_id) REFERENCES accommodations(accommodation_id) ON DELETE CASCADE,
      FOREIGN KEY (checked_by) REFERENCES users(user_id) ON DELETE SET NULL
    );

    -- 9. Notifications table (SRS FR-18, Sec 7)
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- 10. Admin Audit Logs table (SRS Sec 7, Sec 10.ix)
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      log_id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);

  // Migrate existing tables if latitude/longitude columns are missing
  try {
    db.exec('ALTER TABLE accommodations ADD COLUMN latitude REAL;');
  } catch (_) {
    // Column already exists
  }
  try {
    db.exec('ALTER TABLE accommodations ADD COLUMN longitude REAL;');
  } catch (_) {
    // Column already exists
  }
}

export default db;
