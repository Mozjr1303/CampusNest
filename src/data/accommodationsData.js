export const UNIVERSITIES = [
  { id: 'all', name: 'All Universities', short: 'All', city: 'Malawi', count: '8+ Properties' },
  {
    id: 'unima',
    name: 'UNIMA (University of Malawi)',
    short: 'UNIMA',
    city: 'Zomba',
    areas: ['Chikanda', 'Chirunga', 'Matawale', 'Sadzi'],
    count: '2 Hostels Available',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Chancellor_college_zomba.jpg'
  },
  {
    id: 'must',
    name: 'MUST (Malawi University of Science and Tech)',
    short: 'MUST',
    city: 'Thyolo',
    areas: ['Goliati', 'Ndata Farm', 'Khonjeni'],
    count: '1 Hostel Available',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Teeplantage_bei_Thyolo.jpg'
  },
  {
    id: 'kuhes',
    name: 'KUHeS (Kamuzu University of Health Sciences)',
    short: 'KUHeS',
    city: 'Blantyre',
    areas: ['Chichiri', 'Maselema', 'Ginnery Corner'],
    count: '1 Hostel Available',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Queen_Elizabeth_Central_hospital_in_Blantyre%2C_Malawi_%287513818130%29.jpg'
  },
  {
    id: 'mubas',
    name: 'MUBAS (Malawi University of Business and Applied Sciences)',
    short: 'MUBAS',
    city: 'Blantyre',
    areas: ['Chichiri', 'Maselema', 'Kanjedza'],
    count: '2 Hostels Available',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Polytechnic_blantyre.jpg'
  },
  {
    id: 'luanar',
    name: 'LUANAR (Lilongwe University of Agriculture & Natural Resources)',
    short: 'LUANAR',
    city: 'Lilongwe',
    areas: ['Bunda Campus', 'Bunda Turn-off', 'Mitundu', 'NRC'],
    count: '1 Hostel Available',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Luanar.jpg'
  },
  {
    id: 'mzuni',
    name: 'MZUNI (Mzuzu University)',
    short: 'MZUNI',
    city: 'Mzuzu',
    areas: ['Luwinga', 'Zolozolo', 'Chibanja'],
    count: '1 Hostel Available',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Mzuzu%2C_Malawi.jpg'
  },
  {
    id: 'dmi',
    name: 'DMI (DMI St. John the Baptist University)',
    short: 'DMI',
    city: 'Mangochi',
    areas: ['Mangochi Boma', 'St. John', 'Nkopola Road', 'Lake Shore'],
    count: '1 Hostel Available',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Lake_malawi_mangochi.jpg'
  },
];

