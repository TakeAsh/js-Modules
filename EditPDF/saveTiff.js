// [(C#) PDFを読み込んで、埋め込まれたTiff画像/PNG画像を書き出す（受信したFAXがPDFとして保存されている想定 #CCITTFaxDecode） #TIFF - Qiita](https://qiita.com/santarou6/items/5ce4fcc5d1edd47adc89)
// [プログラマなら知っておきたい画像ファイルの知識 #画像 - Qiita](https://qiita.com/ymiya14/items/17159773cf3bb54d2179#tiff%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB)

import { CyclicEnum } from 'https://www.takeash.net/js/modules/CyclicEnum.mjs';
import { ByteBuffer } from './ByteBuffer.js';

const Tag = new CyclicEnum({
  ImageWidth: 256,
  ImageLength: 257,
  BitsPerSample: 258,
  Compression: 259,
  PhotometricInterpretation: 262,
  FillOrder: 266,
  StripOffsets: 273,
  Orientation: 274,
  SamplesPerPixel: 277,
  RowsPerStrip: 278,
  StripByteCounts: 279,
  XResolution: 282,
  YResolution: 283,
  PlanarConfiguration: 284,
  ResolutionUnit: 296,
});
const DataType = new CyclicEnum({
  Byte: 1,
  Ascii: 2,
  Short: 3,
  Long: 4,
  Rational: 5,
  SByte: 6,
  Undefined: 7,
  SShort: 8,
  SLong: 9,
  SRational: 10,
  Float: 11,
  Double: 12,
});

class TiffBuffer extends ByteBuffer {
  addIFDEntry(tag, datatype, count, value) {
    return this.addWord(tag)
      .addWord(datatype)
      .addDWord(count)
      .addDWord(value);
  }

  addIFD(entries, nextIFDOffset) {
    this.addWord(entries.length);
    entries.forEach(entry => {
      this.addIFDEntry(entry[0], entry[1], entry[2], entry[3]);
    });
    return this.addDWord(nextIFDOffset);
  }
}

export function saveTiff(image) {
  const buffer = new TiffBuffer();
  const ifdOffset = 4 + 4; // IFD (Image File Directory) Offset
  const entryConut = 15;
  const ifdEndOffset = ifdOffset + 2 + 12 * entryConut + 4;
  return buffer.push(0x49, 0x49, 0x2A, 0x00)  // Tiff Header
    .addDWord(ifdOffset)
    .addIFD([
      [Tag.ImageWidth, DataType.Short, 1, image.width],
      [Tag.ImageLength, DataType.Short, 1, image.height],
      [Tag.BitsPerSample, DataType.Short, 1, 1],
      [Tag.Compression, DataType.Short, 1, 4],
      [Tag.PhotometricInterpretation, DataType.Short, 1, 0],
      [Tag.FillOrder, DataType.Short, 1, 1],
      [Tag.Orientation, DataType.Short, 1, 1],
      [Tag.SamplesPerPixel, DataType.Short, 1, 1],
      [Tag.RowsPerStrip, DataType.Short, 1, image.height],
      [Tag.PlanarConfiguration, DataType.Short, 1, 1],
      [Tag.ResolutionUnit, DataType.Short, 1, 2],
      [Tag.XResolution, DataType.Rational, 1, ifdEndOffset],
      [Tag.YResolution, DataType.Rational, 1, ifdEndOffset + 4 * 2],
      [Tag.StripOffsets, DataType.Long, 1, ifdEndOffset + 4 * 4],
      [Tag.StripByteCounts, DataType.Long, 1, image.data.length],
    ], 0)
    .addDWord(192)  // XResolution, numerator
    .addDWord(1)    // XResolution, denominator
    .addDWord(192)  // YResolution, numerator
    .addDWord(1)    // YResolution, denominator
    .push(...image.data)  // Image Body
    .save();
}
