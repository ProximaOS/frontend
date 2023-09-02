const fs = require('fs');

const packageJsonPath = 'package.json';
const orchidAppJsonPath = 'orchid_app.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const orchidAppJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const currentVersion = packageJson.version;
const preReleaseTag = currentVersion.split('-')[1]; // Extract pre-release tag

// Increment the pre-release tag number
const tagNumber = parseInt(preReleaseTag.substring(1)); // Remove the 'b' prefix and convert to number
const newTagNumber = tagNumber + 1;

const newVersion = currentVersion.replace(preReleaseTag, `b${newTagNumber}`);
packageJson.version = newVersion;
orchidAppJson.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
fs.writeFileSync(orchidAppJsonPath, JSON.stringify(orchidAppJson, null, 2));
console.log(`Updated version to: ${newVersion}`);
