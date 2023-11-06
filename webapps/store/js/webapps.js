!(function (exports) {
  'use strict';

  window.addEventListener('orchidservicesload', () => {
    OrchidServices.getList('webapps', (array) => {
      Webapps.populate(array);
    });
  });

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
    webappGitRepo: document.getElementById('webapp-git-repo'),
    webappDownloads: document.getElementById('webapp-downloads'),
    webappIncludesAds: document.getElementById('webapp-includes-ads'),
    webappIncludedTracking: document.getElementById('webapp-included-tracking'),

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
      headerExpand.textContent = navigator.mozL10n.get('seeMore');
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
      console.log(data);
      Transitions.scale(element, this.webappPanel);

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
      this.webappGitRepo.textContent = data.gitRepo || navigator.mozL10n.get('none');
      this.webappDownloads.textContent = data.downloads.length;
      this.webappIncludesAds.textContent = data.includesAds ? navigator.mozL10n.get('yes') : navigator.mozL10n.get('no');
    }
  };
})(window);
