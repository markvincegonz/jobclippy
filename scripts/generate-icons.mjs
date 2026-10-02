import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw uncompressed scanlines: (1 byte filter 0 + width * 4 bytes RGBA) * height
  const rawScanlines = Buffer.alloc((1 + width * 4) * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawScanlines[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawScanlines[pixelOffset] = r;
      rawScanlines[pixelOffset + 1] = g;
      rawScanlines[pixelOffset + 2] = b;
      rawScanlines[pixelOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawScanlines);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Icon drawer: Stylized Linear-dark paperclip on rounded violet badge
function drawIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.44;

  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background rounded squircle / circle
  if (dist <= r) {
    // Gradient from #5E6AD2 to #4F52B2 (Linear accent violet)
    const factor = (y / h);
    const bgR = Math.round(94 * (1 - factor * 0.3));
    const bgG = Math.round(106 * (1 - factor * 0.3));
    const bgB = Math.round(210 * (1 - factor * 0.2));

    // Simple paperclip path overlay:
    // Centered vertical loop shape
    const clipX = dx / (w * 0.35);
    const clipY = dy / (h * 0.35);

    // Approximate paperclip wire by distance to oval tracks
    const inOuterTrack = Math.abs(clipX) < 0.5 && clipY > -0.6 && clipY < 0.6;
    const isTopCurve = Math.abs(Math.sqrt(clipX * clipX * 1.5 + Math.pow(clipY + 0.4, 2)) - 0.4) < 0.15;
    const isBottomCurve = Math.abs(Math.sqrt(clipX * clipX * 1.5 + Math.pow(clipY - 0.4, 2)) - 0.3) < 0.15;
    const isWire = isTopCurve || isBottomCurve || (Math.abs(Math.abs(clipX) - 0.35) < 0.12 && clipY > -0.4 && clipY < 0.4);

    if (isWire) {
      return [255, 255, 255, 255]; // Crisp white wire
    }

    return [bgR, bgG, bgB, 255];
  }

  // Anti-aliased outer edge
  if (dist < r + 1) {
    const alpha = Math.max(0, Math.min(255, Math.round((r + 1 - dist) * 255)));
    return [94, 106, 210, alpha];
  }

  return [0, 0, 0, 0];
}

const outDir = path.resolve('extension/icons');
fs.mkdirSync(outDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const png = createPng(size, size, drawIcon);
  const outPath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Generated ${outPath} (${png.length} bytes)`);
}
