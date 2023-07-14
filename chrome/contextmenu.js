function contextMenu(x, y, items) {
  var element = document.getElementById('context-menu');
  element.classList.add('visible');
  document.body.classList.add('context-menu-visible');
  element.style.left = x + 'px';
  element.style.top = y + 'px';

  document.onclick = () => {
    element.classList.remove('visible');
    document.body.classList.remove('context-menu-visible');
  };

  element.innerHTML = '';
  items.forEach(item => {
    var button = document.createElement('button');
    button.classList.add('item');
    button.disabled = item.disabled;
    button.textContent = item.name;
    button.addEventListener("click", item.onclick);
    element.appendChild(button);
  });
}