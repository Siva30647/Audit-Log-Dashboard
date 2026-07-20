import fs from 'fs/promises';
import path from 'path';

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

const ipAddresses = [
  '192.168.1.45',
  '10.0.4.12',
  '172.16.89.201',
  '8.8.8.8',
  '192.168.1.1',
  '10.2.14.89',
  '82.165.12.98',
  '203.0.113.50',
  '198.51.100.15'
];

const regions = ['India', 'Russia', 'England', 'Indonesia', 'China', 'UK'];

const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statuses = ['Unresolved', 'Resolved', 'In Progress'];

export function generateLog(index, dateStart, dateEnd) {
  const resourceType = Object.keys(actionMap)[Math.floor(Math.random() * Object.keys(actionMap).length)];
  const actions = actionMap[resourceType];
  const resources = resourceMap[resourceType];
  
  const action = actions[Math.floor(Math.random() * actions.length)];
  const resource = resources[Math.floor(Math.random() * resources.length)];
  
  const actor = actors[Math.floor(Math.random() * actors.length)];
  const role = roles[Math.floor(Math.random() * roles.length)];
  const ipAddress = ipAddresses[Math.floor(Math.random() * ipAddresses.length)];
  const region = regions[Math.floor(Math.random() * regions.length)];
  
  // Custom weights for severity: LOW: 60%, MEDIUM: 25%, HIGH: 12%, CRITICAL: 3%
  let severity = 'LOW';
  const r = Math.random();
  if (r > 0.97) severity = 'CRITICAL';
  else if (r > 0.85) severity = 'HIGH';
  else if (r > 0.60) severity = 'MEDIUM';

  // Custom weights for status: Unresolved: 50%, In Progress: 20%, Resolved: 30%
  let status = 'Unresolved';
  const s = Math.random();
  if (s > 0.70) status = 'Resolved';
  else if (s > 0.50) status = 'In Progress';

  // Distribute timestamps over the last 30 days
  const timeStart = dateStart.getTime();
  const timeEnd = dateEnd.getTime();
  const randomTime = new Date(timeStart + Math.random() * (timeEnd - timeStart));

  return {
    actor,
    role,
    action,
    resource,
    resourceType,
    ipAddress,
    region,
    severity,
    status,
    timestamp: randomTime.toISOString()
  };
}

async function run() {
  const count = 10000;
  console.log(`[Generator] Generating ${count} realistic log records...`);
  
  const dateEnd = new Date();
  const dateStart = new Date();
  dateStart.setDate(dateStart.getDate() - 30); // 30 days ago

  const logs = [];
  for (let i = 0; i < count; i++) {
    logs.push(generateLog(i, dateStart, dateEnd));
  }

  // Ensure data folder exists
  const dataDir = path.resolve('data');
  await fs.mkdir(dataDir, { recursive: true });
  
  const filePath = path.join(dataDir, 'sample_10k_logs.json');
  await fs.writeFile(filePath, JSON.stringify(logs, null, 2), 'utf-8');
  console.log(`[Generator] Successfully wrote ${count} logs to ${filePath}`);
}

import { fileURLToPath } from 'url';

// Execute if run directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = path.resolve(process.argv[1]);
  const currentPath = fileURLToPath(import.meta.url);
  if (path.resolve(modulePath) === path.resolve(currentPath)) {
    run();
  }
}
export default run;
