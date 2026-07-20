const BASE_URL = '/api';

/**
 * Helper to build query parameters
 */
function buildQueryString(params) {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  return query.toString() ? `?${query.toString()}` : '';
}

export const api = {
  /**
   * Fetch logs from server with filtering, searching, sorting, and pagination
   */
  async fetchLogs(params = {}) {
    const queryString = buildQueryString(params);
    const response = await fetch(`${BASE_URL}/logs${queryString}`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to fetch logs');
    }
    return response.json();
  },

  /**
   * Fetch dashboard analytics summary statistics
   */
  async fetchStats() {
    const response = await fetch(`${BASE_URL}/logs/stats`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to fetch dashboard statistics');
    }
    return response.json();
  },

  /**
   * Perform a bulk upload of audit logs
   * @param {Array} logsArray - The array of log objects to insert
   */
  async uploadLogs(logsArray) {
    const response = await fetch(`${BASE_URL}/logs/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logsArray),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to upload audit logs');
    }
    return response.json();
  },

  /**
   * Update the remediation/investigation status of an individual log record
   */
  async updateLogStatus(id, status) {
    const response = await fetch(`${BASE_URL}/logs/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update log status');
    }
    return response.json();
  }
};
