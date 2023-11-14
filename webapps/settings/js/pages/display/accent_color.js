!(function (exports) {
  'use strict';

  const AccentColor = {
    colorwaysContainer: document.getElementById('accent-color-colorways'),

    settings: ['homescreen.accent_color.rgb'],
    SETTINGS_ACCENT_COLOR: 0,

    PRESET_COLORWAYS: [
      {
        primary: 0xc00040,
        secondary: 0xff6040
      },
      {
        primary: 0xff6040,
        secondary: 0xffc000
      },
      {
        primary: 0xffc000,
        secondary: 0x40a060
      },
      {
        primary: 0x40a060,
        secondary: 0x60ff80
      },
      {
        primary: 0x60ff80,
        secondary: 0x00ddff
      },
      {
        primary: 0x00ddff,
        secondary: 0x0061e0
      },
      {
        primary: 0x0061e0,
        secondary: 0x8030a0
      },
      {
        primary: 0x8030a0,
        secondary: 0xff60c0
      },
      {
        primary: 0xff60c0,
        secondary: 0xc00040
      },
      {
        primary: 0x454545,
        secondary: 0x858585
      },
      {
        primary: 0x858585,
        secondary: 0xb5b5b5
      },
      {
        primary: 0xffc000,
        secondary: 0x454545
      },
      {
        primary: 0xff6040,
        secondary: 0x803010
      },
      {
        primary: 0x80c2ff,
        secondary: 0x0061e0
      }
    ],

    init: function () {
      this.populateColors();
    },

    populateColors: function () {
      const colors = this.PRESET_COLORWAYS;
      for (let index = 0; index < colors.length; index++) {
        const color = colors[index];

        const r1 = (color.primary >> 16) & 0xff;
        const g1 = (color.primary >> 8) & 0xff;
        const b1 = color.primary & 0xff;

        const r2 = (color.secondary >> 16) & 0xff;
        const g2 = (color.secondary >> 8) & 0xff;
        const b2 = color.secondary & 0xff;

        const element = document.createElement('div');
        element.classList.add('color');
        element.style.setProperty('--accent-color-primary-r', r1);
        element.style.setProperty('--accent-color-primary-g', g1);
        element.style.setProperty('--accent-color-primary-b', b1);
        element.style.setProperty('--accent-color-secondary-r', r2);
        element.style.setProperty('--accent-color-secondary-g', g2);
        element.style.setProperty('--accent-color-secondary-b', b2);
        this.colorwaysContainer.appendChild(element);

        element.addEventListener('click', () => {
          document.scrollingElement.style.setProperty('--accent-color-primary-r', r1);
          document.scrollingElement.style.setProperty('--accent-color-primary-g', g1);
          document.scrollingElement.style.setProperty('--accent-color-primary-b', b1);
          document.scrollingElement.style.setProperty('--accent-color-secondary-r', r2);
          document.scrollingElement.style.setProperty('--accent-color-secondary-g', g2);
          document.scrollingElement.style.setProperty('--accent-color-secondary-b', b2);
          Settings.setValue(this.settings[this.SETTINGS_ACCENT_COLOR], {
            primary: {
              r: r1,
              g: g1,
              b: b1
            },
            secondary: {
              r: r2,
              g: g2,
              b: b2
            }
          });
        });
      }
    }
  };

  AccentColor.init();
})(window);
