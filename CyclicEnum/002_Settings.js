import { CyclicEnum } from '../modules/CyclicEnum.mjs';
import { AutoSaveConfig } from '../modules/AutoSaveConfig.mjs';
import { prepareElement } from '../modules/PrepareElement.mjs';

const d = document;

const Network = new CyclicEnum('None', 'Wifi', 'Mobile');
const Position = new CyclicEnum('LT', 'RT', 'LB', 'RB');

const settings = new AutoSaveConfig({
  Network: Network.Wifi,
  Position: Position.LB,
}, '002_Settings');

const elmLog = d.getElementById('Log');
const showLog = () => { elmLog.value = JSON.stringify(settings, null, 2); };
showLog();

d.getElementById('Content').appendChild(prepareElement({
  tag: 'div',
  id: 'Settings',
  children: [{
    tag: 'details',
    open: true,
    children: [
      {
        tag: 'summary',
        innerHTML: '&#x1f9f0;Settings',
      },
      {
        tag: 'div',
        children: [
          {
            tag: 'fieldset',
            children: [
              {
                tag: 'legend',
                textContent: 'Network',
              },
              {
                tag: 'div',
                children: Network.map(n => {
                  return {
                    tag: 'label',
                    children: [
                      {
                        tag: 'input',
                        type: 'radio',
                        name: 'Network',
                        checked: n == settings.Network,
                        events: {
                          change: (ev) => {
                            settings.Network = n;
                            showLog();
                          },
                        },
                      },
                      {
                        tag: 'span',
                        textContent: n,
                      },
                    ],
                  }
                }),
              },
            ],
          },
          {
            tag: 'fieldset',
            children: [
              {
                tag: 'legend',
                textContent: 'Position',
              },
              {
                tag: 'div',
                children: Position.map(p => {
                  return {
                    tag: 'label',
                    children: [
                      {
                        tag: 'input',
                        type: 'radio',
                        name: 'Position',
                        checked: p == settings.Position,
                        events: {
                          change: (ev) => {
                            settings.Position = p;
                            showLog();
                          },
                        },
                      },
                      {
                        tag: 'span',
                        textContent: p,
                      },
                    ],
                  }
                }),
              },
            ],
          },
        ],
      },
    ],
  }],
}));
