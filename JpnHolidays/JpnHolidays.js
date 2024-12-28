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
const filteredData = [['#', '日付', '曜日', '名前', '種類']];
const response = await fetch(uriJpnHolidays, { method: 'GET', mode: 'cors', });
const icalRaw = await response.text();
const events = new ICAL.Component(ICAL.parse(icalRaw))
  .getAllSubcomponents('vevent')
  .map(vevent => {
    const event = new ICAL.Event(vevent);
    event.description = event.description.replace(/\s[\s\S]*$/, '');
    event.startDateStr = event.startDate.toString();
    event.dayOfWeek = dayOfWeeks[event.startDate.dayOfWeek() - 1];
    return event;
  }).sort((a, b) => a.startDate.compare(b.startDate));
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
  filteredData.length = 1;
  events.filter(event => event.startDate.year == year)
    .filter(event => settings.ShowTraditional || event.description == '祝日')
    .forEach((event, index) => {
      tbody.appendChild(prepareElement({
        tag: 'tr',
        classes: [(event.description == '祝日' ? 'national' : 'traditional')],
        children: [
          {
            tag: 'td',
            classes: ['alignRight'],
            textContent: index + 1,
          },
          {
            tag: 'td',
            textContent: event.startDateStr,
          },
          {
            tag: 'td',
            classes: ['alignCenter'],
            textContent: event.dayOfWeek,
          },
          {
            tag: 'td',
            textContent: event.summary,
          },
          {
            tag: 'td',
            textContent: event.description,
          },
        ],
      }));
      filteredData.push([
        index + 1,
        event.startDateStr,
        event.dayOfWeek,
        event.summary,
        event.description,
      ]);
    });
}
