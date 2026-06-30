import { CyclicEnum } from '../modules/CyclicEnum.mjs';
import { AutoSaveConfig } from '../modules/AutoSaveConfig.mjs';
import { prepareElement } from '../modules/PrepareElement.mjs';

const d = document;

const Network = new CyclicEnum('None', 'Wifi', 'Mobile');
const Position = new CyclicEnum('LT', 'RT', 'LB', 'RB');
const Animal = new CyclicEnum({
  Dog: {},
  Cat: { Fav: 'Fish', },
  Rabbit: { Fav: 'Cabbage', },
  Snake: { Fav: 'Egg', },
});
const Favorite = new CyclicEnum('Meat', 'Fish', 'Cabbage', 'Egg');

const settings = new AutoSaveConfig({
  Network: Network.Wifi,
  Position: Position.LB,
  Animal: Animal.Cat,
  Favorite: Favorite[0],
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
          {
            tag: 'fieldset',
            children: [
              {
                tag: 'legend',
                textContent: 'Animal',
              },
              {
                tag: 'div',
                children: Animal.map(a => {
                  return {
                    tag: 'label',
                    children: [
                      {
                        tag: 'input',
                        type: 'radio',
                        name: 'Animal',
                        checked: a == settings.Animal,
                        events: {
                          change: (ev) => {
                            settings.Animal = a;
                            settings.Favorite = Favorite.get(a.Fav);
                            d.getElementById(`Fav_${settings.Favorite}`).checked = true;
                            showLog();
                          },
                        },
                      },
                      {
                        tag: 'span',
                        textContent: a,
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
                textContent: 'Favorite',
              },
              {
                tag: 'div',
                children: Favorite.map(f => {
                  return {
                    tag: 'label',
                    children: [
                      {
                        tag: 'input',
                        id: `Fav_${f}`,
                        type: 'radio',
                        name: 'Favorite',
                        checked: f == settings.Favorite,
                        events: {
                          change: (ev) => {
                            settings.Favorite = f;
                            showLog();
                          },
                        },
                      },
                      {
                        tag: 'span',
                        textContent: f,
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
