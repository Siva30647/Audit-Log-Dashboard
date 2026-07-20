import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { mockDb } from './mockDb.js';

dotenv.config();

let useMock = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/audit_dashboard';
  console.log(`[Database] Attempting to connect to MongoDB at: ${uri}`);
  try {
    // Set a short connection timeout so the fallback fires quickly instead of hanging for 30s
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('[Database] MongoDB connected successfully.');
    useMock = false;
  } catch (error) {
    console.warn(`[Database] MongoDB connection failed: ${error.message}`);
    console.warn('[Database] Falling back to File-Backed Mock Database (Local JSON file).');
    useMock = true;
    await mockDb.init();
  }
}

export function isMockDb() {
  return useMock;
}
