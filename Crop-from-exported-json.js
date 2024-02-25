const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

function cropImagesFromJson(jsonFilePath, outputRootFolder) {
    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    let totalWordCount = 0;
    let croppedWordCount = 0;
    const imageProcessingPromises = []
    const commonOutputFolder = path.join(outputRootFolder, 'cropped_words');
    if (!fs.existsSync(commonOutputFolder)) {
        fs.mkdirSync(commonOutputFolder);
    }

    jsonData.forEach(({ imageName, words }) => {
        console.log(`Processing image: ${imageName}`);
        const imagePath = path.join(__dirname, 'input_images', imageName);


        try {
            const imagePromise = loadImage(imagePath).then((image) => {
                words.forEach(({ text, bbox }, index) => {
                    totalWordCount++;
                
                    console.log(`Processing word: ${text}`);
                
                    const { x0, y0, x1, y1 } = bbox;
                    const width = x1 - x0;
                    const height = y1 - y0;
                // size filter 
                //try 20x20 !!!
                    if (width > 20 && height > 20) {
                        const canvas = createCanvas(width, height);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(image, x0, y0, width, height, 0, 0, width, height);
                        const sanitizedText = text.replace(/[^a-zA-Z0-9]/g, '_');
                        const outputFilePath = path.join(commonOutputFolder, `${imageName}_${index + 1}_${sanitizedText}.png`);
                
                        try {
                            fs.writeFileSync(outputFilePath, canvas.toBuffer('image/png'));
                            console.log(`Cropped and saved: ${outputFilePath}`);
                            croppedWordCount++;
                        } catch (writeError) {
                            console.error(`Error writing file: ${outputFilePath}`, writeError);
                        }
                    } else {
                        console.log(`Word skipped due to small size: ${text}`);
                    }
                });
                

                console.log(`Finished processing image: ${imageName}`);
            });

            imageProcessingPromises.push(imagePromise);
        } catch (loadError) {
            console.error(`Error loading image: ${imageName}`, loadError);
        }
    });

    // Use Promise.all to wait for all image processing promises to resolve
    Promise.all(imageProcessingPromises).then(() => {
        console.log(`Total number of words cropped: ${croppedWordCount} out of ${totalWordCount}`);
    });
}

const jsonFilePath = 'ocr_results.json'; 
const outputRootFolder = 'output_images'; 

// Create the root output folder if it doesn't exist
if (!fs.existsSync(outputRootFolder)) {
    fs.mkdirSync(outputRootFolder);
} 
cropImagesFromJson(jsonFilePath, outputRootFolder);



// added size filter, so that hyphen/dot/false detections do not get saved/ get saved to another folder [maybe limit coordinate size from json]
