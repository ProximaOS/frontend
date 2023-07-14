const { path } = require('path');

const Files = {
  DEFAULT_SHORTCUTS: [
    {
      name: 'audio',
      icon: 'audio_folder',
      path: path.join(require('os').homedir, 'audio')
    },
    {
      name: 'books',
      icon: 'books_folder',
      path: path.join(require('os').homedir, 'books')
    },
    {
      name: 'downloads',
      icon: 'downloads_folder',
      path: path.join(require('os').homedir, 'downloads')
    },
    {
      name: 'movies',
      icon: 'movies_folder',
      path: path.join(require('os').homedir, 'movies')
    },
    {
      name: 'photos',
      icon: 'photos_folder',
      path: path.join(require('os').homedir, 'photos')
    },
    {
      name: 'others',
      icon: 'others_folder',
      path: path.join(require('os').homedir, 'others')
    }
  ],

  init: function () {
    navigator.api.settings.getValue('files.quick-access').then(data => {
      if (!data) {
        settings.set('files.quick-access', this.DEFAULT_SHORTCUTS);
      }

      data.forEach(item => {
        var shortcut = document.createElement('li');
        shortcut.classList.add('page');
        shortcut.textContent = item.name;
        quickAccess.appendItem(shortcut);
      });
    });
  }
};

Files.init();
