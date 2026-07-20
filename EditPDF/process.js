import {
  PDFDocument, degrees,
  pdfs,
  d, inputNameConcatPdf,
} from './global.js';

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
