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
      webapp.addEventListener('click', () =>
        this.openPanel(webapp, data)
      );
      this.initializeCategory(data.categories[0]).appendChild(webapp);

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

    openPanel: function (element, app) {
      Transitions.scale(element, this.webappPanel);
    }
  };
})(window);
