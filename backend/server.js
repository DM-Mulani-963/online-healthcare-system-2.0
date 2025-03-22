const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin if possible
let firebaseInitialized = false;
try {
  // Only try to initialize Firebase if not in mock mode
  if (process.env.MOCK_FIREBASE !== 'true') {
    const admin = require('firebase-admin');
    
    // Method 1: Using environment variables directly (preferred for production)
    if (process.env.FIREBASE_PROJECT_ID) {
      // For development with minimal config
      if (process.env.ALLOW_INSECURE_FIREBASE === 'true') {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log('Firebase initialized with minimal configuration (development mode)');
        firebaseInitialized = true;
      }
      // For production with proper credentials
      else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
          }),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
        console.log('Firebase initialized with environment variables');
        firebaseInitialized = true;
      }
    }
    
    // Method 2: Using service account file if available
    if (!firebaseInitialized) {
      try {
        const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = require(serviceAccountPath);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
          });
          console.log('Firebase initialized with service account file');
          firebaseInitialized = true;
        }
      } catch (fileError) {
        console.error('Error loading service account file:', fileError.message);
      }
    }
  } else {
    console.log('Running in Firebase mock mode');
  }
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Only use morgan in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Import routes
const pageRoutes = require('./routes/pageRoutes');

// Route middleware for page routes (these don't require Firebase)
app.use('/', pageRoutes);

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    firebase: firebaseInitialized ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Only register API routes if Firebase is initialized or in mock mode
if (firebaseInitialized || process.env.MOCK_FIREBASE === 'true') {
  try {
    const patientRoutes = require('./routes/patientRoutes');
    const doctorRoutes = require('./routes/doctorRoutes');
    const appointmentRoutes = require('./routes/appointmentRoutes');
    const medicalReportRoutes = require('./routes/medicalReportRoutes');
    const prescriptionRoutes = require('./routes/prescriptionRoutes');
    const paymentRoutes = require('./routes/paymentRoutes');
    const adminRoutes = require('./routes/adminRoutes');
    const feedbackRoutes = require('./routes/feedbackRoutes');
    const authRoutes = require('./routes/authRoutes');

    // API routes
    app.use('/api/patients', patientRoutes);
    app.use('/api/doctors', doctorRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/medical-reports', medicalReportRoutes);
    app.use('/api/prescriptions', prescriptionRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/auth', authRoutes);
    
    console.log('API routes registered successfully');
  } catch (error) {
    console.error('Error loading API routes:', error.message);
  }
} else {
  // Add a route to inform about Firebase not being initialized
  app.use('/api/*', (req, res, next) => {
    // Skip the status endpoint
    if (req.path === '/status') return next();
    
    res.status(503).json({
      success: false,
      message: 'API services are currently unavailable. Firebase is not initialized.',
      setupHelp: 'Please check your Firebase configuration in .env file or set MOCK_FIREBASE=true for development.'
    });
  });
  
  console.log('API routes are disabled. Firebase is not initialized.');
}

// Catch-all route to serve the frontend for any unmatched routes
// This ensures client-side routing works properly
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start the server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Firebase: ${firebaseInitialized ? 'Connected' : 'Not connected'}`);
  console.log(`API: ${firebaseInitialized || process.env.MOCK_FIREBASE === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`Frontend: http://localhost:${PORT}`);
});

module.exports = app;
