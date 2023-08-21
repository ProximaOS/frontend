const fs = require('fs');

const packageJsonPath = '../package.json';
const packageJson = require(packageJsonPath);

const [major, minor, patch, build] = packageJson.version.split('.');
const newBuild = parseInt(build) + 1;

packageJson.version = `${major}.${minor}.${patch}.${newBuild}`;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
