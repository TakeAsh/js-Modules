import { CyclicEnum } from '../modules/CyclicEnum.mjs';
import { prepareElement } from '../modules/PrepareElement.mjs';

const d = document;
const elmMain = d.getElementById('Main');
const elmLog = d.getElementById('Log');

const Getter = new CyclicEnum(
  'Open',
  'Dragon:{"Color":"#ff0000"}',
  'Liger:{"Color":"#00ffff"}',
  'Poseidon:{"Color":"#ffff00"}',
);
console.log(Getter);
elmLog.value += '# Getter\n'
elmLog.value += [
  'new CyclicEnum(',
  '  Open',
  '  Dragon:{"Color":"#ff0000"}',
  '  Liger:{"Color":"#00ffff"}',
  '  Poseidon:{"Color":"#ffff00"}',
  ')\n',
].join('\n');
elmLog.value += `JSON.stringify() => ${JSON.stringify(Getter, null, 2)}\n`;

const range = (max) => Array.from({ length: max }, (_, i) => (i));
const items = range(20).map((i) => {
  const getter = Getter[i % Getter.length];
  return prepareElement({
    tag: 'div',
    classes: ['Item'],
    textContent: getter,
    dataset: { getter: getter, },
    style: { backgroundColor: getter.Color || '#c0c0c0' },
  });
});
items.forEach(item => elmMain.appendChild(item));

setInterval(() => {
  items.forEach(item => {
    const getter = Getter[item.dataset.getter].next();
    item.textContent = getter;
    item.dataset.getter = getter;
    item.style.backgroundColor = getter.Color || '#c0c0c0';
  });
}, 1000);
