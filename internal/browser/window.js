const { ipcRenderer } = require('electron');

if (/Windows/.test(navigator.userAgent)) {
  document.body.classList.add('win32');
} else if (/Mac/.test(navigator.userAgent)) {
  document.body.classList.add('darwin');
} else if (/Linux/.test(navigator.userAgent)) {
  document.body.classList.add('linux');
}

// Close button click event
document.getElementById('close-button').addEventListener('click', () => {
  ipcRenderer.send('close-window');
});

// Maximize button click event
document.getElementById('resize-button').addEventListener('click', () => {
  ipcRenderer.send('maximize-window');
  document.body.classList.toggle('maximized');
});

// Minimize button click event
document.getElementById('minimize-button').addEventListener('click', () => {
  ipcRenderer.send('minimize-window');
});
