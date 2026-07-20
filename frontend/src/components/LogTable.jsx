import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Database, ShieldAlert, ArrowLeftRight } from 'lucide-react';

export default function LogTable({
  logs = [],
  total = 0,
  page = 1,
  pages = 1,
  limit = 20,
  sortBy = 'timestamp',
  sortOrder = 'desc',
  isLoading = false,
  onSort = () => {},
  onPageChange = () => {},
  onLimitChange = () => {},
  onRowClick = () => {}
}) {

  const handleSortClick = (field) => {
    if (sortBy === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'desc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={12} />;
    return sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const formatTimestamp = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  const getSeverityBadgeClass = (severity) => {
    const s = String(severity).toUpperCase();
    if (s === 'CRITICAL') return 'badge-severity-critical';
    if (s === 'HIGH') return 'badge-severity-high';
    if (s === 'MEDIUM') return 'badge-severity-medium';
    return 'badge-severity-low';
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'resolved') return 'badge-status-resolved';
    if (s === 'in progress') return 'badge-status-inprogress';
    return 'badge-status-unresolved';
  };

  // Generate page list helper
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="glass-card table-card">
      <div className="table-header-toolbar">
        <div className="table-stats">
          Showing <strong>{logs.length}</strong> of <strong>{total.toLocaleString()}</strong> logs
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Logs per page:</span>
          <select 
            className="select-input" 
            value={limit} 
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: '6rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            <div className="spinner" style={{
              width: '30px',
              height: '30px',
              border: '2px solid hsl(var(--border))',
              borderTopColor: 'hsl(var(--primary))',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }} />
            <p>Loading audit events...</p>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-table-state">
            <Database size={48} className="empty-icon" />
            <h3>No audit logs found</h3>
            <p>Try modifying your search queries, adjusting filters, or upload a log batch.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSortClick('timestamp')}>
                  Timestamp {renderSortIcon('timestamp')}
                </th>
                <th className="sortable" onClick={() => handleSortClick('severity')}>
                  Severity {renderSortIcon('severity')}
                </th>
                <th className="sortable" onClick={() => handleSortClick('status')}>
                  Status {renderSortIcon('status')}
                </th>
                <th className="sortable" onClick={() => handleSortClick('actor')}>
                  Actor {renderSortIcon('actor')}
                </th>
                <th>Role</th>
                <th>Action</th>
                <th>Type</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} onClick={() => onRowClick(log)}>
                  <td className="mono">{formatTimestamp(log.timestamp)}</td>
                  <td>
                    <span className={`badge ${getSeverityBadgeClass(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="truncate-text" title={log.actor}><strong>{log.actor}</strong></td>
                  <td className="mono">{log.role ? String(log.role).toUpperCase() : ''}</td>
                  <td className="truncate-text mono" title={log.action} style={{ color: 'hsl(var(--warning))' }}>{log.action}</td>
                  <td><span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.08)', color: 'hsl(var(--primary))', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{log.resourceType ? String(log.resourceType).toUpperCase() : ''}</span></td>
                  <td className="mono">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar */}
      {pages > 1 && (
        <div className="pagination-controls">
          <div className="pagination-info">
            Page <strong>{page}</strong> of <strong>{pages}</strong>
          </div>
          <div className="pagination-buttons">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => onPageChange(1)}
              title="First Page"
            >
              &laquo;
            </button>
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              title="Previous Page"
            >
              &lt;
            </button>
            
            {getPageNumbers().map((p, index) => {
              if (p === '...') {
                return <span key={`dots-${index}`} style={{ padding: '0 0.5rem', color: 'hsl(var(--text-muted))' }}>...</span>;
              }
              return (
                <button
                  key={p}
                  className={`page-btn ${page === p ? 'active' : ''}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              );
            })}

            <button
              className="page-btn"
              disabled={page === pages}
              onClick={() => onPageChange(page + 1)}
              title="Next Page"
            >
              &gt;
            </button>
            <button
              className="page-btn"
              disabled={page === pages}
              onClick={() => onPageChange(pages)}
              title="Last Page"
            >
              &raquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
