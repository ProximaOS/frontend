window.addEventListener('DOMContentLoaded', () => {
  // Fetch available networks and populate the list
  const webappsList = document.getElementById('webapps-list');

  var apps = navigator.api.appManager.readAppList();
  apps.then((data) => {
    data.forEach(item => {
      var element = document.createElement('li');
      webappsList.appendChild(element);

      var icon = document.createElement('img');
      if (item.manifest.icons) {
        icon.src = item.manifest.icons[45];
      }
      icon.onerror = () => {
        icon.src = '/images/default.png';
      };
      element.appendChild(icon);

      var textHolder = document.createElement('div');
      element.appendChild(textHolder);

      var name = document.createElement('p');
      name.textContent = item.manifest.name;
      textHolder.appendChild(name);

      var size = document.createElement('p');
      size.textContent = item.size;
      textHolder.appendChild(size);
    });
  });
});
