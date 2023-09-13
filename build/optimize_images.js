const sharp = require('sharp');
const { glob } = require('glob');
const { program } = require('commander');
const fs = require('fs');

program
  .option('-s, --source <value>', 'Source path of image asset(s)')
  .parse(process.argv);

const options = program.opts();

if (!options.source) {
  console.error('--source option is required.');
  process.exit(1);
}

const inputSvgPattern = options.source; // Adjust the pattern to match your SVG files.

const scales = [1, 1.25, 1.5, 2.25];

// Define a function to convert SVG to PNG at a specific scale
function convertToPng(input, output, scale) {
  sharp(input)
    .resize({ width: Math.round(scale * 100) + '%' })
    .toFile(output, (err) => {
      if (err) {
        console.error(`Error converting ${input} to ${output}: ${err}`);
      } else {
        console.log(`Converted ${input} to ${output}`);
      }
    });
}

// Use glob to find matching SVG files
glob(inputSvgPattern, (err, svgFiles) => {
  if (err) {
    console.error(`Error finding SVG files: ${err}`);
    return;
  }

  svgFiles.forEach((inputSvg) => {
    const outputDir = inputSvg.replace(/\.svg$/, '/');
    fs.mkdirSync(outputDir, { recursive: true });

    scales.forEach((scale) => {
      const outputPng = `${outputDir}@${scale}x.png`;
      convertToPng(inputSvg, outputPng, scale);
    });
  });
});
