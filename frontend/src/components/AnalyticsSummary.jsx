import React from 'react';
import { ShieldAlert, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AnalyticsSummary({ stats }) {
  const {
    totalLogs = 0,
    severityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    statusCounts = { Resolved: 0, Unresolved: 0, 'In Progress': 0 },
    regionStats = [],
    topActors = [],
    topActions = []
  } = stats || {};

  // Calculate critical/high counts
  const criticalCount = severityCounts.CRITICAL || 0;
  const highCount = severityCounts.HIGH || 0;
  const criticalHighTotal = criticalCount + highCount;

  // Unresolved counts
  const unresolvedCount = statusCounts.Unresolved || 0;
  const inProgressCount = statusCounts['In Progress'] || 0;
  const unresolvedTotal = unresolvedCount + inProgressCount;

  // Resolved count
  const resolvedCount = statusCounts.Resolved || 0;

  // Calculate percentages helper
  const getPercentage = (count) => {
    if (totalLogs === 0) return 0;
    return Math.round((count / totalLogs) * 100);
  };

  return (
    <div className="analytics-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stat Cards Row */}
      <div className="analytics-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalLogs.toLocaleString()}</span>
            <span className="stat-label">Total Audit Events</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon danger">
            <ShieldAlert size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{unresolvedTotal.toLocaleString()}</span>
            <span className="stat-label">Unresolved Alerts</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon warning">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{criticalHighTotal.toLocaleString()}</span>
            <span className="stat-label">Critical & High Events</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon success">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{resolvedCount.toLocaleString()}</span>
            <span className="stat-label">Remediated Issues</span>
          </div>
        </div>
      </div>

      {/* Detail Breakdown Charts */}
      <div className="charts-grid">
        {/* Severity Breakdown */}
        <div className="glass-card">
          <h3 className="section-title">
            <ShieldAlert size={18} />
            Severity Breakdown
          </h3>
          <div className="custom-bar-chart">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
              const count = severityCounts[sev] || 0;
              const pct = getPercentage(count);
              const classMap = {
                CRITICAL: 'critical',
                HIGH: 'high',
                MEDIUM: 'medium',
                LOW: 'low'
              };
              return (
                <div className="chart-bar-row" key={sev}>
                  <div className="chart-bar-label">{sev}</div>
                  <div className="chart-bar-container">
                    <div 
                      className={`chart-bar-fill ${classMap[sev]}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="chart-bar-value">{count.toLocaleString()} ({pct}%)</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Active Actors */}
        <div className="glass-card">
          <h3 className="section-title">
            <Activity size={18} />
            Top Active Actors
          </h3>
          <div className="leaders-list">
            {topActors.length === 0 ? (
              <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No active actor data.
              </div>
            ) : (
              topActors.map((actor, idx) => {
                const maxVal = topActors[0]?.count || 1;
                const pct = Math.round((actor.count / maxVal) * 100);
                return (
                  <div className="leader-item" key={actor.name || idx}>
                    <div className="leader-meta">
                      <span className="leader-name" title={actor.name}>{actor.name || 'Unknown'}</span>
                      <span className="leader-count">{actor.count.toLocaleString()} actions</span>
                    </div>
                    <div className="leader-bar">
                      <div className="leader-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Actions & Regions */}
        <div className="glass-card">
          <h3 className="section-title">
            <AlertTriangle size={18} />
            Frequent Audit Actions
          </h3>
          <div className="leaders-list">
            {topActions.length === 0 ? (
              <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No action data recorded.
              </div>
            ) : (
              topActions.map((action, idx) => {
                const maxVal = topActions[0]?.count || 1;
                const pct = Math.round((action.count / maxVal) * 100);
                return (
                  <div className="leader-item" key={action.name || idx}>
                    <div className="leader-meta">
                      <span className="leader-name" title={action.name}>{action.name}</span>
                      <span className="leader-count">{action.count.toLocaleString()} times</span>
                    </div>
                    <div className="leader-bar">
                      <div className="leader-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(to right, hsl(var(--danger)), hsl(var(--warning)))' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
