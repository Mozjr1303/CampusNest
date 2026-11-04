import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

function getPhoneVariants(input) {
  if (!input) return [];
  const trimmed = input.trim();
  const cleaned = trimmed.replace(/\s+/g, '');
  const digits = cleaned.replace(/\D/g, '');
  const variants = [trimmed, cleaned];

  if (digits.startsWith('265') && digits.length >= 11) {
    const local = '0' + digits.slice(3);
    variants.push(`+${digits}`, digits, local);
  } else if (digits.startsWith('0') && digits.length === 10) {
    const intl = `+265${digits.slice(1)}`;
    variants.push(intl, `265${digits.slice(1)}`, digits);
  } else if (digits.length === 9) {
    variants.push(`+265${digits}`, `0${digits}`, `265${digits}`, digits);
  }
  return [...new Set(variants)];
}

export const authController = {
  async register(req, res) {
    try {
      const { fullName, email, phone, password, role = 'student', university } = req.body;

      if (!fullName || (!email && !phone) || !password) {
        return res.status(400).json({
          success: false,
          message: 'Full name, password, and at least email or phone number are required.',
        });
      }

      const assignedRole = ['student', 'landlord', 'admin'].includes(role) ? role : 'student';

      // Check for existing user
      if (email) {
        const existingEmail = db.prepare('SELECT user_id FROM users WHERE email = ?').get(email);
        if (existingEmail) {
          return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }
      }

      if (phone) {
        const existingPhone = db.prepare('SELECT user_id FROM users WHERE phone = ?').get(phone);
        if (existingPhone) {
          return res.status(409).json({ success: false, message: 'An account with this phone number already exists.' });
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const stmt = db.prepare(`
        INSERT INTO users (user_id, full_name, email, phone, password_hash, role, account_status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
      `);

      stmt.run(userId, fullName, email || null, phone || null, passwordHash, assignedRole);

      const token = jwt.sign({ userId, role: assignedRole }, JWT_SECRET, { expiresIn: '7d' });

      const user = {
        id: userId,
        fullName,
        email: email || null,
        phone: phone || null,
        role: assignedRole,
        university: university || null,
      };

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        role: assignedRole,
        user,
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
  },

  async login(req, res) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email/phone and password are required.',
        });
      }

      let user = null;
      if (identifier.includes('@')) {
        user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(identifier.trim());
      } else {
        const variants = getPhoneVariants(identifier);
        const placeholders = variants.map(() => '?').join(', ');
        user = db.prepare(`SELECT * FROM users WHERE phone IN (${placeholders}) OR email = ?`).get(...variants, identifier.trim());
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      }

      if (user.account_status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'This account has been suspended. Please contact CampusNest support at +265 991 600 735.',
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email/phone or password.' });
      }

      const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      const safeUser = {
        id: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      };

      return res.status(200).json({
        success: true,
        token,
        role: user.role,
        user: safeUser,
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
  },

  async getCurrentUser(req, res) {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.user_id,
        fullName: req.user.full_name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    });
  },
};
