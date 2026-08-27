'use strict';

const { spawnSync } = require('node:child_process');

const AUDIT_ARGUMENTS = [
  'npm',
  'audit',
  '--all',
  '--recursive',
  '--severity',
  'moderate',
  '--json',
];

function classifyAuditOutput(output) {
  const records = [];
  const diagnostics = [];
  for (const line of output.split(/\r?\n/u)) {
    const candidate = line.trim();
    if (!candidate) continue;
    try {
      const record = JSON.parse(candidate);
      if (record && typeof record === 'object' && 'value' in record && 'children' in record) {
        records.push(record);
      } else {
        diagnostics.push(candidate);
      }
    } catch {
      diagnostics.push(candidate);
    }
  }
  const deprecations = records.filter(record =>
    String(record.children?.ID ?? '').endsWith('(deprecation)'),
  );
  return {
    deprecations,
    diagnostics,
    records,
    vulnerabilities: records.filter(record => !deprecations.includes(record)),
  };
}

function runAudit() {
  const result = spawnSync(process.env.npm_execpath || 'yarn', AUDIT_ARGUMENTS, {
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0' },
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.error) {
    console.error(`Dependency audit could not start: ${result.error.message}`);
    return 1;
  }
  if (result.stderr) process.stderr.write(result.stderr);
  const classified = classifyAuditOutput(result.stdout ?? '');
  for (const diagnostic of classified.diagnostics) console.error(diagnostic);
  for (const record of classified.deprecations) {
    console.warn(
      `DEPRECATION: ${String(record.value)} - ${String(record.children?.Issue ?? 'No details')}`,
    );
  }
  for (const record of classified.vulnerabilities) {
    console.error(
      `VULNERABILITY: ${String(record.value)} (${String(record.children?.Severity ?? 'unknown')}) - ${String(record.children?.Issue ?? 'No details')}`,
    );
  }
  if (classified.vulnerabilities.length > 0) return 1;
  if ((result.status ?? 1) !== 0 && classified.records.length === 0) {
    console.error('Dependency audit failed without a parseable advisory response.');
    return result.status ?? 1;
  }
  console.log(
    `Dependency security audit passed: 0 moderate-or-higher vulnerabilities; ${classified.deprecations.length} reported deprecation(s).`,
  );
  return 0;
}

if (require.main === module) process.exitCode = runAudit();

module.exports = { classifyAuditOutput, runAudit };
