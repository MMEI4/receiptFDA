const Tesseract = require("tesseract.js");
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
rl.question(`pick receipt (${images.length}): `, (i) => {
  const receipt = path.join(receipts, images[i]);
  rl.close();
  readReceipt(receipt).then(console.log);
});



