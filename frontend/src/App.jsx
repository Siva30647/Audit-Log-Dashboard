import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Upload, RefreshCw, Sun, Moon } from 'lucide-react';
import { api } from './utils/api.js';
import AnalyticsSummary from './components/AnalyticsSummary.jsx';
import LogFilters from './components/LogFilters.jsx';
import LogTable from './components/LogTable.jsx';
import LogDetailsModal from './components/LogDetailsModal.jsx';
import UploadModal from './components/UploadModal.jsx';
import ThemeBackdrop from './components/ThemeBackdrop.jsx';

export default function App() {
  // Theme state logic (defaults to dark or retrieves from localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Toggle theme callback
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Sync theme with body class list & localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Data lists & statistics
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  
  // Pagination & query parameters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');

  // Loading indicator states
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // UI overlays & notification toasts
  const [selectedLog, setSelectedLog] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  // Toast notifier helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Dashboard aggregate stats
  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const data = await api.fetchStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      showToast('Error loading dashboard analytics.', 'error');
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Fetch paginated logs (debounced/triggered on filters changes)
  const fetchLogs = async () => {
    setIsLogsLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        ...filters
      };
      const result = await api.fetchLogs(params);
      setLogs(result.logs || []);
      setPage(result.page || 1);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      showToast('Error querying log database.', 'error');
    } finally {
      setIsLogsLoading(false);
    }
  };

  // Run initial loading & sync when filter dependencies change
  useEffect(() => {
    fetchLogs();
  }, [page, limit, sortBy, sortOrder, filters, search]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Action: Trigger fully unified data refresh
  const handleRefreshAll = () => {
    fetchLogs();
    fetchStats();
    showToast('Dashboard metrics refreshed.', 'success');
  };

  // Action: Receive updated filters
  const handleFilterChange = (newFilters) => {
    const { search: searchStr, ...rest } = newFilters;
    setFilters(rest);
    setSearch(searchStr);
    setPage(1); // Reset to first page
  };

  // Action: Update column sort order
  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  // Action: Update Remediation Status
  const handleStatusUpdate = async (logId, status) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.updateLogStatus(logId, status);
      
      // Update selected log state to refresh drawer immediately
      setSelectedLog(res.log);
      
      // Update local logs list state to avoid a redundant request
      setLogs(prev => prev.map(log => log._id === logId ? { ...log, status } : log));
      
      // Refresh analytics counters
      fetchStats();
      showToast(`Log marked as ${status}.`, 'success');
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Error updating incident status.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Action: Ingestion success handler
  const handleUploadSuccess = () => {
    fetchLogs();
    fetchStats();
    showToast('Audit batch successfully ingested.', 'success');
  };

  // Sync selected log drawer object when logs list updates
  useEffect(() => {
    if (selectedLog) {
      const matchingLog = logs.find(l => l._id === selectedLog._id);
      if (matchingLog && matchingLog.status !== selectedLog.status) {
        setSelectedLog(matchingLog);
      }
    }
  }, [logs, selectedLog]);

  return (
    <div className="app-container">
      {/* Theme-based animated background: Birds (Light) / Fishes (Dark) */}
      <ThemeBackdrop theme={theme} />

      {/* Dynamic Animated Aurora Backdrop Blobs */}
      <div className="bg-glow-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Top Banner Header */}
      <header>
        <div className="logo-section">
          {/* Layered hexagon badge icon */}
          <div className="logo-badge">
            <div className="logo-badge-ring" />
            <div className="logo-badge-inner">
              <Shield size={20} className="logo-badge-icon" />
            </div>
          </div>

          {/* Stacked title block */}
          <div className="logo-text-block">
            <div className="logo-eyebrow">
              <span className="logo-pulse-dot" />
              LIVE · SEC-OPS PLATFORM
            </div>
            <h1 className="logo-title">
              AEGIS
              <span className="logo-title-accent"> AUDITING</span>
            </h1>
            <div className="logo-subtitle">Unified Audit Log Intelligence Center</div>
          </div>
        </div>

        <div className="header-actions">
          {/* Unique Theme Toggle Switch Capsule */}
          <div 
            className="theme-toggle-capsule" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Night' : 'Day'} Mode`}
          >
            <div className={`theme-toggle-slider ${theme}`} />
            <button 
              type="button" 
              className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
              aria-label="Light Mode"
            >
              <Sun size={14} />
            </button>
            <button 
              type="button" 
              className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
              aria-label="Dark Mode"
            >
              <Moon size={14} />
            </button>
          </div>

          <div className="header-status-chip">
            <span className="status-dot-green" />
            Systems Operational
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleRefreshAll}
            disabled={isLogsLoading || isStatsLoading}
            title="Refresh Dashboard"
          >
            <RefreshCw size={16} className={isLogsLoading || isStatsLoading ? 'spin-anim' : ''} />
            Refresh
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => setIsUploadOpen(true)}
          >
            <Upload size={16} />
            Ingest Logs
          </button>
        </div>
      </header>

      {/* Main Panel layout */}
      <main>
        {/* Section 1: Dashboard Stats */}
        <AnalyticsSummary stats={stats} />

        {/* Section 2: Search Console */}
        <LogFilters onFilterChange={handleFilterChange} />

        {/* Section 3: Data Table */}
        <LogTable 
          logs={logs}
          total={stats.totalLogs || 0}
          page={page}
          pages={Math.ceil((stats.totalLogs || 0) / limit)}
          limit={limit}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isLoading={isLogsLoading}
          onSort={handleSort}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onRowClick={setSelectedLog}
        />
      </main>

      {/* Drawer Details Overlay */}
      {selectedLog && (
        <LogDetailsModal 
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onStatusUpdate={handleStatusUpdate}
          isUpdating={isUpdatingStatus}
        />
      )}

      {/* Upload File Modal Overlay */}
      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Dynamic Toast notifications */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-text">{toast.message}</div>
        </div>
      )}

      {/* Style extensions for micro-animations */}
      <style>{`
        .spin-anim {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
