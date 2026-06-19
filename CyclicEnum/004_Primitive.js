import { CyclicEnum } from '../modules/CyclicEnum.mjs';
import { test } from '../modules/UnitTest.mjs';

const d = document;
const elmLog = d.getElementById('Log');

elmLog.value += '# Primitive\n\n';

const defMyMath = () => new CyclicEnum({ Zero: 0, Two: 2, Pi: 3.141592, });
const MyMath = defMyMath();
elmLog.value += showDefinition('MyMath', defMyMath);
elmLog.value += '\n';
elmLog.value += test([
  { input: () => String(MyMath.Zero), expected: 'Zero' },
  { input: () => Number(MyMath.Zero), expected: 0 },
  { input: () => MyMath.Zero == 0, expected: true },
  { input: () => MyMath.Zero != 0, expected: false },
  { input: () => MyMath.Zero + 0, expected: 0 },
  { input: () => MyMath.Zero + 1, expected: 1 },
  { input: () => MyMath.Zero + 2, expected: 2 },
  { input: () => MyMath.Zero * 0, expected: 0 },
  { input: () => MyMath.Zero * 1, expected: 0 },
  { input: () => MyMath.Zero * 2, expected: 0 },
  { input: () => MyMath.Zero == 'Zero', expected: false },
  { input: () => String(MyMath.Zero) == 'Zero', expected: true },
  { input: () => MyMath.Zero == MyMath.Zero, expected: true },
  { input: () => String(MyMath.Two), expected: 'Two' },
  { input: () => Number(MyMath.Two), expected: 2 },
  { input: () => MyMath.Two == 0, expected: false },
  { input: () => MyMath.Two != 0, expected: true },
  { input: () => MyMath.Two == 2, expected: true },
  { input: () => MyMath.Two != 2, expected: false },
  { input: () => MyMath.Two + 0, expected: 2 },
  { input: () => MyMath.Two + 1, expected: 3 },
  { input: () => MyMath.Two + 2, expected: 4 },
  { input: () => MyMath.Two * 0, expected: 0 },
  { input: () => MyMath.Two * 1, expected: 2 },
  { input: () => MyMath.Two * 2, expected: 4 },
  { input: () => String(MyMath.Pi), expected: 'Pi' },
  { input: () => Number(MyMath.Pi), expected: 3.141592 },
  { input: () => MyMath.Pi == 0, expected: false },
  { input: () => MyMath.Pi != 0, expected: true },
  { input: () => MyMath.Pi == 3.141592, expected: true },
  { input: () => MyMath.Pi != 3.141592, expected: false },
  { input: () => MyMath.Pi + 0, expected: 3.141592 },
  { input: () => MyMath.Pi + 1, expected: 4.141592 },
  { input: () => MyMath.Pi + 2, expected: 5.141592 },
  { input: () => MyMath.Pi * 0, expected: 0 },
  { input: () => MyMath.Pi * 1, expected: 3.141592 },
  { input: () => MyMath.Pi * 2, expected: 3.141592 * 2 },
]);

elmLog.value += '\n';
const defStatus = () => new CyclicEnum({
  Undef: null, Off: false, On: true,
  bool: function() { return Boolean(this.valueOf()); },
});
const Status = defStatus();
elmLog.value += showDefinition(
  'Status (Boolean() does not work as expected. Use +(unary plus operator) instead.)',
  defStatus
);
elmLog.value += '\n';
elmLog.value += test([
  { input: () => String(Status.Undef), expected: 'Undef' },
  { input: () => Number(Status.Undef), expected: 0 },
  { input: () => Boolean(Status.Undef), expected: false },
  { input: () => !Status.Undef, expected: true },
  { input: () => !!Status.Undef, expected: false },
  { input: () => Status.Undef.valueOf(), expected: null },
  { input: () => Boolean(Status.Undef.valueOf()), expected: false },
  { input: () => +Status.Undef, expected: 0 },
  { input: () => Boolean(+Status.Undef), expected: false },
  { input: () => Status.Undef.bool(), expected: false },
  { input: () => String(Status.Off), expected: 'Off' },
  { input: () => Number(Status.Off), expected: 0 },
  { input: () => Boolean(Status.Off), expected: false },
  { input: () => !Status.Off, expected: true },
  { input: () => !!Status.Off, expected: false },
  { input: () => Status.Off.valueOf(), expected: false },
  { input: () => +Status.Off, expected: 0 },
  { input: () => Boolean(+Status.Off), expected: false },
  { input: () => Status.Off.bool(), expected: false },
  { input: () => String(Status.On), expected: 'On' },
  { input: () => Number(Status.On), expected: 1 },
  { input: () => Boolean(Status.On), expected: true },
  { input: () => !Status.On, expected: false },
  { input: () => !!Status.On, expected: true },
  { input: () => Status.On.valueOf(), expected: true },
  { input: () => +Status.On, expected: 1 },
  { input: () => Boolean(+Status.On), expected: true },
  { input: () => Status.On.bool(), expected: true },
  { input: () => Status.Undef == Status.Undef, expected: true },
  { input: () => Status.Undef == Status.Off, expected: false },
  { input: () => Status.Undef == Status.On, expected: false },
  { input: () => Status.Off == Status.Off, expected: true },
  { input: () => Status.Off == Status.On, expected: false },
  { input: () => Status.On == Status.On, expected: true },
  { input: () => Status.Undef == false, expected: true },
  { input: () => Status.Undef != false, expected: false },
  { input: () => Status.Undef == true, expected: false },
  { input: () => Status.Undef != true, expected: true },
  { input: () => Status.Off == false, expected: true },
  { input: () => Status.Off != false, expected: false },
  { input: () => Status.Off == true, expected: false },
  { input: () => Status.Off != true, expected: true },
  { input: () => Status.On == false, expected: false },
  { input: () => Status.On != false, expected: true },
  { input: () => Status.On == true, expected: true },
  { input: () => Status.On != true, expected: false },
]);

function showDefinition(label, def) {
  const obj = def();
  console.log(obj);
  return [
    `## ${label}`,
    def.toString().replace('() => ', ''),
    `JSON.stringify() => ${JSON.stringify(obj)}`,
  ].join('\n') + '\n';
}
