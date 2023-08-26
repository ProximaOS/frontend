const canvas = document.getElementById('paintCanvas');
const context = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const lineWidth = document.getElementById('lineWidth');
const opacity = document.getElementById('opacity');
const presetColors = document.getElementById('presetColors');

let painting = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

context.lineCap = 'round';
context.strokeStyle = colorPicker.value;
context.lineWidth = lineWidth.value;
context.globalAlpha = opacity.value;

canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', stopPainting);
canvas.addEventListener('mousemove', draw);
colorPicker.addEventListener('change', updateColor);
lineWidth.addEventListener('input', updateLineWidth);
opacity.addEventListener('input', updateOpacity);
presetColors.addEventListener('change', usePresetColor);

function startPainting(e) {
  painting = true;
  draw(e);
}

function stopPainting() {
  painting = false;
  context.beginPath();
}

function draw(e) {
  if (!painting) return;

  const x = e.clientX - canvas.getBoundingClientRect().left;
  const y = e.clientY - canvas.getBoundingClientRect().top;

  context.lineTo(x, y);
  context.stroke();
  context.beginPath();
  context.moveTo(x, y);
}

function updateColor() {
  context.strokeStyle = colorPicker.value;
}

function updateLineWidth() {
  context.lineWidth = lineWidth.value;
}

function updateOpacity() {
  context.globalAlpha = opacity.value;
}

function usePresetColor() {
  colorPicker.value = presetColors.value;
  updateColor();
}

let zoomLevel = 1;

canvas.addEventListener('wheel', handleWheel);

function redrawCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.scale(zoomLevel, zoomLevel);

  // Place your drawing operations here
  // For example, drawing lines or shapes
  context.beginPath();
  context.moveTo(50, 50);
  context.lineTo(150, 150);
  context.stroke();

  // End of drawing operations

  context.restore();
}

function handleWheel(e) {
  if (e.ctrlKey) {
    e.preventDefault();

    const deltaY = e.deltaY;
    const zoomFactor = deltaY > 0 ? 0.9 : 1.1;

    zoomLevel *= zoomFactor;
    zoomLevel = Math.max(0.1, Math.min(2, zoomLevel)); // Limit zoom range

    redrawCanvas();
  }
}
