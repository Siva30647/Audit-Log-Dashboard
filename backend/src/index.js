import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/connection.js';
import logRoutes from './routes/logRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend connection
app.use(cors());

// Configure high limit parsers to support large bulk uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Base API routes
app.use('/api/logs', logRoutes);

// Health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dbType: req.app.get('dbType') || 'unknown'
  });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('[Express Error Handler]:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] Audit Log Dashboard API listening on port ${PORT}`);
  });
}

startServer();
export default app;