export const MOCK_ACCOMMODATIONS = [
  {
    id: 'sh-001',
    title: 'Sunrise Heights Executive Student Pod',
    universityId: 'unima',
    universityName: 'UNIMA (University of Malawi)',
    area: 'Chikanda Village, Zomba',
    distanceToGate: '~650m from UNIMA Main Gate (7 min walk)',
    generalLocationNote: 'General area mapped ΓÇö exact gate disclosed after booking viewing',
    price: 65000,
    deposit: 65000,
    billingCycle: 'month',
    roomType: 'single',
    roomTypeName: 'Self-Contained Single Room',
    availabilityStatus: 'Immediate Vacancy ΓÇó 1 Room Left',
    isAvailable: true,
    electricityType: 'Sub-metered',
    utilitiesIncluded: ['24/7 Borehole Water', 'Solar Backup Lighting', 'Trash Collection'],
    utilitiesDetails: 'Water & trash collection included in base rent; ESCOM prepaid sub-metered.',
    images: [
      '/hero-room.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/a/a9/Chancellor_college_zomba.jpg',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    facilities: [
      { id: 'borehole_water', label: '24/7 Water', desc: 'Borehole & solar pump', icon: 'solar_power' },
      { id: 'solar_backup', label: 'Solar Backup', desc: 'Reliable load shedding lighting', icon: 'light_mode' },
      { id: 'submetered', label: 'Sub-metered', desc: 'Dedicated ESCOM sub-meter', icon: 'bolt' },
      { id: 'burglar_bars', label: 'Burglar Proofing', desc: 'Fitted steel grilles & window bars', icon: 'grid_view' },
      { id: 'ensuite_bath', label: 'Ensuite Bath', desc: 'Private inside toilet & shower', icon: 'shower' },
      { id: 'study_desk', label: 'Ergonomic Desk', desc: 'Dedicated study table & chair', icon: 'desk' },
      { id: 'perimeter_wall', label: 'High Perimeter Wall', desc: 'Lockable gate with night guard', icon: 'fence' },
      { id: 'wifi', label: 'Fiber Wi-Fi', desc: 'Included unlimited student net', icon: 'wifi' }
    ],
    description: 'Designed specifically for serious UNIMA students, Sunrise Heights offers a quiet, highly secured living environment located along the upper Chikanda student corridor. The unit is a self-contained private room featuring cross-ventilation windows facing the Zomba Plateau breezes, high ceilings, and tiled flooring.',
    rules: {
      quietHours: '9 PM ΓÇô 6 AM',
      libraryDistance: '8 min walk to UNIMA Library',
      cooking: 'Gas & Electric Cookers Allowed',
      caretaker: '24/7 on compound'
    },
    verification: {
      isVerified: true,
      badgeText: 'CampusNest Verified',
      audits: [
        {
          key: 'sim',
          title: 'Phone SIM (+265 99...):',
          date: 'Oct 4, 2024 via OTP',
          detail: 'Linked to active Malawian mobile money identity'
        },
        {
          key: 'nrb',
          title: 'National ID (NRB card):',
          date: 'Sep 28, 2024',
          detail: 'Cross-checked with National Registration Bureau records'
        },
        {
          key: 'boundary',
          title: 'Physical Boundary Inspection:',
          date: 'Oct 2, 2024',
          detail: 'Inspected by UNIMA Student Ambassador (Chisomo M.)'
        },
        {
          key: 'water_security',
          title: 'Water & Security Check:',
          date: 'Oct 2, 2024',
          detail: 'Tested solar pump water pressure & welded steel burglary bars'
        }
      ],
      disclaimer: 'CampusNest performs rigorous spot audits but never claims 100% immunity from disputes. Always inspect the premises in person. Exact address is withheld until your viewing is confirmed. Never pay any advance fee before inspecting.'
    },
    landlord: {
      name: 'Mr. B. Phiri',
      role: 'Host since 2022 ΓÇó Chikanda',
      responseSpeed: 'Replies in ~15 mins',
      phone: '+265991600735',
      whatsapp: '265991600735',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      activeProperties: 3,
      rating: 4.8,
      reviewCount: 14
    },
    reviews: [
      {
        id: 'rev-1',
        author: 'Chikondi K.',
        program: 'UNIMA B.Ed (2024 Resident)',
        avatarInitials: 'CK',
        rating: 4.9,
        comment: 'Very quiet during exam periods and solar backup lights never failed during load shedding. The desk area gets wonderful natural morning light.',
        date: 'November 2024'
      },
      {
        id: 'rev-2',
        author: 'Blessings T.',
        program: 'UNIMA Social Science (3rd Yr)',
        avatarInitials: 'BT',
        rating: 4.8,
        comment: 'Caretaker Mr. Phiri is very supportive with water pump scheduling. It takes me exactly 7 minutes brisk walk to get to the Great Hall.',
        date: 'January 2025'
      }
    ],
    featured: true,
    createdAt: '2025-01-15T09:00:00Z'
  },
  {
    id: 'ch-002',
    title: 'Chirunga Scholars Haven (Double Room)',
    universityId: 'unima',
    universityName: 'UNIMA (University of Malawi)',
    area: 'Chirunga, Zomba',
    distanceToGate: '~450m to UNIMA Gate 2 (5 min walk)',
    generalLocationNote: 'General area mapped ΓÇö close to Chirunga primary turn-off',
    price: 42000,
    deposit: 42000,
    billingCycle: 'month',
    roomType: 'shared',
    roomTypeName: 'Shared 2-Bed Room',
    availabilityStatus: '2 Beds Available (Female Wing)',
    isAvailable: true,
    electricityType: 'Included in rent',
    utilitiesIncluded: ['Borehole Water', 'Backup Solar Lights', 'Shared Kitchen'],
    utilitiesDetails: 'Water and solar lighting included in monthly rent. Cooking gas shared among roommates.',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    facilities: [
      { id: 'borehole_water', label: 'Borehole Water', desc: 'Solar boosted supply', icon: 'solar_power' },
      { id: 'solar_backup', label: 'Solar Lighting', desc: 'Shared study room & bedroom', icon: 'light_mode' },
      { id: 'burglar_bars', label: 'Heavy Steel Bars', desc: 'All windows reinforced', icon: 'grid_view' },
      { id: 'study_desk', label: 'Twin Study Desks', desc: 'Separate desk for each student', icon: 'desk' },
      { id: 'perimeter_wall', label: 'Gated Compound', desc: 'Curfew gate closes at 10 PM', icon: 'fence' }
    ],
    description: 'Affordable, secure double room situated in Chirunga, minutes away from the lecture halls. Features twin beds, sturdy built-in wardrobes, study tables, and a shared modern bathroom facility kept spotless by our daily compound caretaker.',
    rules: {
      quietHours: '10 PM ΓÇô 5 AM',
      libraryDistance: '5 min walk',
      cooking: 'Designated communal kitchen',
      caretaker: 'On-site matron'
    },
    verification: {
      isVerified: true,
      badgeText: 'CampusNest Verified',
      audits: [
        { key: 'sim', title: 'SIM & Landlord ID:', date: 'Aug 2024', detail: 'Mrs. M. Banda physically verified' },
        { key: 'boundary', title: 'Campus Proximity:', date: 'Aug 2024', detail: '450m measured walk to Chirunga Gate' }
      ],
      disclaimer: 'CampusNest verifies landlord ownership and premises conditions. Never send money via phone before physical viewing.'
    },
    landlord: {
      name: 'Mrs. M. Banda',
      role: 'Host since 2021 ΓÇó Chirunga',
      responseSpeed: 'Replies in ~30 mins',
      phone: '+265991600735',
      whatsapp: '265991600735',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      activeProperties: 2,
      rating: 4.7,
      reviewCount: 9
    },
    reviews: [
      {
        id: 'rev-3',
        author: 'Tadala M.',
        program: 'UNIMA Humanities (Year 2)',
        avatarInitials: 'TM',
        rating: 4.7,
        comment: 'Great community atmosphere and very safe for female students. Mrs. Banda treats us like her own daughters.',
        date: 'October 2024'
      }
    ],
    featured: true,
    createdAt: '2025-01-20T10:00:00Z'
  },
  {
    id: 'must-003',
    title: 'Goliati Palms Student Residence',
    universityId: 'must',
    universityName: 'MUST (Malawi University of Science and Tech)',
    area: 'Goliati Trading Centre, Thyolo',
    distanceToGate: '~800m to MUST Main Campus (10 min walk)',
    generalLocationNote: 'Goliati near the tea estate turnoff',
    price: 55000,
    deposit: 55000,
    billingCycle: 'month',
    roomType: 'single',
    roomTypeName: 'Single Private Room',
    availabilityStatus: '3 Rooms Available for Semester 1',
    isAvailable: true,
    electricityType: 'Sub-metered',
    utilitiesIncluded: ['Solar Pump Water', 'Compound Security Guard'],
    utilitiesDetails: 'Water free from private solar borehole; ESCOM electricity units shared per cluster.',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'
    ],
    facilities: [
      { id: 'borehole_water', label: 'Solar Borehole', desc: 'Always pressurized water', icon: 'solar_power' },
      { id: 'solar_backup', label: 'Solar Security Lights', desc: 'Floodlit perimeter', icon: 'light_mode' },
      { id: 'burglar_bars', label: 'Welded Burglar Proofing', desc: 'Heavy gauge steel', icon: 'grid_view' },
      { id: 'perimeter_wall', label: 'Stone Wall & Razor Wire', desc: 'Secure compound', icon: 'fence' },
      { id: 'study_desk', label: 'Study Station', desc: 'Fitted desk and bookshelf', icon: 'desk' }
    ],
    description: 'Clean modern block designed specifically for MUST engineering and computer science students. Built in 2023, featuring tiled floors, ceiling fans for Thyolo warmth, and quiet surroundings conducive to intensive study sessions.',
    rules: {
      quietHours: '10 PM ΓÇô 6 AM',
      libraryDistance: '10 min walk to MUST Library',
      cooking: 'Cooking allowed in kitchen alcove',
      caretaker: 'Resident caretaker on premises'
    },
    verification: {
      isVerified: true,
      badgeText: 'CampusNest Verified',
      audits: [
        { key: 'sim', title: 'Landlord SIM & NRC:', date: 'Nov 2024', detail: 'Mr. K. Gondwe verified' },
        { key: 'boundary', title: 'Inspection:', date: 'Nov 2024', detail: 'Borehole yield & compound perimeter inspected' }
      ],
      disclaimer: 'CampusNest inspects facilities physically. Always view rooms before agreeing on tenancy.'
    },
    landlord: {
      name: 'Mr. K. Gondwe',
      role: 'Host since 2023 ΓÇó Goliati',
      responseSpeed: 'Replies in ~20 mins',
      phone: '+265991600735',
      whatsapp: '265991600735',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      activeProperties: 1,
      rating: 4.9,
      reviewCount: 8
    },
    reviews: [
      {
        id: 'rev-4',
        author: 'Mayamiko C.',
        program: 'MUST B.Eng Mechanical',
        avatarInitials: 'MC',
        rating: 5.0,
        comment: 'Best water supply in Goliati hands down. The solar pump runs throughout even when ESCOM is off for 2 days.',
        date: 'December 2024'
      }
    ],
    featured: true,
    createdAt: '2025-01-18T14:30:00Z'
  },
  {
    id: 'kuhes-004',
    title: 'Chichiri Medics Lodge (Self-Contained)',
    universityId: 'kuhes',
    universityName: 'KUHeS & MUBAS',
    area: 'Chichiri / Maselema, Blantyre',
    distanceToGate: '~500m to KUHeS Campus (6 min walk)',
    generalLocationNote: 'Quiet residential enclave off Masauko Chipembere Highway',
    price: 95000,
    deposit: 95000,
    billingCycle: 'month',
    roomType: 'bedsitter',
    roomTypeName: 'Self-Contained Bedsitter',
    availabilityStatus: '1 Unit Available',
    isAvailable: true,
    electricityType: 'Sub-metered',
    utilitiesIncluded: ['Blantyre Water Board + Reserve Tank', 'Backup Inverter'],
    utilitiesDetails: 'Water utility included; inverter powers laptop and lighting during power outages.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80'
    ],
    facilities: [
      { id: 'borehole_water', label: 'Reserve Tanks', desc: '5,000L gravity tank backup', icon: 'water_drop' },
      { id: 'solar_backup', label: 'Inverter System', desc: 'Powers Wi-Fi and study lamps', icon: 'bolt' },
      { id: 'ensuite_bath', label: 'Private Bathroom', desc: 'Hot water shower fitted', icon: 'shower' },
      { id: 'study_desk', label: 'Large Medical Desk', desc: 'Designed for anatomy & textbook study', icon: 'desk' },
      { id: 'wifi', label: 'High Speed Net', desc: 'Fibre connection for online journals', icon: 'wifi' }
    ],
    description: 'Tailored for medical and pharmacy students who need absolute silence and round-the-clock power for clinical study. Features private kitchen corner, private bathroom with hot water geyser, and battery backup.',
    rules: {
      quietHours: 'Strict 24/7 quiet environment',
      libraryDistance: '6 min walk to KUHeS Library',
      cooking: 'Private fitted kitchenette inside',
      caretaker: 'On-call caretaker'
    },
    verification: {
      isVerified: true,
      badgeText: 'CampusNest Verified',
      audits: [
        { key: 'sim', title: 'SIM & Landlord ID:', date: 'Dec 2024', detail: 'Dr. E. Chirwa verified with NRC' },
        { key: 'boundary', title: 'Location verified:', date: 'Dec 2024', detail: '500m walk to Queen Elizabeth Central Hospital / KUHeS gate' }
      ],
      disclaimer: 'CampusNest inspects premises. Never make unverified mobile payments.'
    },
    landlord: {
      name: 'Dr. E. Chirwa',
      role: 'Host since 2020 ΓÇó Blantyre',
      responseSpeed: 'Replies in ~10 mins',
      phone: '+265991600735',
      whatsapp: '265991600735',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      activeProperties: 2,
      rating: 4.9,
      reviewCount: 19
    },
    reviews: [
      {
        id: 'rev-5',
        author: 'Fatsani N.',
        program: 'KUHeS MBBS (Final Year)',
        avatarInitials: 'FN',
        rating: 5.0,
        comment: 'Having instant hot water after night shifts at QECH is unbeatable. Truly thankful for this place.',
        date: 'January 2025'
      }
    ],
    featured: false,
    createdAt: '2025-01-10T12:00:00Z'
  },
  {
    id: 'luanar-005',
    title: 'Bunda Green Fields Hostel Block',
    universityId: 'luanar',
    universityName: 'LUANAR (Bunda Campus)',
    area: 'Bunda Turn-off / Campus Edge, Lilongwe',
    distanceToGate: '~700m to LUANAR Bunda Gate (8 min walk)',
    generalLocationNote: 'Directly along the paved road toward Mitundu',
    price: 38000,
    deposit: 38000,
    billingCycle: 'month',
    roomType: 'shared',
    roomTypeName: 'Shared 2-Bed Hostel Unit',
    availabilityStatus: '4 Beds Available for Intake',
    isAvailable: true,
    electricityType: 'Included',
    utilitiesIncluded: ['Solar Borehole Water', 'Backup Lighting', 'Spacious Yard'],
    utilitiesDetails: 'Water and electricity included in flat rent fee. No hidden utility surcharges.',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/c/cd/Luanar.jpg',
      'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=80'
    ],
    facilities: [
      { id: 'borehole_water', label: 'Deep Borehole', desc: 'Tested drinking water', icon: 'solar_power' },
      { id: 'solar_backup', label: 'Solar Systems', desc: 'Lighting in common corridors', icon: 'light_mode' },
      { id: 'burglar_bars', label: 'Steel Grilles', desc: 'Security prioritized', icon: 'grid_view' },
      { id: 'caretaker', label: 'Compound Warden', desc: 'Always available on-site', icon: 'support_agent' }
    ],
    description: 'Economical, clean, and well-managed student residence tailored for agriculture and natural resources scholars at LUANAR Bunda. Large gated yard, reliable borehole with heavy capacity tanks, and friendly communal study spots.',
    rules: {
      quietHours: '9:30 PM ΓÇô 5:30 AM',
      libraryDistance: '8 min walk to Bunda Library',
      cooking: 'Dedicated outdoor & indoor cooking stations',
      caretaker: 'On-site compound warden'
    },
    verification: {
      isVerified: true,
      badgeText: 'CampusNest Verified',
      audits: [
        { key: 'sim', title: 'SIM & Landlord ID:', date: 'Jan 2025', detail: 'Mr. S. Mvula verified' },
        { key: 'water', title: 'Water Source:', date: 'Jan 2025', detail: 'Solar borehole tested' }
      ],
      disclaimer: 'CampusNest spot-checks all hostels. Never pay prior to physical inspection.'
    },
    landlord: {
      name: 'Mr. S. Mvula',
      role: 'Host since 2019 ΓÇó Bunda',
      responseSpeed: 'Replies in ~40 mins',
      phone: '+265991600735',
      whatsapp: '265991600735',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      activeProperties: 4,
      rating: 4.6,
      reviewCount: 22
    },
    reviews: [
      {
        id: 'rev-6',
        author: 'Tamanda J.',
        program: 'LUANAR Agribusiness',
        avatarInitials: 'TJ',
        rating: 4.6,
        comment: 'Great value for money. Very peaceful at night and clean compound.',
        date: 'November 2024'
      }
    ],
    featured: false,
    createdAt: '2025-01-22T08:00:00Z'
  },
  {
    id: 'mzuni-006',
    title: 'Luwinga Heights Student Flats',
    universityId: 'mzuni',
    universityName: 'MZUNI (Mzuzu University)',
    area: 'Luwinga / Zolozolo, Mzuzu',
    distanceToGate: '~600m to MZUNI Campus Gate (7 min walk)',
    generalLocationNote: 'Close to Luwinga secondary school junction',
    price: 48000,
    deposit: 48000,
    billingCycle: 'month',
    roomType: 'single',
    roomTypeName: 'Single Private Room',
    availabilityStatus: 'Immediate Vacancy ΓÇó 2 Rooms Left',
    isAvailable: true,
    electricityType: 'Sub-metered',
    utilitiesIncluded: ['Northern Region Water Board + Tanks', 'Solar Perimeter Lights'],
    utilitiesDetails: 'Water included; ESCOM sub-meter for room socket points.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee1b2da97c0f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    facilities: [
      { id: 'borehole_water', label: 'Water Security', desc: 'NRWB mains with 10kL reserve', icon: 'water_drop' },
      { id: 'solar_backup', label: 'Solar Night Lights', desc: 'Secure compound lighting', icon: 'light_mode' },
      { id: 'burglar_bars', label: 'Window Security', desc: 'Reinforced window grilles', icon: 'grid_view' },
      { id: 'study_desk', label: 'Study Table', desc: 'Solid hardwood study desk', icon: 'desk' }
    ],
    description: 'Private single rooms in quiet Luwinga, right behind the Mzuzu University campus corridor. High ceilings, tiled floor, secure gate, and peaceful environment with great natural airflow.',
    rules: {
      quietHours: '10 PM ΓÇô 6 AM',
      libraryDistance: '7 min walk to MZUNI Library',
      cooking: 'Cooking allowed',
      caretaker: 'On-site landlord representative'
    },
    verification: {
      isVerified: true,
      badgeText: 'CampusNest Verified',
      audits: [
        { key: 'sim', title: 'SIM & Landlord ID:', date: 'Jan 2025', detail: 'Mr. P. Mkandawire verified' },
        { key: 'boundary', title: 'Distance Check:', date: 'Jan 2025', detail: '600m verified walk to MZUNI Gate' }
      ],
      disclaimer: 'CampusNest spot audits ensure truthful listings. Never send funds before visiting.'
    },
    landlord: {
      name: 'Mr. P. Mkandawire',
      role: 'Host since 2021 ΓÇó Luwinga',
      responseSpeed: 'Replies in ~25 mins',
      phone: '+265991600735',
      whatsapp: '265991600735',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      activeProperties: 2,
      rating: 4.8,
      reviewCount: 11
    },
    reviews: [
      {
        id: 'rev-7',
        author: 'Kondwani S.',
        program: 'MZUNI ICT (3rd Year)',
        avatarInitials: 'KS',
        rating: 4.8,
        comment: 'Very quiet, reliable water even during Mzuzu dry season cuts. Highly recommended for ICT students.',
        date: 'December 2024'
      }
    ],
    featured: false,
    createdAt: '2025-01-25T11:00:00Z'
  },
  {
    id: 'dmi-007',
    title: 'Lake Breeze Palms Student Residence',
    universityId: 'dmi',
    universityName: 'DMI St. John the Baptist University',
    area: 'Mangochi Boma / St. John, Mangochi',
    distanceToGate: '~500m to DMI Main Campus Gate (6 min walk)',
    generalLocationNote: 'Directly along the tranquil St. John campus road towards Lake Malawi',
    price: 45000,
    deposit: 45000,
    billingCycle: 'month',
    roomType: 'single',
    roomTypeName: 'Single Student Room with Fan',
    availabilityStatus: '2 Rooms Available for Intake',
    isAvailable: true,
    electricityType: 'Sub-metered',
    utilitiesIncluded: ['Solar Borehole Water', 'Backup Solar Fans & Lights', 'Perimeter Wall'],
    utilitiesDetails: 'Water free from private solar borehole; ESCOM electricity sub-metered per room.',
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80'
    ],
    facilities: [
      { id: 'borehole_water', label: 'Solar Borehole', desc: 'Continuous Lake Basin clean water', icon: 'solar_power' },
      { id: 'solar_backup', label: 'Solar Backup Fan', desc: 'Ceiling fans powered during load shedding', icon: 'light_mode' },
      { id: 'burglar_bars', label: 'Fitted Security Bars', desc: 'Reinforced window grilles & double lock door', icon: 'grid_view' },
      { id: 'study_desk', label: 'Ergonomic Desk', desc: 'Wooden study desk & chair', icon: 'desk' },
      { id: 'perimeter_wall', label: 'Brick Perimeter Wall', desc: 'Secured compound with lockable gate', icon: 'fence' },
      { id: 'ensuite_bath', label: 'Private Bathroom', desc: 'Inside tiled shower and toilet', icon: 'shower' }
    ],
    description: 'Purpose-built accommodation for DMI St. John the Baptist University students in Mangochi. Features tiled floors, excellent natural cross-ventilation from Lake Malawi breezes, reliable solar-powered ceiling fans for Mangochi climate, and peaceful study atmosphere.',
    rules: {
      quietHours: '9:30 PM ΓÇô 5:30 AM',
      libraryDistance: '6 min walk to DMI University Library',
      cooking: 'Cooking allowed with gas or electric hotplates',
      caretaker: 'On-site resident caretaker 24/7'
    },
    verification: {
      isVerified: true,
      badgeText: 'CampusNest Verified',
      audits: [
        { key: 'sim', title: 'Phone SIM (+265 88...):', date: 'Jan 2025 via OTP', detail: 'Mr. A. Maseko verified via Malawian mobile money' },
        { key: 'nrb', title: 'National ID (NRB card):', date: 'Jan 2025', detail: 'Cross-checked with National Registration Bureau records' },
        { key: 'boundary', title: 'Boundary Inspection:', date: 'Jan 2025', detail: 'Measured ~500m walking distance to DMI Main Gate' },
        { key: 'water_security', title: 'Water & Fan Inspection:', date: 'Jan 2025', detail: 'Solar borehole water output & room fans tested' }
      ],
      disclaimer: 'CampusNest performs spot audits but never claims 100% immunity from disputes. Always inspect the premises in person. Exact gate is withheld until viewing is confirmed. Never pay any advance fee before inspecting.'
    },
    landlord: {
      name: 'Mr. A. Maseko',
      role: 'Host since 2022 ΓÇó Mangochi',
      responseSpeed: 'Replies in ~20 mins',
      phone: '+265991600735',
      whatsapp: '265991600735',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      activeProperties: 2,
      rating: 4.8,
      reviewCount: 12
    },
    reviews: [
      {
        id: 'rev-8',
        author: 'Ephraim B.',
        program: 'DMI B.Sc Computer Science (3rd Year)',
        avatarInitials: 'EB',
        rating: 4.9,
        comment: 'Having solar fans in Mangochi heat is a lifesaver during ESCOM blackouts. Takes me just 5 minutes to walk to DMI lectures.',
        date: 'January 2025'
      }
    ],
    featured: true,
    createdAt: '2025-01-26T09:00:00Z'
  },
  {
    id: 'mubas-008',
    title: 'Polytechnic Apex Student Pod',
    universityId: 'mubas',
    universityName: 'MUBAS (Malawi University of Business and Applied Sciences)',
    area: 'Kanjedza / Chichiri, Blantyre',
    distanceToGate: '~550m to MUBAS Main Campus Gate (6 min walk)',
    generalLocationNote: 'Directly behind the MUBAS sports ground and library road',
    price: 58000,
    deposit: 58000,
    billingCycle: 'month',
    roomType: 'single',
    roomTypeName: 'Executive Engineering Study Room',
    availabilityStatus: 'Immediate Vacancy ΓÇó 1 Room Left',
    isAvailable: true,
    electricityType: 'Sub-metered',
    utilitiesIncluded: ['Blantyre Water Board + Tanks', 'High-Speed Wi-Fi', 'Solar Backup Lighting'],
    utilitiesDetails: 'Water & fibre internet included; ESCOM socket sub-metered.',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/a/a5/Polytechnic_blantyre.jpg',
      'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622781867-1c5e25287e07?auto=format&fit=crop&w=800&q=80'
    ],
    facilities: [
      { id: 'borehole_water', label: 'Continuous Water', desc: 'Reserve gravity tanks', icon: 'water_drop' },
      { id: 'solar_backup', label: 'Solar Backup', desc: 'Uninterrupted power for study lamps & Wi-Fi', icon: 'light_mode' },
      { id: 'study_desk', label: 'Technical Drafting Desk', desc: 'Large desk suited for engineering drawings', icon: 'desk' },
      { id: 'burglar_bars', label: 'Reinforced Bars', desc: 'Fitted window security', icon: 'grid_view' },
      { id: 'wifi', label: 'Dedicated Fiber', desc: 'Ideal for technical research & project submissions', icon: 'wifi' }
    ],
    description: 'Modern, high-connectivity single room tailored for MUBAS engineering, computing, and commerce students. Features high ceilings, tiled floors, reliable backup solar lighting, and dedicated fibre broadband.',
    rules: {
      quietHours: '10 PM ΓÇô 6 AM',
      libraryDistance: '6 min walk to MUBAS Library',
      cooking: 'Cooking allowed with gas or electric hotplates',
      caretaker: 'On-site resident caretaker'
    },
    verification: {
      isVerified: true,
      badgeText: 'CampusNest Verified',
      audits: [
        { key: 'sim', title: 'SIM & Landlord ID:', date: 'Jan 2025 via OTP', detail: 'Mr. C. Kalua verified with National ID' },
        { key: 'boundary', title: 'Campus Proximity:', date: 'Jan 2025', detail: '550m measured walk to MUBAS Gate' }
      ],
      disclaimer: 'CampusNest inspects facilities physically. Always view rooms before agreeing on tenancy.'
    },
    landlord: {
      name: 'Mr. C. Kalua',
      role: 'Host since 2021 ΓÇó Kanjedza',
      responseSpeed: 'Replies in ~15 mins',
      phone: '+265991600735',
      whatsapp: '265991600735',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      activeProperties: 2,
      rating: 4.9,
      reviewCount: 15
    },
    reviews: [
      {
        id: 'rev-9',
        author: 'Davie M.',
        program: 'MUBAS Electrical Engineering (4th Year)',
        avatarInitials: 'DM',
        rating: 5.0,
        comment: 'The Wi-Fi and solar backup never fail during exam weeks. Very close to the campus labs.',
        date: 'January 2025'
      }
    ],
    featured: true,
    createdAt: '2025-01-28T09:00:00Z'
  }
];

