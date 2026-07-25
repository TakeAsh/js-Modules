import { sleep } from 'https://www.takeash.net/js/modules/Util.mjs';
import {
  PDFDocument, degrees, PDFRawStream, PDFName,
  pdfs,
  d, inputNameConcatPdf,
} from './global.js';
import { savePng } from './savePng.js';
import { saveTiff } from './saveTiff.js';

export function maskPreview(div) {
  div.classList.remove('mask_off');
}

export function unmaskPreview(div) {
  div.classList.add('mask_off');
}

export function maskPreviewAll() {
  Array.from(d.querySelectorAll('div[class~="mask"]'))
    .forEach(div => maskPreview(div));
}

export function unmaskPreviewValid() {
  Array.from(d.querySelectorAll('div[class~="mask"]'))
    .filter(div => div.parentNode.querySelector('iframe').dataset.src)
    .forEach(div => unmaskPreview(div));
}

export async function loadPdf(file, ancestor) {
  if (!file || !ancestor) { return; }
  const input = ancestor.querySelector('input[type="file"]');
  input.dataset.name = file.name;
  input.dataset.rangeRemove = '';
  input.dataset.rotation = '0';
  ancestor.querySelector('span[class~="filename"]').textContent = file.name;
  inputNameConcatPdf.value = getNameBase(file.name);
  if (pdfs[file.name]) { return; }
  try {
    pdfs[file.name] = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, });
  } catch (err) {
    console.error(err);
  }
}

export async function previewPdf(name, ancestor) {
  const pdfDoc = await pdfs[name]?.copy();
  const input = ancestor.querySelector('input[type="file"]');
  const iframe = ancestor.querySelector('iframe');
  if (!pdfDoc) {
    URL.revokeObjectURL(iframe.src);
    iframe.src = '';
    iframe.dataset.src = '';
    input.dataset.rangeRemove = '';
    input.dataset.rotation = '0';
    Array.from(ancestor.querySelectorAll('button'))
      .forEach(button => { button.disabled = true; });
    return;
  }
  removePages(pdfDoc, input.dataset.rangeRemove);
  const rotation = parseInt(input.dataset.rotation);
  if (rotation != 0) {
    pdfDoc.getPages().forEach(page => rotatePage(page, rotation));
  }
  if (iframe.dataset.src) {
    URL.revokeObjectURL(iframe.src);
  }
  iframe.src = await pdfDoc.saveAsBase64({ dataUri: true });
  iframe.dataset.src = '1';
  Array.from(ancestor.querySelectorAll('button'))
    .forEach(button => { button.disabled = false; });
  unmaskPreviewValid();
}

export function removePages(pdfDoc, rangeRemove) {
  const count = pdfDoc.getPageCount();
  const range = flattenRage(rangeRemove);
  if (range || range.length > 0) {
    range.reverse()
      .filter(i => 0 < i && i <= count)
      .forEach(i => pdfDoc.removePage(i - 1));
  }
}

export function flattenRage(text) {
  const result = [];
  let match = [];
  text.trim().split(/\s*,\s*/).forEach(part => {
    if (match = part.match(/^(\d+)$/)) {
      result[parseInt(match[1])] = true;
    } else if ((match = part.match(/^(\d+)-(\d+)$/)) && match[1] <= match[2]) {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      for (let i = start; i <= end; ++i) {
        result[i] = true;
      }
    }
  });
  return result.reduce(
    (acc, cur, index) => {
      if (cur) {
        acc.push(index);
      }
      return acc;
    },
    []
  );
}

export function rotatePage(page, rotation) {
  if (!rotation) { return; }
  page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
}

export function getNameBase(filename) {
  return filename.replace(/\.[^\.]+$/, '');
}

const cacheColorSpace = new Map();

