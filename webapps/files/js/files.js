(function () {
  'use strict';

  const Files = {
    currentPath: '',
    quickAccess: document.getElementById('quick-access'),
    fileContainer: document.getElementById('content-files'),
    gridButton: document.getElementById('content-grid-button'),
    reloadButton: document.getElementById('content-reload-button'),
    pathName: document.getElementById('path-name'),
    DEFAULT_SHORTCUTS: [
      { name: 'home', class_name: 'home', path: '/' },
      { name: 'audio', class_name: 'audio', path: '/audio' },
      { name: 'books', class_name: 'books', path: '/books' },
      { name: 'downloads', class_name: 'downloads', path: '/downloads' },
      { name: 'movies', class_name: 'movies', path: '/movies' },
      { name: 'photos', class_name: 'photos', path: '/photos' },
      { name: 'others', class_name: 'others', path: '/others' }
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

      const stat = SDCardManager.getFileStats(`${path}/${file}`);
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

      const mime = SDCardManager.getMime(file);

      if (!mime) {
        item.classList.add('unknown');
        setTimeout(() => {
          this.fileContainer.appendChild(item);
        }, 16);
        return;
      }

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
        const stats = await SDCardManager.getFileStats(filePath);
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
    }
  };

  Files.init();
})();
