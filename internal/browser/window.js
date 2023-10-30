if (/Windows/.test(navigator.userAgent)) {
  document.body.classList.add('win32');
} else if (/Mac/.test(navigator.userAgent)) {
  document.body.classList.add('darwin');
} else if (/Linux/.test(navigator.userAgent)) {
  document.body.classList.add('linux');
}

// Close button click event
document.getElementById('close-button').addEventListener('click', () => {
  IPC.send('close-window');
});

// Maximize button click event
document.getElementById('resize-button').addEventListener('click', () => {
  IPC.send('maximize-window');
  document.body.classList.toggle('maximized');
});

// Minimize button click event
document.getElementById('minimize-button').addEventListener('click', () => {
  IPC.send('minimize-window');
});
