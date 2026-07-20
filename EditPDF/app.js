import { d, } from './global.js';
import {
  winDragoverHandler, winDropHandler,
  concatPages, addInputFileForConcat, clearConcatPages,
} from './handler.js';

window.addEventListener('dragover', winDragoverHandler);
window.addEventListener('drop', winDropHandler);
d.getElementById('buttonConcatPages').addEventListener('click', concatPages);
d.getElementById('buttonAddConcatPages').addEventListener('click', addInputFileForConcat);
d.getElementById('buttonClearConcatPages').addEventListener('click', clearConcatPages);
addInputFileForConcat();
