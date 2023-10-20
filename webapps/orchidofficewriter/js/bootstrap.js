document.getElementById('font-family').addEventListener('change', function () {
  document.execCommand('fontName', false, this.value);
});

document.getElementById('font-size').addEventListener('input', function () {
  document.execCommand('fontSize', false, this.value);
});

document.getElementById('font-style').addEventListener('change', function () {
  document.execCommand('italic', false, null);
});

document.getElementById('font-weight').addEventListener('change', function () {
  document.execCommand('bold', false, null);
});

document
  .getElementById('text-decoration')
  .addEventListener('change', function () {
    let textDecoration = this.value === 'none' ? 'underline' : this.value;
    document.execCommand(textDecoration, false, null);
  });

document.getElementById('text-color').addEventListener('input', function () {
  document.execCommand('foreColor', false, this.value);
});

document.getElementById('text-shadow').addEventListener('input', function () {
  let textShadow = this.value === '' ? 'none' : this.value;
  document.getElementById('editor').style.textShadow = textShadow;
});

document
  .getElementById('background-color')
  .addEventListener('input', function () {
    document.execCommand('hiliteColor', false, this.value);
  });

document
  .getElementById('text-direction')
  .addEventListener('change', function () {
    switch (this.value) {
      case 'right':
        document.execCommand('justifyRight', false, this.value);
        break;

      case 'center':
        document.execCommand('justifyCenter', false, this.value);
        break;

      default:
        document.execCommand('justifyLeft', false, this.value);
        break;
    }
  });

function downloadFile(data, filename, type) {
  const file = new Blob([data], { type });
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

document.getElementById('save').addEventListener('click', function () {
  const version = 1;
  const content = document.getElementById('editor').innerHTML;
  const data = { version, content };
  const jsonData = JSON.stringify(data);
  downloadFile(jsonData, 'document.orchidwriter', 'application/json');
});

document.getElementById('import').addEventListener('click', function () {
  // Code to open a file dialog and read the content
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.orchidwriter';
  input.addEventListener('change', function () {
    const file = this.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const content = JSON.parse(event.target.result).content;
      document.getElementById('editor').innerHTML = content;
    };

    reader.readAsText(file);
  });
  input.click();
});
