'use strict';

const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const manifestPath = resolve(__dirname, '..', '..', 'package.json');
const requestedChannel = process.env.IOTERAX_DEPENDENCY_CHANNEL || 'local';
const allowedChannels = new Set(['stable', 'dev', 'local']);
if (!allowedChannels.has(requestedChannel)) {
  throw new TypeError(`Unsupported ioterax dependency channel: ${requestedChannel}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const dependencySections = ['dependencies', 'devDependencies', 'optionalDependencies'];
const channelExceptions = new Map([['@ioterax/nestjs-i18n', '11.0.0-ix']]);
const discoveredPackages = new Set();
const updatedPackages = new Set();

for (const section of dependencySections) {
  const dependencies = manifest[section];
  if (!dependencies) continue;
  for (const packageName of Object.keys(dependencies)) {
    if (!packageName.startsWith('@ioterax/')) continue;
    const exceptionVersion = channelExceptions.get(packageName);
    if (exceptionVersion) {
      if (dependencies[packageName] !== exceptionVersion) {
        throw new Error(`${packageName} must remain on the approved ${exceptionVersion} exception`);
      }
      continue;
    }
    discoveredPackages.add(packageName);
    if (requestedChannel === 'stable') {
      if (/^npm:(?:dev|local)$/.test(dependencies[packageName])) {
        throw new Error(`${packageName} must use a stable selector in the master image`);
      }
      continue;
    }
    dependencies[packageName] = `npm:${requestedChannel}`;
    updatedPackages.add(packageName);
  }
}

if (discoveredPackages.size === 0) {
  throw new Error('No @ioterax/* dependencies were found for the Docker build');
}
if (updatedPackages.size > 0) {
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
console.log(`Prepared ${discoveredPackages.size} @ioterax dependencies for ${requestedChannel}.`);
