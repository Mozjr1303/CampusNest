import bcrypt from 'bcryptjs';
import db, { initDatabase } from '../config/db.js';

export async function seed() {
  console.log('--- Initializing Database Schema ---');
  initDatabase();

  // Clear existing records to allow clean re-seeding
  db.exec(`
    DELETE FROM admin_audit_logs;
    DELETE FROM notifications;
    DELETE FROM verification_records;
    DELETE FROM saved_listings;
    DELETE FROM reviews;
    DELETE FROM reports;
    DELETE FROM viewing_requests;
    DELETE FROM accommodation_photos;
    DELETE FROM accommodations;
    DELETE FROM users;
  `);

  console.log('--- Seeding Users ---');
  const defaultPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (user_id, full_name, email, phone, password_hash, role, account_status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
  `);

  // Admin
  insertUser.run('usr-admin-1', 'Yamikani Chanza (Admin)', 'admin@campusnest.mw', '+265991600700', adminPassword, 'admin');

  // Landlords
  insertUser.run('usr-landlord-1', 'Mr. B. Phiri', 'phiri@campusnest.mw', '+265991600735', defaultPassword, 'landlord');
  insertUser.run('usr-landlord-2', 'Mrs. M. Banda', 'mbanda@campusnest.mw', '+265888200111', defaultPassword, 'landlord');
  insertUser.run('usr-landlord-3', 'Mr. K. Gondwe', 'gondwe@campusnest.mw', '+265999300222', defaultPassword, 'landlord');
  insertUser.run('usr-landlord-4', 'Mr. C. Kalua', 'ckalua@campusnest.mw', '+265881400333', defaultPassword, 'landlord');

  // Students
  insertUser.run('usr-student-1', 'Chisomo Banda', 'chisomo@unima.ac.mw', '+265992500444', defaultPassword, 'student');
  insertUser.run('usr-student-2', 'Davie Mkandawire', 'davie@mubas.ac.mw', '+265884600555', defaultPassword, 'student');

  console.log('--- Seeding Accommodations ---');
  const insertAcc = db.prepare(`
    INSERT INTO accommodations (
      accommodation_id, landlord_id, title, description, area, university_nearby,
      rent_mwk, deposit_mwk, room_type, facilities, availability_status, verification_status,
      latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPhoto = db.prepare(`
    INSERT INTO accommodation_photos (photo_id, accommodation_id, image_url, alt_text)
    VALUES (?, ?, ?, ?)
  `);

  const accommodations = [
    {
      id: 'sh-001',
      landlordId: 'usr-landlord-1',
      title: 'Sunrise Heights Executive Student Pod',
      description: 'Designed specifically for serious UNIMA scholars, Sunrise Heights offers a quiet, secured compound along the Chikanda corridor with cool Zomba plateau breezes and tiled flooring.',
      area: 'Chikanda Village, Zomba',
      university: 'unima',
      rent: 65000,
      deposit: 65000,
      roomType: 'single',
      latitude: -15.3789,
      longitude: 35.3289,
      facilities: [
        { id: 'borehole_water', label: '24/7 Water', desc: 'Solar borehole pump', icon: 'solar_power' },
        { id: 'solar_backup', label: 'Solar Backup', desc: 'Continuous lighting', icon: 'light_mode' },
        { id: 'submetered', label: 'Sub-metered', desc: 'Prepaid ESCOM meter', icon: 'bolt' },
        { id: 'burglar_bars', label: 'Burglar Bars', desc: 'Welded steel grilles', icon: 'grid_view' },
      ],
      photos: [
        '/hero-room.jpg',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      ],
      availability: 'available',
      verification: 'verified',
    },
    {
      id: 'ch-002',
      landlordId: 'usr-landlord-2',
      title: 'Chirunga Scholars Haven (Double Room)',
      description: 'Peaceful, secured double room residence situated right behind Chancellor College campus gate. Features solar borehole water, study desks, and lockable gate.',
      area: 'Chirunga, Zomba',
      university: 'unima',
      rent: 42000,
      deposit: 42000,
      roomType: 'shared',
      latitude: -15.3860,
      longitude: 35.3330,
      facilities: [
        { id: 'borehole_water', label: 'Borehole Water', desc: '24/7 reserve tanks', icon: 'water_drop' },
        { id: 'burglar_bars', label: 'Security Grilles', desc: 'Window & door bars', icon: 'grid_view' },
        { id: 'study_desk', label: 'Study Desks', desc: 'Two study stations', icon: 'desk' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      ],
      availability: 'available',
      verification: 'verified',
    },
    {
      id: 'must-003',
      landlordId: 'usr-landlord-3',
      title: 'Goliati Palms Student Residence',
      description: 'Located in Goliati Trading Centre just 10 minutes walk to MUST main gate. Reliable solar water pump, security wall, and on-site caretaker.',
      area: 'Goliati Trading Centre, Thyolo',
      university: 'must',
      rent: 55000,
      deposit: 55000,
      roomType: 'single',
      latitude: -15.9340,
      longitude: 35.1830,
      facilities: [
        { id: 'borehole_water', label: 'Solar Water', desc: 'Borehole & storage', icon: 'water_drop' },
        { id: 'perimeter_wall', label: 'Perimeter Wall', desc: 'Gated compound', icon: 'fence' },
        { id: 'study_desk', label: 'Study Table', desc: 'Comfortable chair & desk', icon: 'desk' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      ],
      availability: 'available',
      verification: 'verified',
    },
    {
      id: 'mubas-008',
      landlordId: 'usr-landlord-4',
      title: 'Polytechnic Apex Student Pod',
      description: 'Modern, high-connectivity single room tailored for MUBAS engineering, computing, and commerce scholars. Close to Kanjedza market and campus gate.',
      area: 'Kanjedza / Chichiri, Blantyre',
      university: 'mubas',
      rent: 68000,
      deposit: 68000,
      roomType: 'single',
      latitude: -15.8120,
      longitude: 35.0450,
      facilities: [
        { id: 'borehole_water', label: '24/7 Water', desc: 'High pressure tanks', icon: 'water_drop' },
        { id: 'wifi', label: 'Fiber Wi-Fi', desc: 'Unlimited student net', icon: 'wifi' },
        { id: 'solar_backup', label: 'Solar Lighting', desc: 'Exam week backup', icon: 'light_mode' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=1200&q=80',
      ],
      availability: 'available',
      verification: 'verified',
    },
    {
      id: 'kuhes-004',
      landlordId: 'usr-landlord-2',
      title: 'Chichiri Medics Lodge (Self-Contained)',
      description: 'Specialized quiet quarters for KUHeS clinical medicine, nursing, and health sciences students. Walking distance to QECH and Mahatma Gandhi campus.',
      area: 'Chichiri / Maselema, Blantyre',
      university: 'kuhes',
      rent: 75000,
      deposit: 75000,
      roomType: 'bedsitter',
      latitude: -15.7990,
      longitude: 35.0330,
      facilities: [
        { id: 'ensuite_bath', label: 'Inside Shower', desc: 'Private inside bath', icon: 'shower' },
        { id: 'borehole_water', label: 'Borehole', desc: 'Continuous supply', icon: 'water_drop' },
        { id: 'solar_backup', label: 'Solar Backup', desc: 'Late night study light', icon: 'light_mode' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      ],
      availability: 'available',
      verification: 'verified',
    },
    {
      id: 'luanar-005',
      landlordId: 'usr-landlord-1',
      title: 'Bunda Green Fields Hostel Block',
      description: 'Spacious single rooms at Bunda Turn-off with reliable solar-powered borehole and quiet reading atmosphere for LUANAR scholars.',
      area: 'Bunda Turn-off, Lilongwe',
      university: 'luanar',
      rent: 48000,
      deposit: 48000,
      roomType: 'single',
      latitude: -14.1795,
      longitude: 33.7720,
      facilities: [
        { id: 'borehole_water', label: 'Solar Borehole', desc: 'Clean water pump', icon: 'solar_power' },
        { id: 'perimeter_wall', label: 'High Fence', desc: 'Lockable gate', icon: 'fence' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1200&q=80',
      ],
      availability: 'available',
      verification: 'verified',
    },
    {
      id: 'mzuni-006',
      landlordId: 'usr-landlord-3',
      title: 'Luwinga Heights Student Flats',
      description: 'Modern student rooms within 600m of MZUNI Gate in Luwinga. Fenced compound with night guard and prepaid electricity sub-meters.',
      area: 'Luwinga, Mzuzu',
      university: 'mzuni',
      rent: 50000,
      deposit: 50000,
      roomType: 'single',
      latitude: -11.4340,
      longitude: 34.0060,
      facilities: [
        { id: 'submetered', label: 'Prepaid Meter', desc: 'Dedicated ESCOM meter', icon: 'bolt' },
        { id: 'burglar_bars', label: 'Burglar Bars', desc: 'Fitted window grilles', icon: 'grid_view' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      ],
      availability: 'available',
      verification: 'verified',
    },
    {
      id: 'dmi-007',
      landlordId: 'usr-landlord-4',
      title: 'Lake Breeze Palms Student Residence',
      description: 'Cool lakeshore breeze, ceiling fans, and reliable solar borehole water located in Mangochi Boma near DMI St. John campus.',
      area: 'Mangochi Boma, Mangochi',
      university: 'dmi',
      rent: 45000,
      deposit: 45000,
      roomType: 'single',
      latitude: -14.4780,
      longitude: 35.2640,
      facilities: [
        { id: 'borehole_water', label: 'Borehole', desc: 'Solar pumped water', icon: 'water_drop' },
        { id: 'study_desk', label: 'Study Table', desc: 'Spacious desk & chair', icon: 'desk' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
      ],
      availability: 'available',
      verification: 'verified',
    },
    {
      id: 'unima-pending-01',
      landlordId: 'usr-landlord-1',
      title: 'Chikanda Greenview Student Villa',
      description: 'Newly constructed self-contained single units in Chikanda, 500m from UNIMA main gate. Features ceramic tiles, perimeter wall, and borehole reserve tank.',
      area: 'Chikanda Village, Zomba',
      university: 'unima',
      rent: 58000,
      deposit: 58000,
      roomType: 'single',
      latitude: -15.3800,
      longitude: 35.3300,
      facilities: [
        { id: 'borehole_water', label: 'Borehole Water', desc: 'Continuous supply', icon: 'water_drop' },
        { id: 'perimeter_wall', label: 'High Fence', desc: 'Lockable gate with guard', icon: 'fence' },
        { id: 'burglar_bars', label: 'Burglar Bars', desc: 'Fitted window steel', icon: 'grid_view' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      ],
      availability: 'pending',
      verification: 'unverified',
    },
    {
      id: 'must-pending-02',
      landlordId: 'usr-landlord-3',
      title: 'Ndata Hill Scholar Lodge',
      description: 'Spacious double room suites near Goliati trading center, 12 min walk to MUST gate. Solar lighting and quiet reading atmosphere.',
      area: 'Goliati / Ndata, Thyolo',
      university: 'must',
      rent: 46000,
      deposit: 46000,
      roomType: 'shared',
      latitude: -15.9400,
      longitude: 35.1900,
      facilities: [
        { id: 'solar_backup', label: 'Solar Lighting', desc: 'Backup lighting during load shedding', icon: 'light_mode' },
        { id: 'study_desk', label: 'Study Desks', desc: 'Fitted study tables', icon: 'desk' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      ],
      availability: 'pending',
      verification: 'unverified',
    },
  ];

  accommodations.forEach((acc) => {
    insertAcc.run(
      acc.id,
      acc.landlordId,
      acc.title,
      acc.description,
      acc.area,
      acc.university,
      acc.rent,
      acc.deposit,
      acc.roomType,
      JSON.stringify(acc.facilities),
      acc.availability,
      acc.verification,
      acc.latitude || null,
      acc.longitude || null
    );

    acc.photos.forEach((photoUrl, idx) => {
      insertPhoto.run(`photo-${acc.id}-${idx}`, acc.id, photoUrl, `${acc.title} photo`);
    });
  });

  console.log('--- Seeding Viewing Requests ---');
  const insertView = db.prepare(`
    INSERT INTO viewing_requests (request_id, accommodation_id, student_id, requested_datetime, message, status, status_note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertView.run('view-101', 'sh-001', 'usr-student-1', 'Tomorrow 11:30 AM', 'Looking to move in for semester 2.', 'confirmed', 'Meet at Chikanda Market junction.');
  insertView.run('view-102', 'ch-002', 'usr-student-1', 'Friday 3:30 PM', 'Visiting after afternoon lectures.', 'pending', '');
  insertView.run('view-103', 'must-003', 'usr-student-2', 'Saturday 10:00 AM', 'Traveling from Blantyre to inspect.', 'completed', 'Viewing completed.');

  console.log('--- Seeding Reports for Admin Moderation ---');
  const insertReport = db.prepare(`
    INSERT INTO reports (report_id, reporter_id, accommodation_id, reason, details, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertReport.run('rep-001', 'usr-student-2', 'dmi-007', 'inaccurate', 'The landlord stated electricity was included but requires buying units.', 'open');

  console.log('--- Seeding Reviews ---');
  const insertReview = db.prepare(`
    INSERT INTO reviews (review_id, student_id, accommodation_id, rating, comment, moderation_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertReview.run('rev-001', 'usr-student-1', 'sh-001', 5, 'The solar backup and borehole water are very reliable during load shedding!', 'approved');
  insertReview.run('rev-002', 'usr-student-2', 'mubas-008', 5, 'Quiet place and fast Wi-Fi for programming assignments.', 'approved');

  console.log('--- Seeding Verification Records ---');
  const insertVerif = db.prepare(`
    INSERT INTO verification_records (verification_id, user_id, accommodation_id, check_type, status, checked_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertVerif.run('verif-01', 'usr-landlord-1', 'sh-001', 'nrb_id', 'passed', 'usr-admin-1', 'Landlord National ID verified against NRB database.');
  insertVerif.run('verif-02', 'usr-landlord-1', 'sh-001', 'physical_boundary', 'passed', 'usr-admin-1', 'Physical boundary measured 650m from UNIMA Gate.');
  insertVerif.run('verif-03', 'usr-landlord-1', 'sh-001', 'water_security', 'passed', 'usr-admin-1', 'Solar borehole pump tested; welded window grilles verified.');

  console.log('--- Seeding Completed Successfully! ---');
}

export async function seedIfEmpty() {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (!row || row.count === 0) {
      console.log('Database empty. Running initial database seed...');
      await seed();
    }
  } catch (err) {
    console.warn('seedIfEmpty check skipped:', err.message);
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed().catch(console.error);
}
