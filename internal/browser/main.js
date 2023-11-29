window.addEventListener('load', function () {
  window.browser = new Chrome(
    document.getElementById('chrome'),
    'http://browser.localhost:8081/index.html',
    true
  );
});
