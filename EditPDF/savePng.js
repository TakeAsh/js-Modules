import { PDFName, } from './global.js';
const { PNG } = png;

const PngColorTypes = {
  Grayscale: 0,
  Rgb: 2,
  GrayscaleAlpha: 4,
  RgbAlpha: 6,
};

const ComponentsPerPixelOfColorType = {
  [PngColorTypes.Rgb]: 3,
  [PngColorTypes.Grayscale]: 1,
  [PngColorTypes.RgbAlpha]: 4,
  [PngColorTypes.GrayscaleAlpha]: 2,
};

export function savePng(image) {
  return new Promise((resolve, reject) => {
    const colorSpace = image.colorSpace;
    const isGrayscale = colorSpace === PDFName.of("DeviceGray");
    const colorPixels = pako.inflate(image.data);
    const alphaPixels = image.alphaLayer
      ? pako.inflate(image.alphaLayer.data)
      : undefined;

    // prettier-ignore
    const colorType =
      isGrayscale && alphaPixels ? PngColorTypes.GrayscaleAlpha
        : !isGrayscale && alphaPixels ? PngColorTypes.RgbAlpha
          : isGrayscale ? PngColorTypes.Grayscale
            : PngColorTypes.Rgb;

    const colorByteSize = 1;
    const width = image.width * colorByteSize;
    const height = image.height * colorByteSize;
    const inputHasAlpha = [
      PngColorTypes.RgbAlpha,
      PngColorTypes.GrayscaleAlpha,
    ].includes(colorType);

    const png = new PNG({
      width,
      height,
      colorType,
      inputColorType: colorType,
      inputHasAlpha,
    });

    const componentsPerPixel = ComponentsPerPixelOfColorType[colorType];
    png.data = new Uint8Array(width * height * componentsPerPixel);

    let colorPixelIdx = 0;
    let alphaPixelIdx = 0; // add nee index tracker for the alpha later
    let pixelIdx = 0;
    // prettier-ignore
    switch (colorType) {
      case PngColorTypes.Rgb:
        if (!colorSpace.isIndexed) {
          while (pixelIdx < png.data.length) {
            png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
            png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
            png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
          }
        } else {
          while (pixelIdx < png.data.length) {
            const color = colorSpace.tableIndexed[colorPixels[colorPixelIdx++]];
            png.data[pixelIdx++] = color[0];
            png.data[pixelIdx++] = color[1];
            png.data[pixelIdx++] = color[2];
          }
        }
        break;
      case PngColorTypes.RgbAlpha:
        if (!colorSpace.isIndexed) {
          while (pixelIdx < png.data.length) {
            png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
            png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
            png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
            png.data[pixelIdx++] = alphaPixels[alphaPixelIdx++];
          }
        } else {
          while (pixelIdx < png.data.length) {
            const color = colorSpace.tableIndexed[colorPixels[colorPixelIdx++]];
            png.data[pixelIdx++] = color[0];
            png.data[pixelIdx++] = color[1];
            png.data[pixelIdx++] = color[2];
            png.data[pixelIdx++] = alphaPixels[alphaPixelIdx++];
          }
        }
        break;
      case PngColorTypes.Grayscale:
        while (pixelIdx < png.data.length) {
          png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        }
        break;
      case PngColorTypes.GrayscaleAlpha:
        while (pixelIdx < png.data.length) {
          png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
          png.data[pixelIdx++] = alphaPixels[alphaPixelIdx++];
        }
        break;
      default:
        throw new Error(`Unknown colorType=${colorType}`);
        break;
    }

    const buffer = [];
    png.pack()
      .on("data", (data) => buffer.push(...data))
      .on("end", () => resolve(new Uint8Array(buffer)))
      .on("error", (err) => reject(err));
  });
}
