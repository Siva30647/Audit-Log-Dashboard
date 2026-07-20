import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  actor: { type: String, required: true, index: true },
  role: { type: String, required: true, index: true },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true },
  resourceType: { type: String, required: true, index: true },
  ipAddress: { type: String, required: true, index: true },
  region: { type: String, required: true, index: true },
  severity: { type: String, required: true, index: true },
  status: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, index: true }
});

const Log = mongoose.model('Log', logSchema);

export default Log;
