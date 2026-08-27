'use strict';

const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const lockfile = readFileSync(resolve(process.cwd(), 'yarn.lock'), 'utf8');
const tr46Versions = [...lockfile.matchAll(/resolution: "tr46@npm:(\d+)\.[^"]+"/g)].map(match =>
  Number.parseInt(match[1], 10),
);
const legacyVersions = tr46Versions.filter(major => major < 5);
const deprecatedDomExceptionLocators = [
  ...lockfile.matchAll(/resolution: "node-domexception@npm:([^"]+)"/g),
];

if (legacyVersions.length > 0) {
  throw new Error(
    'Deprecated node:punycode runtime path detected through tr46 < 5. ' +
      'Upgrade the owning dependency instead of suppressing DEP0040.',
  );
}

if (deprecatedDomExceptionLocators.length > 0) {
  throw new Error(
    'Deprecated node-domexception package detected. Upgrade the owning dependency ' +
      'instead of accepting or suppressing the obsolete package.',
  );
}

console.log(
  `Runtime deprecation guard passed (${tr46Versions.length} modern tr46 locator(s); ` +
    'deprecated node-domexception absent).',
);
