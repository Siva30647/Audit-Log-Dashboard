import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, FileJson, Download } from 'lucide-react';
import { api } from '../utils/api.js';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, validating, uploading, success, error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [recordsCount, setRecordsCount] = useState(0);
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    
    // Check if it's JSON
    if (!selectedFile.name.endsWith('.json')) {
      setStatus('error');
      setErrorMsg('Invalid file type. Please upload a standard .json file.');
      return;
    }

    setFile(selectedFile);
    setStatus('validating');
    setProgress(20);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        setProgress(50);
        try {
          const content = JSON.parse(e.target.result);
          
          if (!Array.isArray(content)) {
            setStatus('error');
            setErrorMsg('File content must be a JSON array of log records.');
            return;
          }
          
          setRecordsCount(content.length);
          setProgress(70);
          setStatus('uploading');
          
          // Call API
          const res = await api.uploadLogs(content);
          
          setProgress(100);
          setStatus('success');
          onUploadSuccess();
        } catch (jsonErr) {
          setStatus('error');
          setErrorMsg('Failed to parse JSON file. Please ensure it is a valid JSON document.');
        }
      };

      reader.onerror = () => {
        setStatus('error');
        setErrorMsg('Error reading file from disk.');
      };

      reader.readAsText(selectedFile);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred during file upload.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const resetUploader = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    setRecordsCount(0);
  };

  // Client-side 10,000 dummy logs generator
  const generateAndDownloadDummyLogs = () => {
    const actors = [
      'priya.nair@company.com',
      'john.doe@company.com',
      'alex.jones@company.com',
      'system-agent@internal.net',
      'sarah.connor@company.com',
      'external-contractor@partner.org',
      'security-bot@secops.local',
      'devops-runner@github-actions.internal'
    ];
    const roles = ['ADMIN', 'USER', 'DEVELOPER', 'SYSTEM', 'GUEST', 'AUDITOR', 'SECURITY_ENGINEER'];
    const actionMap = {
      USER: ['DELETE_USER', 'CREATE_USER', 'SUSPEND_ACCOUNT', 'PASSWORD_RESET', 'UPDATE_ROLE'],
      AUTH: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'CREATE_API_KEY', 'REVOKE_API_KEY', 'MFA_ENABLED'],
      DATA: ['ACCESS_SENSITIVE_DATA', 'DOWNLOAD_BACKUP', 'EXPORT_DB', 'MODIFY_DATABASE', 'PURGE_LOGS'],
      INFRASTRUCTURE: ['REBOOT_SERVER', 'DEPLOY_SERVICE', 'MODIFY_FIREWALL', 'SSH_CONNECT', 'AWS_CONFIG_CHANGE'],
      CONFIG: ['UPDATE_SETTINGS', 'ENABLE_FEATURE_FLAG', 'ROTATE_SECRETS', 'DISABLE_AUDIT']
    };
    const resourceMap = {
      USER: ['/api/users/334', '/api/users/active', '/api/users/new', '/api/users/roles/assign'],
      AUTH: ['/api/auth/login', '/api/auth/mfa/verify', '/api/auth/tokens/generate', '/api/auth/keys'],
      DATA: ['/database/production-backup.sql', '/api/reports/financials', '/database/users_table', '/api/logs/archive'],
      INFRASTRUCTURE: ['/infrastructure/core-switch-01', '/api/v1/deployments/production', '/infrastructure/database-primary', '/security/firewall-rules'],
      CONFIG: ['/api/settings/security', '/api/features/flags', '/vault/secrets/database']
    };
    const ipAddresses = ['192.168.1.45', '10.0.4.12', '172.16.89.201', '8.8.8.8', '192.168.1.1', '10.2.14.89', '82.165.12.98'];
    const regions = ['India', 'Russia', 'England', 'Indonesia', 'China', 'UK'];
    
    const count = 10000;
    const logs = [];
    const dateEnd = new Date();
    const dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - 30);
    
    for (let i = 0; i < count; i++) {
      const typeKeys = Object.keys(actionMap);
      const resourceType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
      const actions = actionMap[resourceType];
      const resources = resourceMap[resourceType];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resource = resources[Math.floor(Math.random() * resources.length)];
      
      const actor = actors[Math.floor(Math.random() * actors.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const ipAddress = ipAddresses[Math.floor(Math.random() * ipAddresses.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      
      let severity = 'LOW';
      const r = Math.random();
      if (r > 0.97) severity = 'CRITICAL';
      else if (r > 0.85) severity = 'HIGH';
      else if (r > 0.60) severity = 'MEDIUM';

      let status = 'Unresolved';
      const s = Math.random();
      if (s > 0.70) status = 'Resolved';
      else if (s > 0.50) status = 'In Progress';

      const timeStart = dateStart.getTime();
      const timeEnd = dateEnd.getTime();
      const timestamp = new Date(timeStart + Math.random() * (timeEnd - timeStart)).toISOString();

      logs.push({ actor, role, action, resource, resourceType, ipAddress, region, severity, status, timestamp });
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "audit_logs_10k_sample.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={18} style={{ color: 'hsl(var(--primary))' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Bulk Audit Log Ingestion</h2>
          </div>
          {status !== 'validating' && status !== 'uploading' && (
            <button className="close-btn" onClick={onClose} title="Close Modal">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="modal-body">
          {/* IDLE / READY STATE */}
          {status === 'idle' && (
            <div 
              className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden-file-input" 
                accept=".json"
                onChange={handleFileChange}
              />
              <div className="upload-icon-wrapper">
                <FileJson size={32} />
              </div>
              <h4>Drag & drop audit log JSON here</h4>
              <p>or click to browse local files</p>
              <div className="upload-instructions">
                <strong>Ingestion constraints:</strong> Accepts JSON files containing arrays of audit log structures up to 20,000 events.
              </div>
            </div>
          )}

          {/* VALIDATING / UPLOADING STATES */}
          {(status === 'validating' || status === 'uploading') && (
            <div className="upload-progress-container">
              <div className="progress-info">
                <span>{status === 'validating' ? 'Validating schema structure...' : `Ingesting ${recordsCount.toLocaleString()} audit records...`}</span>
                <span className="mono">{progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              {file && (
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
                  Target file: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="upload-success-state">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={56} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>Audit Log Ingestion Successful</h3>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                Ingested and indexed <strong>{recordsCount.toLocaleString()}</strong> log entries to the active database.
              </p>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={onClose}
                style={{ marginTop: '0.5rem', padding: '0.5rem 1.5rem' }}
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <div className="upload-success-state" style={{ gap: '0.5rem' }}>
              <div className="success-icon-wrapper" style={{ color: 'hsl(var(--danger))' }}>
                <AlertCircle size={56} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>Ingestion Failed</h3>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', maxWidth: '400px' }}>
                {errorMsg}
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={resetUploader}
                >
                  Try Again
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {status === 'idle' && (
          <div className="modal-footer">
            <div className="generate-dummy-section">
              <span>Need testing logs?</span>
              <button 
                type="button" 
                className="generate-dummy-link"
                onClick={generateAndDownloadDummyLogs}
              >
                <Download size={10} style={{ marginRight: '3px' }} />
                Generate and download 10k logs JSON
              </button>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
