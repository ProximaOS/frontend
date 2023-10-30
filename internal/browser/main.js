window.addEventListener('load', async function () {
  Browser.init(
    document.getElementById('chrome'),
    'http://browser.localhost:8081/index.html',
    true
  );
});
