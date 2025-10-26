const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

// Konfigurasi CORS: izinkan origin tertentu dan tangani preflight
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'https://logikaeinstein.netlify.app',
].filter(Boolean);


const corsOptions = {
  origin: (origin, callback) => {
    console.log('🌍 Request Origin:', origin);
    console.log('✅ Allowed Origins:', allowedOrigins);

    const normalizedOrigin = origin?.replace(/\/$/, ''); // hapus slash di akhir

    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      console.log('🟢 CORS allowed:', normalizedOrigin);
      callback(null, true);
    } else {
      console.warn('🚫 CORS blocked:', normalizedOrigin);
      callback(new Error(`Not allowed by CORS: ${normalizedOrigin}`));
    }
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight untuk semua rute
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const apiRoutes = require('./src/routes/api');

// Use routes
app.use('/api/v1', apiRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Backend Logika Einstein API',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});