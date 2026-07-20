import React, { useState } from 'react';
import { 
  Search, X, RotateCcw, SlidersHorizontal, 
  ShieldAlert, Activity, ChevronDown, 
  User, Globe, Cpu, Calendar 
} from 'lucide-react';

const COMMON_ROLES = ['ADMIN', 'USER', 'DEVELOPER', 'SYSTEM', 'GUEST', 'AUDITOR'];
const COMMON_REGIONS = ['India', 'Russia', 'England', 'Indonesia', 'China', 'UK'];
const RESOURCE_TYPES = ['USER', 'AUTH', 'DATA', 'INFRASTRUCTURE', 'CONFIG'];

export default function LogFilters({ onFilterChange }) {
  const defaultFilters = {
    search: '',
    severity: '',
    status: '',
    role: '',
    region: '',
    resourceType: '',
    startDate: '',
    endDate: ''
  };

  const [localFilters, setLocalFilters] = useState(defaultFilters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleInputChange = (field, value) => {
    const updated = { ...localFilters, [field]: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  // Handles toggle logic for button pills
  const handlePillToggle = (field, value) => {
    // If already active, toggle it OFF (set to empty string), otherwise toggle it ON
    const newValue = localFilters[field] === value ? '' : value;
    handleInputChange(field, newValue);
  };

  const handleClearField = (field) => {
    handleInputChange(field, '');
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="glass-card filters-container">
      {/* Header with tactical alert tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <h3 className="section-title" style={{ marginBottom: 0 }}>
          <SlidersHorizontal size={18} />
          Investigate & Filter Logs
        </h3>
        <span style={{ 
          fontSize: '0.7rem', 
          background: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid rgba(59, 130, 246, 0.3)', 
          color: 'hsl(var(--primary))', 
          padding: '0.15rem 0.5rem', 
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          letterSpacing: '0.05em'
        }}>
          ACTIVE MONITORING
        </span>
      </div>

      {/* Primary Search bar with neon focus */}
      <div className="search-box-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by actor email, IP address, or API resource URL..."
          value={localFilters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
        />
        {localFilters.search && (
          <button 
            type="button" 
            onClick={() => handleClearField('search')}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--text-muted))',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Interactive Pills Layout for Severity and Status */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem', 
        margin: '0.5rem 0 0.25rem' 
      }}>
        {/* Severity Pills Row */}
        <div className="filter-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--text-secondary))' }}>
            <ShieldAlert size={13} style={{ color: 'hsl(var(--primary))' }} />
            Severity Level
          </label>
          <div className="filter-pills-row">
            {[
              { id: 'CRITICAL', label: 'Critical', colorClass: 'critical' },
              { id: 'HIGH', label: 'High', colorClass: 'high' },
              { id: 'MEDIUM', label: 'Medium', colorClass: 'medium' },
              { id: 'LOW', label: 'Low', colorClass: 'low' }
            ].map(pill => (
              <button
                key={pill.id}
                type="button"
                className={`filter-pill ${localFilters.severity === pill.id ? `active ${pill.colorClass}` : ''}`}
                onClick={() => handlePillToggle('severity', pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Pills Row */}
        <div className="filter-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--text-secondary))' }}>
            <Activity size={13} style={{ color: 'hsl(var(--primary))' }} />
            Incident Status
          </label>
          <div className="filter-pills-row">
            {[
              { id: 'Unresolved', label: 'Unresolved', colorClass: 'unresolved' },
              { id: 'In Progress', label: 'In Progress', colorClass: 'inprogress' },
              { id: 'Resolved', label: 'Resolved', colorClass: 'resolved' }
            ].map(pill => (
              <button
                key={pill.id}
                type="button"
                className={`filter-pill ${localFilters.status === pill.id ? `active ${pill.colorClass}` : ''}`}
                onClick={() => handlePillToggle('status', pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Drawer Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          className="advanced-toggle-btn"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          <ChevronDown 
            size={16} 
            style={{ 
              transform: isAdvancedOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform var(--transition-fast)'
            }} 
          />
          {isAdvancedOpen ? 'Hide Advanced Console' : 'Show Advanced Console'}
        </button>
      </div>

      {/* Collapsible Advanced Console grid */}
      {isAdvancedOpen && (
        <div className="advanced-panel">
          {/* Resource Type */}
          <div className="filter-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Cpu size={12} style={{ opacity: 0.8 }} /> Resource Type
            </label>
            <select
              className="select-input"
              value={localFilters.resourceType}
              onChange={(e) => handleInputChange('resourceType', e.target.value)}
            >
              <option value="">All Resource Types</option>
              {RESOURCE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Actor Role */}
          <div className="filter-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={12} style={{ opacity: 0.8 }} /> Actor Role
            </label>
            <select
              className="select-input"
              value={localFilters.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
            >
              <option value="">All Roles</option>
              {COMMON_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* AWS Region */}
          <div className="filter-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Globe size={12} style={{ opacity: 0.8 }} /> Region
            </label>
            <select
              className="select-input"
              value={localFilters.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
            >
              <option value="">All Regions</option>
              {COMMON_REGIONS.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="filter-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={12} style={{ opacity: 0.8 }} /> Start Date
            </label>
            <input
              type="date"
              className="date-input"
              value={localFilters.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="filter-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={12} style={{ opacity: 0.8 }} /> End Date
            </label>
            <input
              type="date"
              className="date-input"
              value={localFilters.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Form Action Footer */}
      <div className="filters-footer" style={{ borderTop: '1px solid rgba(15, 23, 42, 0.06)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={handleReset}
          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
        >
          <RotateCcw size={14} />
          Reset Search
        </button>
      </div>
    </div>
  );
}
