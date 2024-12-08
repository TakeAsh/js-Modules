import { AutoSaveConfig } from '../modules/AutoSaveConfig.mjs';
import { ClockColor, ClockColors } from './modules/ClockColor.mjs';

const d = document;
const systemColor = 'System;#ffffff;#000000';
const config = new AutoSaveConfig(
  {
    ClockColors: new ClockColors(
      systemColor,
      'Light;#000000;#d0d0f0', 'Dark;#e4e4e4;#2f2f0f',
      'Blue;#e4e4e4;#2020ff', 'Green;#00e000;#2f2f0f',
      'Amber;#ffbf00;#2f2f0f',
    ),
    ClockColor: systemColor,
  },
  'Clock'
);
const clock = d.getElementById('clock');
const selectColor = d.getElementById('selectColor');
const inputName = d.getElementById('inputName');
const inputText = d.getElementById('inputText');
const inputBackground = d.getElementById('inputBackground');
d.getElementById('buttonAddColor').addEventListener('click', addColor);
d.getElementById('buttonRemoveColor').addEventListener('click', removeColor);
let prevSecond = null;
setInterval(showTime, 100);
config.ClockColors.toOptions()
  .forEach(option => selectColor.appendChild(option));
selectColor.addEventListener(
  'change',
  (event) => { setColor(selectColor.value); }
);
setColor(config.ClockColor);

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

function setColor(color) {
  color = color || systemColor;
  const clockColor = new ClockColor(config.ClockColor = selectColor.value = color);
  d.body.style.color = null;
  d.body.style.backgroundColor = null;
  if (clockColor.name == 'System') {
    // use System Light/Dark mode
  } else {
    d.body.style.color = clockColor.textColor;
    d.body.style.backgroundColor = clockColor.backgroundColor;
  }
  inputName.value = clockColor.name;
  inputText.value = clockColor.textColor;
  inputBackground.value = clockColor.backgroundColor;
}

function addColor(ev) {
  const color = new ClockColor(inputName.value, inputText.value, inputBackground.value);
  removeOption(color);
  selectColor.appendChild(color.toOption());
  config.ClockColors.push(color);
  config.ClockColor = selectColor.value = color.toJSON();
  setColor(color.toJSON());
}

function removeColor(ev) {
  const color = new ClockColor(inputName.value, inputText.value, inputBackground.value);
  removeOption(color);
  config.ClockColors.remove(color);
  setColor(systemColor);
}

function removeOption(color) {
  const option = selectColor.querySelector(`option[value^="${color.name};"]`);
  if (option) {
    selectColor.removeChild(option);
  }
}