!(function (exports) {
  'use strict';

  const Files = {
    currentPath: '',

    quickAccess: document.getElementById('quick-access'),
    fileContainer: document.getElementById('content-files'),
    gridButton: document.getElementById('content-grid-button'),
    reloadButton: document.getElementById('content-reload-button'),
    pathName: document.getElementById('path-name'),

    DEFAULT_SHORTCUTS: [
      {
        name: 'home',
        className: 'home',
        path: '/'
      },
      {
        name: 'audio',
        className: 'audio',
        path: '/audio'
      },
      {
        name: 'books',
        className: 'books',
        path: '/books'
      },
      {
        name: 'downloads',
        className: 'downloads',
        path: '/downloads'
      },
      {
        name: 'movies',
        className: 'movies',
        path: '/movies'
      },
      {
        name: 'photos',
        className: 'photos',
        path: '/photos'
      },
      {
        name: 'others',
        className: 'others',
        path: '/others'
      }
    ],

    init: function () {
      this.gridButton.addEventListener(
        'click',
        this.handleGridButton.bind(this)
      );
      this.reloadButton.addEventListener(
        'click',
        this.handleReloadButton.bind(this)
      );

      window.Settings.getValue('files.quick-access').then((data) => {
        if (!Array.isArray(data)) {
          window.Settings.setValue(
            'files.quick-access',
            this.DEFAULT_SHORTCUTS
          );
        }

        data.forEach((item) => {
          const shortcut = document.createElement('li');
          shortcut.classList.add(item.className);
          shortcut.dataset.pageId = 'content';

          shortcut.onclick = () => {
            this.goTo(item.path);
          };

          const shortcutName = document.createElement('p');
          shortcutName.textContent = item.name;
          shortcut.appendChild(shortcutName);

          this.quickAccess.appendChild(shortcut);

          PageController.init();
        });
      });
    },

    goTo: function (path) {
      this.currentPath = path;

      this.fileContainer.innerHTML = '';
      this.pathName.innerHTML = path.replaceAll('//', '/');
      window.SDCardManager.list(path).then((files) => {
        files.sort();
        files.forEach((file) => {
          const item = document.createElement('div');
          item.classList.add('file');
          window.SDCardManager
            .getFileStats(`${path}/${file}`)
            .then((stat) => {
              if (stat.isDirectory()) {
                item.classList.add('folder');
                item.onclick = () => {
                  this.goTo(`${path}/${file}`);
                };
                this.fileContainer.appendChild(item);
              } else {
                item.classList.add('file');

                if (file.startsWith('.')) {
                  item.classList.add('hidden');
                }
                if (file.endsWith('.orchidApp')) {
                  item.onclick = () => {
                    ModalDialog.showConfirm(
                      `Install ${file}`,
                      `Do you want to install a 3rd-party app from ${file}? It could be a malicious app.`,
                      (result) => {
                        if (result) {
                          window.AppsManager.installPackage(
                            `${path}/${file}`
                          );
                        }
                      }
                    );
                  };
                }

                const mime = window.SDCardManager.getMime(file);
                if (mime.startsWith('text/')) {
                  item.classList.add('text');
                } else if (mime.startsWith('image/')) {
                  item.classList.add('image');
                  window.SDCardManager
                    .read(`${path}/${file}`, { encoding: 'base64' })
                    .then((data) => {
                      // Call a function to generate the HTML content with the Base64-encoded image data
                      item.style.setProperty(
                        '--thumbnail',
                        `url("data:${mime};base64,${data}")`
                      );
                    });
                } else if (mime.startsWith('audio/')) {
                  item.classList.add('audio');
                } else if (mime.startsWith('video/')) {
                  item.classList.add('video');
                }
                setTimeout(() => {
                  this.fileContainer.appendChild(item);
                }, 10);
              }
            });

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
          itemSize.textContent = this.getFolderSize(`${path}/${file}`);
          itemTextHolder.appendChild(itemSize);
        });
      });
    },

    getFolderSize: function (folderPath) {
      let totalSize = 0;

      async function calculateSize (filePath) {
        const stats = await window.SDCardManager.getFileStats(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
        } else if (stats.isDirectory()) {
          const nestedFiles = await window.SDCardManager.list(filePath);

          nestedFiles.forEach((file) => {
            const nestedFilePath = path.join(filePath, file);
            calculateSize(nestedFilePath);
          });
        }
      }

      calculateSize(folderPath);

      // Convert the total size to a human-readable format (e.g., KB, MB, GB)
      const sizeInBytes = totalSize;
      const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
      let size = sizeInBytes;
      let unitIndex = 0;

      while (size > 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      size = Math.round(size * 100) / 100; // Round to two decimal places

      return `${size} ${units[unitIndex]}`;
    },

    handleGridButton: function () {
      this.fileContainer.classList.toggle('grid');
      if (this.fileContainer.classList.contains('grid')) {
        this.gridButton.dataset.icon = 'menu';
      } else {
        this.gridButton.dataset.icon = 'grid';
      }
    },

    handleReloadButton: function () {
      this.goTo(this.currentPath);
    }
  };

  Files.init();
})(window);
