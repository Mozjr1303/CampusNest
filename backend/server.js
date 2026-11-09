import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { initDatabase } from './config/db.js';
import { seedIfEmpty } from './scripts/seed.js';
import authRoutes from './routes/authRoutes.js';
import accommodationsRoutes from './routes/accommodationsRoutes.js';
import viewingsRoutes from './routes/viewingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { accommodationsController } from './controllers/accommodationsController.js';
import { authenticateToken, requireRole } from './middleware/authMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Initialize relational tables and seed if database is empty
initDatabase();
seedIfEmpty().catch(console.error);

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 10000 : 5000);

// Security Middleware (configured to permit Google Fonts & Icons in production)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration (allow requests from any origin or configured domain)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// JSON parser
app.use(express.json({ limit: '5mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusNest Malawi REST API is active',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes (SRS Section 9)
app.use('/api/auth', authRoutes);
app.get('/api/landlord/accommodations', authenticateToken, requireRole('landlord', 'admin'), accommodationsController.getLandlordAccommodations);
app.use('/api/accommodations', accommodationsRoutes);
app.use('/api/viewings', viewingsRoutes);
app.use('/api/admin', adminRoutes);

// In production, serve the built frontend assets and SPA fallback
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler (SRS NFR-06)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CampusNest Malawi server running on port ${PORT}`);
});

export default app;
