const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const AdmZip = require('adm-zip');

program
  .option('-s, --source <value>', 'Source path of webapps')
  .option('-d, --dest <value>', 'Compiled output destination of webapps')
  .parse(process.argv);

const options = program.opts();

if (!options.source || !options.dest) {
  console.error('Both --source and --dest options are required.');
  process.exit(1);
}

const sourceDir = options.source;
const outputDir = options.dest;

const ignoredFiles = [
  'node_modules',
  'package-lock.json'
];

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
} else {
  fs.rmdirSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir);
}

// Read the list of webapps in the source directory
const webapps = fs.readdirSync(sourceDir);

// Loop through each webapp and create a zip file
webapps.forEach((webapp) => {
  const webappPath = path.join(sourceDir, webapp);
  const zip = new AdmZip();

  const outputwebappPath = path.join(outputDir, webapp);
  if (!fs.existsSync(outputwebappPath)) {
    fs.mkdirSync(outputwebappPath);
  }

  const webappFiles = fs.readdirSync(path.join(sourceDir, webapp));
  webappFiles.forEach(file => {
    if (ignoredFiles.indexOf(file) === -1) {
      const sourcePath = path.join(sourceDir, webapp, file);
      const destPath = path.join(outputDir, webapp, file);
      fs.copyFileSync(sourcePath, destPath);
    }
  });

  // Add all files and subdirectories from the webapp directory except 'node_modules' to the zip
  const filesToZip = fs.readdirSync(webappPath);
  filesToZip.forEach(file => {
    if (ignoredFiles.indexOf(file) === -1) {
      const sourcePath = path.join(webappPath, file);
      if (fs.statSync(sourcePath).isDirectory()) {
        zip.addLocalFolder(sourcePath, file);
      } else {
        zip.addLocalFile(sourcePath, path.dirname(file));
      }
    }
  });

  // Save the zip file to the output directory
  const outputPath = path.join(outputDir, webapp, 'webapp.zip');
  zip.writeZip(outputPath);

  console.log(`webapp '${webapp}' zipped to '${outputPath}'`);
});

console.log('All webapps zipped successfully.');
