const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(2, 9); // truecolor (RGB)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk: scanlines with filter type 0
  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData.writeUInt8(0, rowOffset); // filter 0
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Add a slight gradient or border pattern so each image has identifiable structure
      const isBorder = (x < 10 || x >= width - 10 || y < 10 || y >= height - 10);
      rawData.writeUInt8(isBorder ? 255 : r, pixelOffset);
      rawData.writeUInt8(isBorder ? 255 : g, pixelOffset + 1);
      rawData.writeUInt8(isBorder ? 255 : b, pixelOffset + 2);
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.slice(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

const dir = path.join(__dirname, 'scratch_test_images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 3 distinct images for Product A: Blue, Emerald Green, Royal Purple
fs.writeFileSync(path.join(dir, 'prodA_primary_blue.png'), createPng(200, 200, 30, 144, 255));
fs.writeFileSync(path.join(dir, 'prodA_gallery2_green.png'), createPng(200, 200, 46, 204, 113));
fs.writeFileSync(path.join(dir, 'prodA_gallery3_purple.png'), createPng(200, 200, 155, 89, 182));

// 2 distinct images for Product B: Crimson Red, Golden Yellow
fs.writeFileSync(path.join(dir, 'prodB_primary_red.png'), createPng(200, 200, 231, 76, 60));
fs.writeFileSync(path.join(dir, 'prodB_gallery2_gold.png'), createPng(200, 200, 241, 196, 15));

console.log('Test images created successfully in:', dir);
