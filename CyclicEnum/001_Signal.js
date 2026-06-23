import { CyclicEnum } from '../modules/CyclicEnum.mjs';
import { prepareElement } from '../modules/PrepareElement.mjs';
import { test } from '../modules/UnitTest.mjs';

const d = document;
const elmFixed = d.getElementById('Fixed');
const elmRotation = d.getElementById('Rotation');
const elmLog = d.getElementById('Log');

const defSignal = () => new CyclicEnum(
  'Green', 'Yellow', 'Red',
  'toColor', function() {
    return this == Signal.Green ? '#00ff00' :
      this == Signal.Yellow ? '#ffff00' :
        this == Signal.Red ? '#ff0000' :
          null;
  },
  'toClass', function() { return `Item${this}`; },
);
const Signal = defSignal();
console.log(Signal);
elmLog.value += [
  '# Signal',
  defSignal.toString().replace('() => ', ''),
  `JSON.stringify() => ${JSON.stringify(Signal)}`,
].join('\n') + '\n';

const range = (max) => Array.from({ length: max }, (_, i) => (i));
range(Signal.length).forEach(i => {
  const signal = Signal.get(i);
  elmFixed.appendChild(prepareElement({
    tag: 'div',
    classes: ['Item', signal.toClass()],
    textContent: String(i).padStart(2, '0'),
    dataset: { signal: signal, },
    style: { backgroundColor: signal.toColor() },
  }));
});
const items = range(20).map((i) => {
  const signal = Signal.get(i % (Signal.length + 1));
  return prepareElement({
    tag: 'div',
    classes: ['Item', signal.toClass()],
    textContent: String(i).padStart(2, '0'),
    dataset: { signal: signal, },
    style: { backgroundColor: signal.toColor() },
  });
});
items.forEach(item => elmRotation.appendChild(item));

setInterval(() => {
  items.forEach(item => {
    const signal = Signal.get(item.dataset.signal).next();
    Signal.forEach(s => item.classList.remove(s.toClass()));
    item.classList.add(signal.toClass());
    item.dataset.signal = signal;
    item.style.backgroundColor = signal.toColor();
  });
}, 1000);

elmLog.value += '\n';
elmLog.value += test([
  { input: () => Signal['Green'] === Signal.Green, expected: true },
  { input: () => Signal.get('Green') === Signal.Green, expected: true },
  { input: () => Signal['Yellow'] === Signal.Yellow, expected: true },
  { input: () => Signal.get('Yellow') === Signal.Yellow, expected: true },
  { input: () => Signal['Red'] === Signal.Red, expected: true },
  { input: () => Signal.get('Red') === Signal.Red, expected: true },
  { input: () => Signal['unkown'] === undefined, expected: true },
  { input: () => Signal.unkown === undefined, expected: true },
  { input: () => Signal.get('unkown') === Signal[0], expected: true },
  { input: () => Signal[0] === Signal.Green, expected: true },
  { input: () => Signal[1] === Signal.Yellow, expected: true },
  { input: () => Signal[2] === Signal.Red, expected: true },
  { input: () => Signal[3] === undefined, expected: true },
  { input: () => Signal.get(0) === Signal.Green, expected: true },
  { input: () => Signal.get(1) === Signal.Yellow, expected: true },
  { input: () => Signal.get(2) === Signal.Red, expected: true },
  { input: () => Signal.get(3) === Signal[0], expected: true },
  { input: () => Signal instanceof CyclicEnum, expected: true },
  { input: () => Signal instanceof Array, expected: true },
  { input: () => Signal.map(x => x) instanceof CyclicEnum, expected: false },
  { input: () => Signal.map(x => x) instanceof Array, expected: true },
  { input: () => Signal.isPrototypeOf(Signal.Green), expected: false },
  { input: () => Signal.isChild(Signal.Green), expected: true },
  { input: () => Signal.isChild(null), expected: false },
  { input: () => Signal.isChild(undefined), expected: false },
  { input: () => Signal.isChild(0), expected: false },
  { input: () => Signal.isChild({}), expected: false },
  { input: () => Signal.includes(Signal.Green), expected: true },
]);
elmLog.value += '\n';
elmLog.value += test([
  { input: () => String(Signal.Green), expected: 'Green' },
  { input: () => isNaN(Number(Signal.Green)), expected: true },
  { input: () => Boolean(Signal.Green), expected: true },
  { input: () => Signal.Green.valueOf(), expected: 'Green' },
  { input: () => Signal.Green == 'Green', expected: true },
  { input: () => Signal.Green === 'Green', expected: false },
  { input: () => Signal.Green === Signal.Green, expected: true },
  { input: () => Signal.Green.next() === Signal.Yellow, expected: true },
  { input: () => Signal.Green.prev() === Signal.Red, expected: true },
  { input: () => String(Signal.Yellow), expected: 'Yellow' },
  { input: () => isNaN(Number(Signal.Yellow)), expected: true },
  { input: () => Boolean(Signal.Yellow), expected: true },
  { input: () => Signal.Yellow.valueOf(), expected: 'Yellow' },
  { input: () => Signal.Yellow == 'Yellow', expected: true },
  { input: () => Signal.Yellow === 'Yellow', expected: false },
  { input: () => Signal.Yellow === Signal.Yellow, expected: true },
  { input: () => Signal.Yellow.next() === Signal.Red, expected: true },
  { input: () => Signal.Yellow.prev() === Signal.Green, expected: true },
  { input: () => String(Signal.Red), expected: 'Red' },
  { input: () => isNaN(Number(Signal.Red)), expected: true },
  { input: () => Boolean(Signal.Red), expected: true },
  { input: () => Signal.Red.valueOf(), expected: 'Red' },
  { input: () => Signal.Red == 'Red', expected: true },
  { input: () => Signal.Red === 'Red', expected: false },
  { input: () => Signal.Red === Signal.Red, expected: true },
  { input: () => Signal.Red.next() === Signal.Green, expected: true },
  { input: () => Signal.Red.prev() === Signal.Yellow, expected: true },
]);
