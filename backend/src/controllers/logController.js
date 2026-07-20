import Log from '../models/Log.js';
import { isMockDb } from '../db/connection.js';
import { mockDb } from '../db/mockDb.js';

/**
 * Bulk upload audit logs
 * POST /api/logs/bulk
 */
export async function uploadLogs(req, res) {
  try {
    const logs = req.body;
    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: 'Payload must be an array of logs.' });
    }
    if (logs.length === 0) {
      return res.status(400).json({ error: 'Payload cannot be empty.' });
    }

    if (isMockDb()) {
      await mockDb.insertMany(logs);
    } else {
      // Clean and map records to fit Mongoose Schema
      const formatted = logs.map(record => {
        const now = new Date();
        return {
          actor: record.actor || '',
          role: record.role || '',
          action: record.action || '',
          resource: record.resource || '',
          resourceType: record.resourceType || '',
          ipAddress: record.ipAddress || '',
          region: record.region || '',
          severity: (record.severity || 'LOW').toUpperCase(),
          status: record.status || 'Unresolved',
          timestamp: record.timestamp ? new Date(record.timestamp) : now
        };
      });
      await Log.insertMany(formatted);
    }

    return res.status(201).json({
      message: `Successfully uploaded ${logs.length} logs.`,
      count: logs.length
    });
  } catch (error) {
    console.error('[logController] uploadLogs error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Fetch logs with server-side filters, search, sorting, and pagination
 * GET /api/logs
 */
export async function getLogs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'timestamp';
    const sortOrder = req.query.sortOrder || 'desc';
    const search = req.query.search || '';

    // Extracted query filters
    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.action) filters.action = req.query.action;
    if (req.query.resourceType) filters.resourceType = req.query.resourceType;
    if (req.query.severity) filters.severity = req.query.severity;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.region) filters.region = req.query.region;
    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;

    if (isMockDb()) {
      const result = await mockDb.query({ filters, search, sortBy, sortOrder, page, limit });
      return res.status(200).json(result);
    } else {
      const query = {};

      // 1. Exact filters
      if (filters.role) query.role = { $regex: new RegExp(`^${filters.role}$`, 'i') };
      if (filters.action) query.action = { $regex: new RegExp(`^${filters.action}$`, 'i') };
      if (filters.resourceType) query.resourceType = { $regex: new RegExp(`^${filters.resourceType}$`, 'i') };
      if (filters.severity) query.severity = filters.severity.toUpperCase();
      if (filters.status) query.status = filters.status;
      if (filters.region) query.region = filters.region;

      // Date range filtering
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
        if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
      }

      // 2. Text/Regex Search
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { actor: searchRegex },
          { ipAddress: searchRegex },
          { resource: searchRegex }
        ];
      }

      // 3. Sorting & Pagination
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const skip = (page - 1) * limit;

      const logs = await Log.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Log.countDocuments(query);

      return res.status(200).json({
        logs,
        total,
        page,
        pages: Math.ceil(total / limit)
      });
    }
  } catch (error) {
    console.error('[logController] getLogs error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Fetch dashboard analytics stats
 * GET /api/logs/stats
 */
export async function getStats(req, res) {
  try {
    if (isMockDb()) {
      const stats = await mockDb.getStats();
      return res.status(200).json(stats);
    } else {
      const totalLogs = await Log.countDocuments();

      const severityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
      const statusCounts = { Resolved: 0, Unresolved: 0, 'In Progress': 0 };

      // Aggregate severity
      const severityAgg = await Log.aggregate([
        { $group: { _id: { $toUpper: '$severity' }, count: { $sum: 1 } } }
      ]);
      severityAgg.forEach(item => {
        if (severityCounts[item._id] !== undefined) {
          severityCounts[item._id] = item.count;
        } else if (item._id) {
          severityCounts[item._id] = item.count;
        }
      });

      // Aggregate status
      const statusAgg = await Log.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      statusAgg.forEach(item => {
        if (statusCounts[item._id] !== undefined) {
          statusCounts[item._id] = item.count;
        } else if (item._id) {
          statusCounts[item._id] = item.count;
        }
      });

      // Aggregate region
      const regionAgg = await Log.aggregate([
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      const regionStats = regionAgg.map(item => ({ name: item._id, count: item.count }));

      // Top actors (limit 5)
      const topActorsAgg = await Log.aggregate([
        { $group: { _id: '$actor', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      const topActors = topActorsAgg.map(item => ({ name: item._id, count: item.count }));

      // Top actions (limit 5)
      const topActionsAgg = await Log.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      const topActions = topActionsAgg.map(item => ({ name: item._id, count: item.count }));

      return res.status(200).json({
        totalLogs,
        severityCounts,
        statusCounts,
        regionStats,
        topActors,
        topActions
      });
    }
  } catch (error) {
    console.error('[logController] getStats error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update log status (Resolved / Unresolved / In Progress)
 * PATCH /api/logs/:id/status
 */
export async function updateLogStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    let updatedLog;
    if (isMockDb()) {
      updatedLog = await mockDb.updateStatus(id, status);
    } else {
      updatedLog = await Log.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).lean();
    }

    if (!updatedLog) {
      return res.status(404).json({ error: 'Log not found.' });
    }

    return res.status(200).json({
      message: 'Log status updated successfully.',
      log: updatedLog
    });
  } catch (error) {
    console.error('[logController] updateLogStatus error:', error);
    return res.status(500).json({ error: error.message });
  }
}
