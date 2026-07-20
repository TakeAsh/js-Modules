import { prepareElement } from 'https://www.takeash.net/js/modules/PrepareElement.mjs';
import {
  PDFDocument, degrees,
  pdfs,
  d, divError, divMessage, olConcatFiles, inputNameConcatPdf,
} from './global.js';
import {
  maskPreview, maskPreviewAll, unmaskPreviewValid,
  loadPdf, previewPdf, rotatePage, removePages, getNameBase,
} from './process.js';

export function winDragoverHandler(ev) {
  const fileItems = [...ev.dataTransfer.items]
    .filter((item) => item.kind == 'file');
  if (fileItems.length <= 0) { return; }
  ev.preventDefault();
  maskPreviewAll();
  const labels = Array.from(d.querySelectorAll('label'));
  if (labels.every(label => !label.contains(ev.target))) {
    ev.dataTransfer.dropEffect = 'none';
    unmaskPreviewValid();
  }
}

export function winDropHandler(ev) {
  if ([...ev.dataTransfer.items].every((item) => item.kind != 'file')) {
    return;
  }
  ev.preventDefault();
}

export function dragoverHandler(ev) {
  const fileItems = [...ev.dataTransfer.items]
    .filter((item) => item.kind === "file");
  if (fileItems.length <= 0) { return; }
  ev.preventDefault();
  ev.dataTransfer.dropEffect = fileItems.some((item) => item.type == 'application/pdf')
    ? 'copy'
    : 'none';
}

export async function dropHandler(ev) {
  ev.preventDefault();
  const file = [...ev.dataTransfer.items]
    .map((item) => item.getAsFile())
    .filter((file) => file)?.[0];
  if (!file) { return; }
  const ancestor = ev.currentTarget.parentNode;
  await loadPdf(file, ancestor);
  await previewPdf(file.name, ancestor);
}

export async function pickupFile(ev) {
  const input = ev.currentTarget;
  const file = input.files[0];
  if (!file) { return; }
  const ancestor = input.parentNode.parentNode;
  await loadPdf(file, ancestor);
  await previewPdf(file.name, ancestor);
}

export function addInputFileForConcat() {
  for (let i = 0; i < 5; ++i) {
    olConcatFiles.appendChild(prepareElement({
      tag: 'li',
      children: [
        {
          tag: 'div',
          classes: ['previewHeader'],
          children: [
            {
              tag: 'span',
              children: [
                {
                  tag: 'button',
                  type: 'button',
                  title: 'Divide Each Pages',
                  innerHTML: '&#x1F5D0;',
                  disabled: true,
                  events: { click: dividePages, },
                },
                {
                  tag: 'button',
                  type: 'button',
                  title: 'Rotate Left',
                  innerHTML: '&#x21AA;',
                  disabled: true,
                  events: { click: newRotate(270), },
                },
                {
                  tag: 'button',
                  type: 'button',
                  title: 'Rotate Right',
                  innerHTML: '&#x21A9;',
                  disabled: true,
                  events: { click: newRotate(90), },
                },
                {
                  tag: 'button',
                  type: 'button',
                  title: 'Remove Pages',
                  innerHTML: '&#x2702;',
                  disabled: true,
                  events: { click: setRangeRemove, },
                },
                {
                  tag: 'button',
                  type: 'button',
                  title: 'Drop Document',
                  innerHTML: '&#x1F5D1;',
                  disabled: true,
                  events: { click: clearInputFile, },
                },
              ],
            },
            {
              tag: 'span',
              classes: ['filename'],
            },
          ],
        },
        {
          tag: 'label',
          events: {
            dragover: dragoverHandler,
            drop: dropHandler,
          },
          children: [
            {
              tag: 'input',
              type: 'file',
              accept: 'application/pdf',
              dataset: {
                name: '',
                rangeRemove: '',
                rotation: 0,
              },
              events: { change: pickupFile, },
            },
            {
              tag: 'div',
              classes: ['preview'],
              children: [
                {
                  tag: 'iframe',
                  dataset: {
                    src: '',
                  },
                  events: { drop: preventDefault, },
                },
                {
                  tag: 'div',
                  classes: ['mask',],
                  textContent: 'Drop PDF',
                },
              ],
            },
          ],
        },
      ],
    }));
  }
}

