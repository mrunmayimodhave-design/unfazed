const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const clientRoutes = require('./routes/clientRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const noteRoutes = require('./routes/noteRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive CORS
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser (except raw webhook route which is handled internally)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static invoices & uploads directories
app.use('/invoices', express.static(path.join(__dirname, '../invoices')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'Unfazed SaaS Therapist Management System',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/therapist', therapistRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);

const fs = require('fs');

// Explicit 404 handler for unmatched /api/* routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Locate frontend production dist directory across deployment environments
const possibleDistPaths = [
  path.resolve(__dirname, '../../unfazed-frontend/dist'),
  path.resolve(__dirname, '../public'),
  path.resolve(process.cwd(), 'unfazed-frontend/dist'),
  path.resolve(process.cwd(), 'dist'),
];

const frontendDistPath = possibleDistPaths.find((p) => fs.existsSync(p));

if (frontendDistPath) {
  // Serve built static assets (JS, CSS, images, etc.)
  app.use(express.static(frontendDistPath));

  // SPA fallback: All non-API GET requests serve index.html to support React Router client-side refreshes
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Fallback if frontend has not been compiled yet
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      message: 'Unfazed Backend API service is online. Frontend static bundle not built yet.',
      healthCheck: '/api/health',
    });
  });
}

// Centralized error handler
app.use(errorHandler);

module.exports = app;
