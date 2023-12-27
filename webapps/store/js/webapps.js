!(function (exports) {
  'use strict';

  const Webapps = {
    webapps: document.getElementById('webapps'),

    webappPanel: document.getElementById('webapp'),
    webappBanner: document.getElementById('webapp-banner'),
    webappIcon: document.getElementById('webapp-icon'),
    webappHeaderIcon: document.getElementById('webapp-header-icon'),
    webappName: document.getElementById('webapp-name'),
    webappHeaderName: document.getElementById('webapp-header-name'),
    webappAuthors: document.getElementById('webapp-authors'),
    webappCategories: document.getElementById('webapp-categories'),
    webappDescription: document.getElementById('webapp-description'),
    webappLicense: document.getElementById('webapp-license'),
    webappLicenseItem: document.getElementById('webapp-license-item'),
    webappGitRepo: document.getElementById('webapp-git-repo'),
    webappDownloads: document.getElementById('webapp-downloads'),
    webappIncludesAds: document.getElementById('webapp-includes-ads'),
    webappIncludedTracking: document.getElementById('webapp-included-tracking'),

    LICENSE_URLS: {
      MIT: 'https://opensource.org/licenses/MIT',
      'Apache-2.0': 'https://www.apache.org/licenses/LICENSE-2.0',
      'GPL-2.0': 'https://www.gnu.org/licenses/old-licenses/gpl-2.0.html',
      'GPL-3.0': 'https://www.gnu.org/licenses/gpl-3.0.html',
      'LGPL-2.1': 'https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html',
      'LGPL-3.0': 'https://www.gnu.org/licenses/lgpl-3.0.html',
      'BSD-2-Clause': 'https://opensource.org/licenses/BSD-2-Clause',
      'BSD-3-Clause': 'https://opensource.org/licenses/BSD-3-Clause',
      ISC: 'https://opensource.org/licenses/ISC',
      Mozilla: 'https://www.mozilla.org/en-US/MPL/',
      'EPL-2.0': 'https://opensource.org/licenses/EPL-2.0',
      'CC-BY-4.0': 'https://creativecommons.org/licenses/by/4.0/',
      'CC-BY-SA-4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
      'CC0-1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
      Unlicense: 'http://unlicense.org/',
      'Artistic-2.0': 'https://opensource.org/licenses/Artistic-2.0',
      Zlib: 'https://opensource.org/licenses/Zlib'
    },

    init: function () {
      if ('OrchidServices' in window) {
        OrchidServices.list('webapps').then((array) => {
          for (let index = 0; index < array.length; index++) {
            const element = array[index];
            Webapps.populate(element);
          }
        });
      }
    },

    initializeCategory: function (categoryId) {
      const categoryExists = document.getElementById(`category-${categoryId}`);
      if (categoryExists) {
        return categoryExists.querySelector('.list');
      }

      const category = document.createElement('div');
      category.classList.add('category');
      category.id = `category-${categoryId}`;
      this.webapps.appendChild(category);

      const header = document.createElement('div');
      header.classList.add('header');
      category.appendChild(header);

      const headerLabel = document.createElement('h1');
      headerLabel.textContent = categoryId;
      header.appendChild(headerLabel);

      const headerExpand = document.createElement('a');
      headerExpand.href = '#';
      headerExpand.dataset.icon = 'chevron-down';
      headerExpand.textContent = L10n.get('seeMore');
      headerExpand.onclick = () => {
        category.classList.toggle('expanded');
      };
      header.appendChild(headerExpand);

      const list = document.createElement('ul');
      list.classList.add('list');
      category.appendChild(list);

      return list;
    },

    populate: function (data) {
      const webapp = document.createElement('li');
      webapp.classList.add('webapp');
      webapp.dataset.pageId = 'webapp';
      webapp.addEventListener('click', () =>
        this.openPanel(webapp, data)
      );
      this.initializeCategory(data.categories[0]).appendChild(webapp);
      PageController.init();

      const iconHolder = document.createElement('div');
      iconHolder.classList.add('icon-holder');
      webapp.appendChild(iconHolder);

      const icon = document.createElement('img');
      icon.classList.add('icon');
      icon.src = data.icon;
      iconHolder.appendChild(icon);

      const textHolder = document.createElement('div');
      textHolder.classList.add('text-holder');
      webapp.appendChild(textHolder);

      const name = document.createElement('span');
      name.classList.add('name');
      name.textContent = data.name;
      textHolder.appendChild(name);

      const stats = document.createElement('span');
      stats.classList.add('stats');
      textHolder.appendChild(stats);

      const price = document.createElement('span');
      price.classList.add('price');
      price.textContent = data.price;
      stats.appendChild(price);

      const statSeparator = document.createElement('div');
      statSeparator.classList.add('separator');
      stats.appendChild(statSeparator);

      const ageRating = document.createElement('span');
      ageRating.classList.add('ageRating');
      ageRating.textContent = data.ageRating.split('-')[1] + '+';
      stats.appendChild(ageRating);
    },

    openPanel: function (element, data) {
      Transitions.scale(element, this.webappPanel);
      Transitions.scale(element.querySelector('.icon'), this.webappIcon);
      Transitions.scale(element.querySelector('.name'), this.webappName);

      this.webappBanner.src = data.banner;
      this.webappIcon.src = data.icon;
      this.webappHeaderIcon.src = data.icon;
      this.webappName.textContent = data.name;
      this.webappHeaderName.textContent = data.name;

      this.webappAuthors.innerHTML = '';
      for (let index = 0; index < data.developers.length; index++) {
        const element = data.developers[index];

        const author = document.createElement('a');
        author.href = '#';
        author.textContent = element;
        this.webappAuthors.appendChild(author);
      }

      this.webappCategories.innerHTML = '';
      for (let index = 0; index < data.categories.length; index++) {
        const element = data.categories[index];

        const category = document.createElement('a');
        category.href = '#';
        category.textContent = element;
        this.webappCategories.appendChild(category);
      }

      this.webappDescription.innerText = data.description;
      this.webappLicense.textContent = data.license;
      this.webappGitRepo.textContent = data.gitRepo || L10n.get('none');
      this.webappDownloads.textContent = data.downloads.length;
      this.webappIncludesAds.textContent = data.includesAds ? L10n.get('yes') : L10n.get('no');

      this.webappLicenseItem.onclick = () => {
        window.open(this.LICENSE_URLS[data.license]);
      }
    }
  };

  Webapps.init();
})(window);
