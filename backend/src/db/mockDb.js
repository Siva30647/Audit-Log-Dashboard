import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'audit_logs.json');

class MockDatabase {
  constructor() {
    this.logs = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    try {
      // Ensure the data directory exists
      await fs.mkdir(DATA_DIR, { recursive: true });
      try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
        this.logs = JSON.parse(fileContent);
        console.log(`[MockDB] Loaded ${this.logs.length} logs from ${DATA_FILE}`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          // File doesn't exist, start with empty list
          this.logs = [];
          await this.save();
          console.log(`[MockDB] Created new database file at ${DATA_FILE}`);
        } else {
          throw err;
        }
      }
      this.initialized = true;
    } catch (error) {
      console.error('[MockDB] Initialization error:', error);
    }
  }

  async save() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(this.logs, null, 2), 'utf-8');
    } catch (error) {
      console.error('[MockDB] Failed to save database:', error);
    }
  }

  async insertMany(records) {
    await this.init();
    const formatted = records.map(record => {
      const now = new Date();
      return {
        _id: record._id || `mock_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
        actor: record.actor || '',
        role: record.role || '',
        action: record.action || '',
        resource: record.resource || '',
        resourceType: record.resourceType || '',
        ipAddress: record.ipAddress || '',
        region: record.region || '',
        severity: (record.severity || 'LOW').toUpperCase(),
        status: record.status || 'Unresolved',
        timestamp: record.timestamp ? new Date(record.timestamp).toISOString() : now.toISOString()
      };
    });
    this.logs.push(...formatted);
    await this.save();
    return formatted;
  }

  async updateStatus(id, status) {
    await this.init();
    const index = this.logs.findIndex(log => log._id === id);
    if (index === -1) return null;
    this.logs[index].status = status;
    await this.save();
    return this.logs[index];
  }

  async query({ filters = {}, search = '', sortBy = 'timestamp', sortOrder = 'desc', page = 1, limit = 10 }) {
    await this.init();
    let results = [...this.logs];

    // 1. Text Search (Actor, IP Address, Resource)
    if (search) {
      const term = search.toLowerCase();
      results = results.filter(log => 
        (log.actor && log.actor.toLowerCase().includes(term)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(term)) ||
        (log.resource && log.resource.toLowerCase().includes(term))
      );
    }

    // 2. Exact/Range Filters
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value === undefined || value === null || value === '') return;

      if (key === 'startDate') {
        const start = new Date(value);
        results = results.filter(log => new Date(log.timestamp) >= start);
      } else if (key === 'endDate') {
        const end = new Date(value);
        results = results.filter(log => new Date(log.timestamp) <= end);
      } else {
        // Equal match (case-insensitive for convenience if needed, but exact matches for role, action, severity, status, region)
        results = results.filter(log => {
          const logVal = log[key];
          if (typeof logVal === 'string') {
            return logVal.toLowerCase() === String(value).toLowerCase();
          }
          return logVal === value;
        });
      }
    });

    // 3. Sorting
    results.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle date parsing for sorting
      if (sortBy === 'timestamp') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = typeof valA === 'string' ? valA.toLowerCase() : valA;
        valB = typeof valB === 'string' ? valB.toLowerCase() : valB;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 4. Pagination
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return {
      logs: paginatedResults,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getStats() {
    await this.init();
    
    const severityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    const statusCounts = { Resolved: 0, Unresolved: 0, 'In Progress': 0 };
    const regionCounts = {};
    const actorCounts = {};
    const actionCounts = {};

    this.logs.forEach(log => {
      // Severity (Normalize to uppercase)
      const sev = (log.severity || 'LOW').toUpperCase();
      if (severityCounts[sev] !== undefined) {
        severityCounts[sev]++;
      } else {
        severityCounts[sev] = 1;
      }

      // Status
      const stat = log.status || 'Unresolved';
      if (statusCounts[stat] !== undefined) {
        statusCounts[stat]++;
      } else {
        statusCounts[stat] = (statusCounts[stat] || 0) + 1;
      }

      // Region
      if (log.region) {
        regionCounts[log.region] = (regionCounts[log.region] || 0) + 1;
      }

      // Actor
      if (log.actor) {
        actorCounts[log.actor] = (actorCounts[log.actor] || 0) + 1;
      }

      // Action
      if (log.action) {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      }
    });

    // Sort and limit aggregations
    const topActors = Object.entries(actorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topActions = Object.entries(actionCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const regionStats = Object.entries(regionCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLogs: this.logs.length,
      severityCounts,
      statusCounts,
      regionStats,
      topActors,
      topActions
    };
  }
}

export const mockDb = new MockDatabase();
