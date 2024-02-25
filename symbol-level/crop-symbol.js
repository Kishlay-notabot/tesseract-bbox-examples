const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

function cropSymbolsFromJson(jsonFilePath, outputRootFolder) {
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  let totalSymbolCount = 0;
  let croppedSymbolCount = 0;
  const imageProcessingPromises = [];
  const commonOutputFolder = path.join(outputRootFolder, 'cropped_symbols');

  if (!fs.existsSync(commonOutputFolder)) {
    fs.mkdirSync(commonOutputFolder, { recursive: true });
  }

  jsonData.forEach(({ imageName, symbols }) => {
    console.log(`Processing image: ${imageName}`);
    const imagePath = path.join(__dirname, 'input_images', imageName);

    try {
      const imagePromise = loadImage(imagePath).then((image) => {
        symbols.forEach(({ text, bbox }, index) => {
          totalSymbolCount++;

          const { x0, y0, x1, y1 } = bbox;
          const width = x1 - x0;
          const height = y1 - y0;
          const aspectRatio = width / height;

          if (width > 20 && height > 20 && Math.abs(aspectRatio - 1) < 3) {
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, x0, y0, width, height, 0, 0, width, height);
            const sanitizedText = text.replace(/[^a-zA-Z0-9]/g, '_');
            const outputFilePath = path.join(commonOutputFolder, `${imageName}_${index + 1}_${sanitizedText}.png`);

            try {
              fs.writeFileSync(outputFilePath, canvas.toBuffer('image/png'));
              console.log(`Cropped and saved: ${outputFilePath}`);
              croppedSymbolCount++;
            } catch (writeError) {
              console.error(`Error writing file: ${outputFilePath}`, writeError);
            }
          } else {
            console.log(`Symbol skipped: ${text}`);
          }
        });

        console.log(`Finished processing image: ${imageName}`);
      });

      imageProcessingPromises.push(imagePromise);
    } catch (loadError) {
      console.error(`Error loading image: ${imageName}`, loadError);
    }
  });

  Promise.all(imageProcessingPromises).then(() => {
    console.log(`Total number of symbols cropped: ${croppedSymbolCount} out of ${totalSymbolCount}`);
  });
}

const jsonFilePath = 'ocr_results.json';
const outputRootFolder = 'output_images';

if (!fs.existsSync(outputRootFolder)) {
  fs.mkdirSync(outputRootFolder);
}

cropSymbolsFromJson(jsonFilePath, outputRootFolder);