export async function dividePages(ev) {
  const ancestor = ev.currentTarget.parentNode.parentNode.parentNode;
  const input = ancestor.querySelector('input[type="file"]');
  const pdfDoc = await pdfs[input.dataset.name]?.copy();
  if (!pdfDoc) return;
  const pageCount = pdfDoc.getPageCount();
  divMessage.textContent = `Pages: ${pageCount}`;
  divError.textContent = null;
  const nameBase = getNameBase(input.dataset.name);
  const rotation = parseInt(input.dataset.rotation);
  if (rotation != 0) {
    pdfDoc.getPages().forEach(page => rotatePage(page, rotation));
  }
  for (let i = 0; i < pageCount; ++i) {
    const pdfOut = await PDFDocument.create();
    const [pageCopy] = await pdfOut.copyPages(pdfDoc, [i]);
    pdfOut.addPage(pageCopy);
    const bytes = await pdfOut.save();
    download(bytes, `${nameBase}_${i + 1}.pdf`, 'application/pdf');
  }
}

export function newRotate(angle) {
  return async (ev) => {
    const ancestor = ev.currentTarget.parentNode.parentNode.parentNode;
    const input = ancestor.querySelector('input[type="file"]');
    const name = input.dataset.name;
    if (!name) { return; }
    input.dataset.rotation = (parseInt(input.dataset.rotation) + angle) % 360;
    await previewPdf(name, ancestor);
  };
}

export async function setRangeRemove(ev) {
  const ancestor = ev.currentTarget.parentNode.parentNode.parentNode;
  const input = ancestor.querySelector('input[type="file"]');
  const pageCount = pdfs[input.dataset.name]?.getPageCount();
  const rangeRemove = prompt('Range to Remove', input.dataset.rangeRemove || `1-${pageCount}`);
  input.dataset.rangeRemove = !rangeRemove
    ? ''
    : rangeRemove;
  await previewPdf(input.dataset.name, ancestor);
}

export function clearInputFile(ev) {
  const ancestor = ev.currentTarget.parentNode.parentNode.parentNode;
  ancestor.querySelector('span[class~="filename"]').textContent = null;
  const input = ancestor.querySelector('input[type="file"]');
  const name = input.dataset.name;
  const used = Array.from(d.querySelectorAll('input[type="file"]'))
    .filter(i => i != input)
    .some(i => i.dataset.name == name);
  if (!used) {
    delete pdfs[name];
  }
  input.dataset.name = '';
  input.dataset.rangeRemove = '';
  input.dataset.rotation = '0';
  input.value = null;
  const iframe = ancestor.querySelector('iframe');
  URL.revokeObjectURL(iframe.src);
  iframe.src = '';
  iframe.dataset.src = '';
  maskPreview(ancestor.querySelector('div[class~="mask"]'));
  Array.from(ancestor.querySelectorAll('button'))
    .forEach(button => { button.disabled = true; });
}

function preventDefault(ev) {
  ev.preventDefault();
}

export async function concatPages(ev) {
  divMessage.textContent = null;
  divError.textContent = null;
  const pdfOut = await PDFDocument.create();
  const inputs = Array.from(olConcatFiles.querySelectorAll('input[type="file"]'))
    .filter(input => input.dataset.name);
  for (let input of inputs) {
    const pdfDoc = await pdfs[input.dataset.name].copy();
    removePages(pdfDoc, input.dataset.rangeRemove);
    const rotation = parseInt(input.dataset.rotation);
    if (rotation != 0) {
      pdfDoc.getPages().forEach(page => rotatePage(page, rotation));
    }
    const pageCount = pdfDoc.getPageCount();
    for (let i = 0; i < pageCount; ++i) {
      const [pageCopy] = await pdfOut.copyPages(pdfDoc, [i]);
      pdfOut.addPage(pageCopy);
    }
  }
  divMessage.textContent = `Pages: ${pdfOut.getPageCount()}`;
  const bytes = await pdfOut.save();
  const fname = `${inputNameConcatPdf.value}.pdf`;
  download(bytes, fname, 'application/pdf');
}

export function clearConcatPages(ev) {
  olConcatFiles.replaceChildren();
  addInputFileForConcat();
  Object.keys(pdfs).forEach(key => delete pdfs[key]);
}