function getColorSpace(dict) {
  let colorSpace = dict.get(PDFName.of("ColorSpace"));
  if (!colorSpace) {
    return null;
  }
  if (!colorSpace.tag?.match(/^\d+\s\d+\sR$/)) {
    // Actual ColorSpace
    return colorSpace;
  }
  if (cacheColorSpace.has(colorSpace)) {
    // Cached ColorSpace
    return cacheColorSpace.get(colorSpace);
  }
  // Get ColorSpace, and cache it
  const xObj = dict.context.indirectObjects;
  const tmpColorSpace = xObj.get(colorSpace);
  if (tmpColorSpace) {
    tmpColorSpace.isIndexed = tmpColorSpace.array?.[0] === PDFName.of("Indexed");
    if (tmpColorSpace.isIndexed) {
      const tableRaw = xObj.get(tmpColorSpace.array?.[3])?.contents;
      tmpColorSpace.tableIndexed = [];
      for (let i = 0; i < tableRaw.length; i += 3) {
        tmpColorSpace.tableIndexed.push([tableRaw[i], tableRaw[i + 1], tableRaw[i + 2]]);
      }
    }
    cacheColorSpace.set(colorSpace, tmpColorSpace);
  }
  return tmpColorSpace;
};

/**
 * Extract Images
 * 
 * @see https://github.com/Hopding/pdf-lib/issues/83#issuecomment-2078087105
 * @export
 * @param {string} name PDF filename
 */
export async function extractImages(name) {
  const pdfDoc = pdfs[name];
  const imagesInDoc = [];
  cacheColorSpace.clear();
  pdfDoc.context.enumerateIndirectObjects()
    .forEach(async ([pdfRef, pdfObject], ref) => {
      const { dict } = pdfObject;
      const subtype = dict?.get(PDFName.of("Subtype"));
      if (!(pdfObject instanceof PDFRawStream) || subtype != PDFName.of("Image")) {
        return;
      }
      const smaskRef = dict.get(PDFName.of("SMask"));
      const colorSpace = getColorSpace(dict);
      const name = dict.get(PDFName.of("Name"));
      const width = dict.get(PDFName.of("Width"));
      const height = dict.get(PDFName.of("Height"));
      const bitsPerComponent = dict.get(PDFName.of("BitsPerComponent"));
      const filter = dict.get(PDFName.of("Filter"));
      const fileType = filter === PDFName.of("DCTDecode") ? "jpg" :
        filter === PDFName.of("FlateDecode") ? "png" :
          filter === PDFName.of("CCITTFaxDecode") ? "tiff" :
            "xxx";

      imagesInDoc.push({
        pdfRef, // added, must use pdfRef to locate alpha layers
        ref,
        smaskRef,
        colorSpace,
        name: name ? name.key : `Object${ref}`,
        width: width.numberValue,
        height: height.numberValue,
        bitsPerComponent: bitsPerComponent.numberValue,
        filter: filter,
        type: fileType,
        data: pdfObject.contents,
      });
    });

  // Log info about the images we found in the PDF
  console.log(`===== ${imagesInDoc.length} Images found in PDF =====`);
  imagesInDoc.forEach((image) => {
    // Find and mark SMasks as alpha layers
    if (image.type === "png" && image.smaskRef) {
      // ref cannot match to smaskRef, must use pdfRef
      const smaskImg = imagesInDoc.find((sm) => image.smaskRef == sm.pdfRef);
      if (smaskImg) {
        smaskImg.isAlphaLayer = true;
        image.alphaLayer = smaskImg;
      }
    }
  });

  let index = 0;
  for (let image of imagesInDoc) {
    if (image.isAlphaLayer) {
      continue;
    }
    await sleep(200);
    ++index;
    console.log(image);
    const nameBase = getNameBase(name);
    const imageData = image.type === "png" ? await savePng(image) :
      image.type === "tiff" ? saveTiff(image) :
        image.data;
    download(imageData, `${nameBase}_${index}.${image.type}`, 'application/octet-stream');
  };

  console.log("done");
}
