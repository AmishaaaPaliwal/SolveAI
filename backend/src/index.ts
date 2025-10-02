import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { redisService } from './services/redis';
import { initializeScheduler } from './services/scheduler';

// Load environment variables
dotenv.config();

// Import routes
import patientRoutes from './routes/patients';
import dietPlanRoutes from './routes/dietPlans';
import messMenuRoutes from './routes/messMenus';
import vitalsRoutes from './routes/vitals';
import mealTrackingRoutes from './routes/mealTracking';
import consultationsRoutes from './routes/consultations';
import patientFeedbackRoutes from './routes/patientFeedback';
import aiRoutes from './routes/ai';
import foodRoutes from './routes/foods';
import notificationRoutes from './routes/notifications';
import policiesRoutes from './routes/policies';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:9002'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'SolveAI Backend API'
  });
});

// API routes
app.use('/api/patients', patientRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/mess-menus', messMenuRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/meal-tracking', mealTrackingRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/patient-feedback', patientFeedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/policies', policiesRoutes);

// 404 handler - must be placed after all other routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize Redis connection
async function initializeServices() {
  try {
    await redisService.connect();
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    // Continue without Redis in development
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

// Start server
async function startServer() {
  await initializeServices();
  initializeScheduler();

  app.listen(PORT, () => {
    console.log(`🚀 SolveAI Backend API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 AI endpoints: http://localhost:${PORT}/api/ai`);
    console.log(`🔔 Notifications: http://localhost:${PORT}/api/notifications`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export default app;