const Tesseract = require("tesseract.js");
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {parseReceipt} = require('./parseReceipt');

async function readReceipt(imagePath) {
  const { data } = await Tesseract.recognize(imagePath, "eng");
  return data.text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

const receipts = path.join(__dirname, 'sampleReceipts'); 

const images = fs.readdirSync(receipts); //0 indexed
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question(`pick receipt (0-${images.length-1}): `, async (i) => {
    rl.close();
    const receipt = path.join(receipts, images[i]);
    
    const lines = await readReceipt(receipt);
    const result = parseReceipt(lines);

    console.log(result);
});