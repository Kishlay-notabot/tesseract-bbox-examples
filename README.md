# tesseract-bbox-examples V5
## Use node.js to run these files!
Complex examples for tesseract.js which can help users to generate and export bbox data of detected words, crop individual images etc.  <br><br>
**I strongly recommend to visit the dcda repository to see and understand the use case of this code in detail.**  <br><br>
These examples are coded and directly implemented during the development of this project https://github.com/Kishlay-notabot/dcda/  


# Explanation
I was working on the dcda project above and I wanted to use Tesseract engine to give me bbox data of the detected symbols/words. I could not find any examples related to it on the internet so I had to reverse engineer the demo code at https://tesseract.projectnaptha.com/ and see how the code outlines the bbox data. It introduced me to canvas API. And then it was an easy [not so easy] journey ahead.

Below is the explanation of all the files included above:

## 1. OCR-and-bbox-export.js
This code executes word level detection on the input images and exports the output to the same `input_images` folder as ocr_results.json.  
## 2. Crop-from-exported-json.js
This code uses the exported json file to crop out individual images of the words detected in the input images. It contains a size threshold and also a aspect ratio threshold to discard false detections to a limit.  
## 3. Folder: Symbol-level/
This folder contains 2 files which are the same as above but deal with characters instead of words. This was not used in my project because of many issues like false detections, and the weirdly cut out images make it hard to decide and hard code fixed padding values, which would not induce uniformity. I ended up using word level outputs for the main `dcda` project because it has lesser false detections after tweaking.

![image](https://github.com/Kishlay-notabot/tesseract-bbox-examples/assets/67735128/1e01396c-f39c-465d-ace1-d4220d577ada)

The image below shows the word level cropped images. They undeniably do have false detections but comparatively lesser than what we face while dealing with symbol level outputs.
