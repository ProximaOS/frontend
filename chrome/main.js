window.addEventListener('load', async function () {
  const hasWebappArgs = process.argv.indexOf('--webapp') !== -1;
  const webappArgIndex = process.argv.indexOf('--webapp');
  const manifestUrl = process.argv[webappArgIndex + 1];

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
        'https://www.google.com/',
        true
      );
    }
  }, 1000);
});
