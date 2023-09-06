window.addEventListener('load', async function () {
  const hasWebappArgs = process.argv.indexOf('--webapp') !== -1;
  const webappArgIndex = process.argv.indexOf('--webapp');
  const manifestUrl = process.argv[webappArgIndex + 1];

  if ('_session' in window) {
    _session.settings
      .getValue('homescreen.accent_color.rgb')
      .then((value) => {
        if (document.querySelector('.app')) {
          document.scrollingElement.style.setProperty(
            '--accent-color-r',
            value.r
          );
          document.scrollingElement.style.setProperty(
            '--accent-color-g',
            value.g
          );
          document.scrollingElement.style.setProperty(
            '--accent-color-b',
            value.b
          );
        }
      });

    _session.settings
      .getValue('general.software_buttons.enabled')
      .then((value) => {
        if (document.querySelector('.app')) {
          if (value) {
            document
              .querySelector('.app')
              .style.setProperty('--software-buttons-height', '4rem');
          } else {
            document
              .querySelector('.app')
              .style.setProperty('--software-buttons-height', '2.5rem');
          }
        }
      });

    if ('mozL10n' in navigator) {
      _session.settings.getValue('general.lang.code').then((value) => {
        navigator.mozL10n.language.code = value;
      });
    }
  }

  let manifest;
  if (hasWebappArgs) {
    await fetch(manifestUrl)
      .then((response) => response.json())
      .then(function (data) {
        manifest = data;
        // You can perform further operations with the 'manifest' variable here
      })
      .catch(function (error) {
        console.log('Error fetching manifest:', error);
      });
  }

  setTimeout(() => {
    if (hasWebappArgs) {
      if (manifest.start_url) {
        Browser.init(
          document.getElementById('chrome'),
          manifest.start_url,
          false
        );
      } else {
        Browser.init(
          document.getElementById('chrome'),
          manifest.launch_url,
          false
        );
      }
    } else {
      Browser.init(
        document.getElementById('chrome'),
        'http://browser.localhost:8081/index.html',
        true
      );
    }
  }, 1000);
});
