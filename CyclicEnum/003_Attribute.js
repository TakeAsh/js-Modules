import { CyclicEnum } from '../modules/CyclicEnum.mjs';
import { prepareElement } from '../modules/PrepareElement.mjs';
import { test } from '../modules/UnitTest.mjs';

const d = document;
const elmMain = d.getElementById('Main');
const elmLog = d.getElementById('Log');

const defGetter = () => new CyclicEnum(
  'Open',
  'Dragon:{"Color":"#ff0000", "Hand":true, "Foot":true}',
  'Liger:{"Color":"#00ffff", "Hand":false, "Foot":true}',
  'Poseidon:{"Color":"#ffff00", "Hand":true, "Foot":false}',
  'ability', function() {
    return `${this.Hand ? '&#x1f9be;' : '-'}${this.Foot ? '&#x1f9bf;' : '-'}`;
  },
);
const Getter = defGetter();
Getter.prototypeOfItem.nameAndAbility = function() { return `${this}:${this.ability()}`; };
console.log(Getter);
console.log(Getter.prototypeOfItem);
elmLog.value += [
  '# Getter',
  defGetter.toString().replace('() => ', ''),
  `JSON.stringify() => ${JSON.stringify(Getter, null, 2)}`,
].join('\n') + '\n';

const range = (max) => Array.from({ length: max }, (_, i) => (i));
const items = range(20).map((i) => {
  const getter = Getter[i % Getter.length];
  return prepareElement({
    tag: 'div',
    classes: ['Item'],
    innerHTML: getter.nameAndAbility(),
    dataset: { getter: getter, },
    style: { backgroundColor: getter.Color || '#c0c0c0' },
  });
});
items.forEach(item => elmMain.appendChild(item));

setInterval(() => {
  items.forEach(item => {
    const getter = Getter[item.dataset.getter].next();
    item.innerHTML = getter.nameAndAbility();
    item.dataset.getter = getter;
    item.style.backgroundColor = getter.Color || '#c0c0c0';
  });
}, 1000);

elmLog.value += '\n';
elmLog.value += test([
  { input: () => String(Getter.Open), expected: 'Open' },
  { input: () => isNaN(Number(Getter.Open)), expected: true },
  { input: () => Boolean(Getter.Open), expected: true },
  { input: () => Getter.Open.valueOf(), expected: 'Open' },
  { input: () => Getter.Open == 'Open', expected: true },
  { input: () => Getter.Open.ability(), expected: '--' },
  { input: () => Getter.Open.nameAndAbility(), expected: 'Open:--' },
  { input: () => String(Getter.Dragon), expected: 'Dragon' },
  { input: () => isNaN(Number(Getter.Dragon)), expected: true },
  { input: () => Boolean(Getter.Dragon), expected: true },
  { input: () => Getter.Dragon.valueOf(), expected: 'Dragon' },
  { input: () => Getter.Dragon == 'Dragon', expected: true },
  { input: () => Getter.Dragon.ability(), expected: '&#x1f9be;&#x1f9bf;' },
  { input: () => Getter.Dragon.nameAndAbility(), expected: 'Dragon:&#x1f9be;&#x1f9bf;' },
  { input: () => String(Getter.Liger), expected: 'Liger' },
  { input: () => isNaN(Number(Getter.Liger)), expected: true },
  { input: () => Boolean(Getter.Liger), expected: true },
  { input: () => Getter.Liger.valueOf(), expected: 'Liger' },
  { input: () => Getter.Liger == 'Liger', expected: true },
  { input: () => Getter.Liger.ability(), expected: '-&#x1f9bf;' },
  { input: () => Getter.Liger.nameAndAbility(), expected: 'Liger:-&#x1f9bf;' },
  { input: () => String(Getter.Poseidon), expected: 'Poseidon' },
  { input: () => isNaN(Number(Getter.Poseidon)), expected: true },
  { input: () => Boolean(Getter.Poseidon), expected: true },
  { input: () => Getter.Poseidon.valueOf(), expected: 'Poseidon' },
  { input: () => Getter.Poseidon == 'Poseidon', expected: true },
  { input: () => Getter.Poseidon.ability(), expected: '&#x1f9be;-' },
  { input: () => Getter.Poseidon.nameAndAbility(), expected: 'Poseidon:&#x1f9be;-' },
]);
