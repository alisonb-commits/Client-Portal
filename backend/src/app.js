const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiter for auth routes — max 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers
app.use(helmet());

// Allow requests from the frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://client-portal-six-phi.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.trim())) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Log every request in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check — useful for deployment platforms to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/projects', require('./routes/project.routes'));

// 404 handler — catches any request that didn't match a route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — catches errors passed via next(err)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

module.exports = app;
