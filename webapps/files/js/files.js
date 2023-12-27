!(function () {
  'use strict';

  const Files = {
    currentPath: '',
    quickAccess: document.getElementById('quick-access'),
    fileContainer: document.getElementById('content-files'),
    gridButton: document.getElementById('content-grid-button'),
    reloadButton: document.getElementById('content-reload-button'),
    pathName: document.getElementById('path-name'),
    quickPreview: document.getElementById('quick-preview'),
    quickPreviewImage: document.getElementById('quick-preview-image'),
    quickPreviewVideo: document.getElementById('quick-preview-video'),

    DEFAULT_SHORTCUTS: [
      { name: 'home', class_name: 'home', path: '/' },
      { name: 'audio', class_name: 'audio', path: '/audio' },
      { name: 'books', class_name: 'books', path: '/books' },
      { name: 'downloads', class_name: 'downloads', path: '/downloads' },
      { name: 'movies', class_name: 'movies', path: '/movies' },
      { name: 'photos', class_name: 'photos', path: '/photos' },
      { name: 'others', class_name: 'others', path: '/others' }
    ],
    ARCHIVE_MIMES: [
      'application/zip',
      'application/vnd.rar',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-bzip2',
      'application/x-xz',
      'application/vnd.ms-cab-compressed',
      'application/x-iso9660-image'
    ],
    DB_MIMES: [
      'application/x-sqlite3',
      'application/octet-stream'
    ],
    PYTHON_MIMES: [
      'text/x-python',
      'application/x-python-code'
    ],
    SHELL_MIMES: [
      'application/x-sh'
    ],

    init: function () {
      this.gridButton.addEventListener('click', this.handleGridButton.bind(this));
      this.reloadButton.addEventListener('click', this.handleReloadButton.bind(this));

      Settings.getValue('files.quick-access').then((data) => {
        if (!Array.isArray(data)) {
          Settings.setValue('files.quick-access', this.DEFAULT_SHORTCUTS);
        }

        data.forEach((item) => {
          const shortcut = this.createShortcutElement(item);
          this.quickAccess.appendChild(shortcut);
          PageController.init();
        });
      });
    },

    createShortcutElement: function (item) {
      const shortcut = document.createElement('li');
      shortcut.classList.add(item.class_name);
      shortcut.dataset.pageId = 'content';
      shortcut.onclick = () => this.goTo(item.path);

      const shortcutName = document.createElement('p');
      shortcutName.textContent = item.name;
      shortcut.appendChild(shortcutName);

      return shortcut;
    },

    goTo: function (path) {
      this.currentPath = path;
      this.clearFileContainer();
      this.setPathName(path);

      SDCardManager.list(path).then((files) => {
        files.sort();
        files.forEach((file) => {
          const item = this.createFileElement(file, path);
          this.fileContainer.appendChild(item);
        });
      });
    },

    clearFileContainer: function () {
      this.fileContainer.innerHTML = '';
    },

    setPathName: function (path) {
      this.pathName.innerHTML = path.replaceAll('//', '/');
    },

    createFileElement: function (file, path) {
      const item = document.createElement('div');
      item.classList.add('file');

      const stat = SDCardManager.getStats(`${path}/${file}`);
      if (stat.is_directory) {
        this.setupFolderItem(item, file, path);
      } else {
        this.setupFileItem(item, file, path);
      }

      const itemIcon = document.createElement('div');
      itemIcon.classList.add('icon');
      item.appendChild(itemIcon);

      const itemTextHolder = document.createElement('div');
      itemTextHolder.classList.add('text-holder');
      item.appendChild(itemTextHolder);

      const itemName = document.createElement('div');
      itemName.classList.add('name');
      itemName.textContent = file;
      itemTextHolder.appendChild(itemName);

      const itemSize = document.createElement('div');
      itemSize.classList.add('size');
      itemSize.textContent = this.getFolderSize(`${path}/${file}`.substring(1));
      itemTextHolder.appendChild(itemSize);

      return item;
    },

    setupFolderItem: function (item, file, path) {
      item.classList.add('folder');
      item.onclick = () => this.goTo(`${path}/${file}`);
      this.fileContainer.appendChild(item);
    },

    setupFileItem: function (item, file, path) {
      item.classList.add('file');
      if (file.startsWith('.')) {
        item.classList.add('hidden');
      }

      // orx => Orchid App
      // ort => Orchid Theme
      if (file.endsWith('.orx') || file.endsWith('.ort')) {
        item.onclick = () => {
          IPC.send('message', {
            type: 'launch',
            manifestUrl: 'http://install.localhost:8081/manifest.json',
            activity: 'install-app',
            activity_args: {
              filepath: `${path}/${file}`
            }
          })
        };
      }

      const mime = SDCardManager.getMime(file);
      if (!mime) {
        if (file.endsWith('.zip')) {
          item.classList.add('archive');
        } else if (file.endsWith('.sqlite')) {
          item.classList.add('db');
        } else if (file.endsWith('.py')) {
          item.classList.add('python');
        } else if (file.endsWith('.sh')) {
          item.classList.add('shell');
        } else if (file.startsWith('readme')) {
          item.classList.add('readme');
        } else {
          item.classList.add('unknown');
        }
        requestAnimationFrame(() => {
          this.fileContainer.appendChild(item);
        });
        return;
      } else {
        if (mime.startsWith('text/')) {
          item.classList.add('text');
        } else if (mime.startsWith('image/')) {
          item.classList.add('image');

          SDCardManager.read(`${path}/${file}`, { encoding: 'base64' }).then((data) => {
            item.style.setProperty('--thumbnail', `url("data:${mime};base64,${data}")`);
          });
        } else if (mime.startsWith('audio/')) {
          item.classList.add('audio');
        } else if (mime.startsWith('video/')) {
          item.classList.add('video');
        } else if (this.ARCHIVE_MIMES.indexOf(mime) !== -1 || file.endsWith('.zip')) {
          item.classList.add('archive');
        } else if (this.DB_MIMES.indexOf(mime) !== -1 || file.endsWith('.sqlite')) {
          item.classList.add('db');
        } else if (this.PYTHON_MIMES.indexOf(mime) !== -1 || file.endsWith('.py')) {
          item.classList.add('python');
        } else if (this.SHELL_MIMES.indexOf(mime) !== -1 || file.endsWith('.sh')) {
          item.classList.add('shell');
        } else if (file.startsWith('readme')) {
          item.classList.add('readme');
        }

        item.ondblclick = () => {
          if (mime.startsWith('image/')) {
            SDCardManager.read(`${path}/${file}`, { encoding: 'base64' }).then((data) => {
              this.showPreview(`data:${mime};base64,${data}`, 'image');
            });
          } else if (mime.startsWith('video/')) {
            SDCardManager.read(`${path}/${file}`, { encoding: 'base64' }).then((data) => {
              this.showPreview(`data:${mime};base64,${data}`, 'video');
            });
          }
        };
      }

      setTimeout(() => {
        this.fileContainer.appendChild(item);
      }, 16);
    },

    handleGridButton: function () {
      this.fileContainer.classList.toggle('grid');

      if (this.fileContainer.classList.contains('grid')) {
        this.gridButton.dataset.icon = 'list';
      } else {
        this.gridButton.dataset.icon = 'grid';
      }
    },

    handleReloadButton: function () {
      this.goTo(this.currentPath);
    },

    getFolderSize: function (folderPath) {
      let totalSize = 0;

      async function calculateSize (filePath) {
        const stats = await SDCardManager.getStats(filePath);
        if (stats.is_directory) {
          const nestedFiles = await SDCardManager.list(filePath);

          nestedFiles.forEach((file) => {
            const nestedFilePath = filePath + '/' + file;
            calculateSize(nestedFilePath);
          });
        } else {
          totalSize += stats.size;
        }
      }
      calculateSize(folderPath);
    },

    showPreview: function (dataUrl, type) {
      this.quickPreview.classList.add('visible');

      if (type === 'image') {
        this.quickPreview.classList.remove('video');
        this.quickPreview.classList.add('image');

        this.quickPreviewImage.src = dataUrl;
      } else if (type === 'video') {
        this.quickPreview.classList.remove('image');
        this.quickPreview.classList.add('video');

        this.quickPreviewVideo.src = dataUrl;
        this.quickPreviewVideo.play();
      }

      document.onclick = () => {
        this.quickPreview.classList.remove('visible');
      };
    }
  };

  Files.init();
})();
