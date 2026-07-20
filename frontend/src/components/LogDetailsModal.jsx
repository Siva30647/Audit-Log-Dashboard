import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Shield, Terminal, ShieldAlert, Cpu } from 'lucide-react';

export default function LogDetailsModal({ log, onClose, onStatusUpdate, isUpdating = false }) {
  const [status, setStatus] = useState('');

  // Sync state with selected log
  useEffect(() => {
    if (log) {
      setStatus(log.status);
    }
  }, [log]);

  if (!log) return null;

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onStatusUpdate(log._id, newStatus);
  };

  const getSeverityClass = (sev) => {
    const s = String(sev).toUpperCase();
    if (s === 'CRITICAL') return 'badge-severity-critical';
    if (s === 'HIGH') return 'badge-severity-high';
    if (s === 'MEDIUM') return 'badge-severity-medium';
    return 'badge-severity-low';
  };

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + ` (${iso})`;
    } catch (err) {
      return iso;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-overlay" onClick={onClose} />

      {/* Side-Drawer container */}
      <div className="drawer-container">
        <div className="drawer-header">
          <div className="drawer-title-area">
            <h2>Log Investigation</h2>
            <p>ID: {log._id}</p>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Panel">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {/* Severity & Status Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className={`badge ${getSeverityClass(log.severity)}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              {log.severity} Severity
            </span>
            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
              Status: <strong>{log.status}</strong>
            </span>
          </div>

          {/* Quick properties card grid */}
          <div className="properties-list">
            <div className="property-item">
              <span className="property-label">
                <User size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                Actor Email
              </span>
              <span className="property-value">{log.actor}</span>
            </div>

            <div className="property-item">
              <span className="property-label">
                <Shield size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                Access Role
              </span>
              <span className="property-value mono">{log.role ? String(log.role).toUpperCase() : ''}</span>
            </div>

            <div className="property-item">
              <span className="property-label">
                <Terminal size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                Audit Action
              </span>
              <span className="property-value mono" style={{ color: 'hsl(var(--warning))' }}>{log.action}</span>
            </div>

            <div className="property-item">
              <span className="property-label">
                <Cpu size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                Resource Type
              </span>
              <span className="property-value">{log.resourceType ? String(log.resourceType).toUpperCase() : ''}</span>
            </div>

            <div className="property-item" style={{ gridColumn: 'span 2' }}>
              <span className="property-label">Requested API Resource</span>
              <span className="property-value mono" style={{ color: 'hsl(var(--primary))' }}>{log.resource}</span>
            </div>

            <div className="property-item">
              <span className="property-label">Client IP Address</span>
              <span className="property-value mono">{log.ipAddress}</span>
            </div>

            <div className="property-item">
              <span className="property-label">AWS Region</span>
              <span className="property-value mono">{log.region}</span>
            </div>

            <div className="property-item" style={{ gridColumn: 'span 2' }}>
              <span className="property-label">
                <Calendar size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                Event Timestamp
              </span>
              <span className="property-value mono">{formatTime(log.timestamp)}</span>
            </div>
          </div>

          {/* Raw JSON block */}
          <div className="json-viewer-wrapper">
            <span className="property-label" style={{ marginBottom: '0.25rem', display: 'block' }}>Raw Log JSON Structure</span>
            <pre className="json-viewer">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </div>

        {/* Action status remediations */}
        <div className="drawer-footer">
          <div className="action-status-changer">
            <label htmlFor="status-select">Remediation Status:</label>
            <select
              id="status-select"
              className="select-input"
              value={status}
              onChange={handleStatusChange}
              disabled={isUpdating}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="Unresolved">Unresolved</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