export const MOCK_USER = {
  id: 'usr-001',
  fullName: 'Chisomo Banda',
  email: 'chisomo.banda@unima.ac.mw',
  phone: '+265 991 600 735',
  university: 'unima',
  universityName: 'UNIMA (University of Malawi)',
  program: '2nd Year Computer Science',
  campusLocation: 'Zomba Campus, Chirunga',
  isVerifiedStudent: true,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  token: 'mock-jwt-token-campusnest-student-2025'
};

export const MOCK_VIEWINGS = [
  {
    id: 'view-101',
    accommodationId: 'sh-001',
    accommodationTitle: 'Sunrise Heights Executive Student Pod',
    accommodationArea: 'Chikanda Village, Zomba',
    universityName: 'UNIMA',
    price: 65000,
    landlordName: 'Mr. B. Phiri',
    landlordPhone: '+265991600735',
    landlordWhatsapp: '265991600735',
    preferredDate: 'Tomorrow, Oct 16, 2025',
    preferredTimeSlot: '11:30 AM (Post-lecture)',
    contactPhone: '+265 991 600 735',
    status: 'confirmed', // 'pending' | 'confirmed' | 'completed' | 'cancelled'
    statusNote: 'Mr. Phiri confirmed viewing slot. Meet at Chikanda Market junction.',
    createdAt: '2025-10-14T08:30:00Z'
  },
  {
    id: 'view-102',
    accommodationId: 'ch-002',
    accommodationTitle: 'Chirunga Scholars Haven (Double Room)',
    accommodationArea: 'Chirunga, Zomba',
    universityName: 'UNIMA',
    price: 42000,
    landlordName: 'Mrs. M. Banda',
    landlordPhone: '+265991600735',
    landlordWhatsapp: '265991600735',
    preferredDate: 'Friday, Oct 17, 2025',
    preferredTimeSlot: '3:30 PM (Afternoon)',
    contactPhone: '+265 991 600 735',
    status: 'pending',
    statusNote: 'Waiting for landlord confirmation. You will receive an SMS reminder.',
    createdAt: '2025-10-14T14:10:00Z'
  },
  {
    id: 'view-103',
    accommodationId: 'must-003',
    accommodationTitle: 'Goliati Palms Student Residence',
    accommodationArea: 'Goliati Trading Centre, Thyolo',
    universityName: 'MUST',
    price: 55000,
    landlordName: 'Mr. K. Gondwe',
    landlordPhone: '+265991600735',
    landlordWhatsapp: '265991600735',
    preferredDate: 'Saturday, Oct 11, 2025',
    preferredTimeSlot: '10:00 AM',
    contactPhone: '+265 991 600 735',
    status: 'completed',
    statusNote: 'Walkthrough completed on Oct 11.',
    createdAt: '2025-10-09T10:00:00Z'
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Viewing Confirmed',
    message: 'Mr. B. Phiri has confirmed your walkthrough for Sunrise Heights tomorrow at 11:30 AM.',
    type: 'success',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Student Safety Notice',
    message: 'Remember: Never pay an advance deposit via Airtel Money or Mpamba before physical inspection.',
    type: 'warning',
    timestamp: '1 day ago',
    read: false
  },
  {
    id: 'notif-3',
    title: 'New Room Near UNIMA Gate',
    message: 'A new verified room was just listed in Chikanda Village within your budget.',
    type: 'info',
    timestamp: '3 days ago',
    read: true
  }
];


export const REAL_ACCOMMODATIONS = MOCK_ACCOMMODATIONS;
export const REAL_VIEWINGS = MOCK_VIEWINGS;
export const REAL_NOTIFICATIONS = MOCK_NOTIFICATIONS;
