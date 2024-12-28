import ICAL from 'https://unpkg.com/ical.js/dist/ical.min.js';
import { prepareElement } from '../modules/PrepareElement.mjs';
import { AutoSaveConfig } from '../modules/AutoSaveConfig.mjs';
import { copyToClipboard, writeToClipboard } from '../modules/Clipboard.mjs';

const uriJpnHolidays = 'https://www.takeash.net/cgi-bin/etc/JpnHolidays.cgi';
const dayOfWeeks = ['日', '月', '火', '水', '木', '金', '土'];
const settings = new AutoSaveConfig({
  ShowTraditional: true,
}, 'JpnHolidays');
const d = document;
const tbody = d.querySelector('tbody');
let year = (new Date()).getFullYear();
const headers = ['#', '日付', '曜日', '名前', '種類'];
const filteredData = [];
const response = await fetch(uriJpnHolidays, { method: 'GET', mode: 'cors', });
const icalRaw = await response.text();
const events = new ICAL.Component(ICAL.parse(icalRaw))
  .getAllSubcomponents('vevent')
  .map(vevent => new ICAL.Event(vevent))
  .sort((a, b) => a.startDate.compare(b.startDate));
init();
showCalendar();

function init() {
  const checkShowTraditional = d.querySelector('#checkShowTraditional');
  checkShowTraditional.checked = settings.ShowTraditional;
  checkShowTraditional.addEventListener('change', () => {
    settings.ShowTraditional = checkShowTraditional.checked;
    showCalendar();
  });
  const spanYear = d.querySelector('#spanYear');
  spanYear.textContent = year;
  d.querySelector('#buttonPrevYear').addEventListener('click', () => {
    spanYear.textContent = (year -= 1);
    showCalendar();
  });
  d.querySelector('#buttonNextYear').addEventListener('click', () => {
    spanYear.textContent = (year += 1);
    showCalendar();
  });
  d.querySelector('#buttonCopy').addEventListener('click', () => {
    console.log(filteredData);
    const text = filteredData.map(row => row.join('\t')).join('\n');
    writeToClipboard(text) || copyToClipboard(text);
  });
}

function showCalendar() {
  tbody.innerHTML = null;
  filteredData.length = 0;
  filteredData.push(headers);
  let index = 0;
  events.filter(event => event.startDate.year == year)
    .filter(event => settings.ShowTraditional || event.description.startsWith('祝日'))
    .forEach(event => {
      const desc = event.description.replace(/\s[\s\S]*$/, '');
      tbody.appendChild(prepareElement({
        tag: 'tr',
        classes: [(desc == '祝日' ? 'national' : 'traditional')],
        children: [
          {
            tag: 'td',
            classes: ['alignRight'],
            textContent: ++index,
          },
          {
            tag: 'td',
            textContent: event.startDate.toString(),
          },
          {
            tag: 'td',
            classes: ['alignCenter'],
            textContent: toDayOfWeek(event),
          },
          {
            tag: 'td',
            textContent: event.summary,
          },
          {
            tag: 'td',
            textContent: desc,
          },
        ],
      }));
      filteredData.push([
        index,
        event.startDate.toString(),
        toDayOfWeek(event),
        event.summary,
        desc
      ]);
    });
}

function toDayOfWeek(event) {
  return dayOfWeeks[event.startDate.dayOfWeek() - 1];
}
