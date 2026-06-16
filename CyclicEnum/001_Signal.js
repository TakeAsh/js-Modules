import { CyclicEnum } from '../modules/CyclicEnum.mjs';
import { prepareElement } from '../modules/PrepareElement.mjs';
import { test } from '../modules/UnitTest.mjs';

const d = document;
const elmMain = d.getElementById('Main');
const elmLog = d.getElementById('Log');

const defSignal = () => new CyclicEnum('Green', 'Yellow', 'Red');
const Signal = defSignal();
const toColor = (s) => s == Signal.Green ? '#00ff00' :
  s == Signal.Yellow ? '#ffff00' :
    s == Signal.Red ? '#ff0000' :
      null;
elmLog.value += [
  '# Signal',
  defSignal.toString().replace('() => ', ''),
  `JSON.stringify() => ${JSON.stringify(Signal)}`,
].join('\n') + '\n';

const range = (max) => Array.from({ length: max }, (_, i) => (i));
const items = range(20).map((i) => prepareElement({
  tag: 'div',
  classes: ['Item'],
  textContent: String(i).padStart(2, '0'),
  dataset: { signal: Signal[i % Signal.length], },
  style: { backgroundColor: toColor(Signal[i % Signal.length]) },
}));
items.forEach(item => elmMain.appendChild(item));

setInterval(() => {
  items.forEach(item => {
    const signal = Signal[item.dataset.signal].next();
    item.style.backgroundColor = toColor(item.dataset.signal = signal);
  });
}, 1000);

elmLog.value += '\n';
elmLog.value += test([
  { input: () => String(Signal.Green), expected: 'Green' },
  { input: () => isNaN(Number(Signal.Green)), expected: true },
  { input: () => Boolean(Signal.Green), expected: true },
  { input: () => Signal.Green.valueOf(), expected: 'Green' },
  { input: () => Signal.Green == 'Green', expected: true },
  { input: () => String(Signal.Yellow), expected: 'Yellow' },
  { input: () => isNaN(Number(Signal.Yellow)), expected: true },
  { input: () => Boolean(Signal.Yellow), expected: true },
  { input: () => Signal.Yellow.valueOf(), expected: 'Yellow' },
  { input: () => Signal.Yellow == 'Yellow', expected: true },
  { input: () => String(Signal.Red), expected: 'Red' },
  { input: () => isNaN(Number(Signal.Red)), expected: true },
  { input: () => Boolean(Signal.Red), expected: true },
  { input: () => Signal.Red.valueOf(), expected: 'Red' },
  { input: () => Signal.Red == 'Red', expected: true },
]);
