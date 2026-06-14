import { CyclicEnum } from '../modules/CyclicEnum.mjs';
import { prepareElement } from '../modules/PrepareElement.mjs';

const d = document;
const elmLog = d.getElementById('Log');

const Signal = new CyclicEnum('Green', 'Yellow', 'Red');
const toColor = (s) => s == Signal.Green ? '#00ff00' :
  s == Signal.Yellow ? '#ffff00' :
    s == Signal.Red ? '#ff0000' :
      null;
elmLog.value += '# Signal\n'
elmLog.value += 'new CyclicEnum(\'Green\', \'Yellow\', \'Red\')\n';
elmLog.value += `JSON.stringify() => ${JSON.stringify(Signal)}\n`;

const divMain = d.getElementById('Main');

const range = (max) => Array.from({ length: max }, (_, i) => (i));
const items = range(20).map((i) => prepareElement({
  tag: 'div',
  classes: ['Item'],
  textContent: String(i).padStart(2, '0'),
  dataset: { signal: Signal[i % Signal.length], },
  style: { backgroundColor: toColor(Signal[i % Signal.length]) },
}));
items.forEach(item => divMain.appendChild(item));

setInterval(() => {
  items.forEach(item => {
    const signal = Signal[item.dataset.signal].next();
    item.style.backgroundColor = toColor(item.dataset.signal = signal);
  });
}, 1000);
