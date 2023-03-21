import { AutoSaveConfig } from '../modules/AutoSaveConfig.mjs';

const d = document;
const config = new AutoSaveConfig(
  { ColorMode: 'System', },
  'Clock'
);
const clock = d.getElementById('clock');
let prevSecond = null;
setInterval(showTime, 100);
const selectColorMode = d.getElementById('selectColorMode');
const colorModes = Array.from(selectColorMode.options)
  .map(option => option.value);
selectColorMode.addEventListener(
  'change',
  (event) => { setColorMode(selectColorMode.value); }
);
setColorMode(config.ColorMode);

function showTime(event) {
  const now = new Date();
  const [hour, minute, second] = [
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  ];
  if (prevSecond == second) { return; }
  prevSecond = second;
  const [txtHour, txtMinute, txtSecond] = [
    String(hour).padStart(2, '0'),
    String(minute).padStart(2, '0'),
    String(second).padStart(2, '0'),
  ];
  clock.textContent = `${txtHour}:${txtMinute}:${txtSecond}`;
}

function setColorMode(color) {
  color = color || 'System';
  config.ColorMode = selectColorMode.value = color;
  colorModes.forEach(color2 => { d.body.classList.remove(`${color2}Mode`); });
  if (color == 'System') {
    // use System Light/Dark mode
  } else {
    d.body.classList.add(`${color}Mode`);
  }
}