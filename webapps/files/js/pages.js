const PageController = {
  rootPanel: document.getElementById('root'),
  contentPanel: document.getElementById('content'),

  init: function () {
    const pageButtons = document.querySelectorAll('.page');
    pageButtons.forEach(button => {
      button.addEventListener('click', () => this.handlePageButtonClick(button));
    });
  },

  handlePageButtonClick: function (button) {
    const id = button.dataset.pageId;
    const pageUrl = `pages/${id}.html`;

    this.rootPanel.classList.remove('visible');
    this.rootPanel.classList.add('previous');
    this.contentPanel.classList.add('visible');
    this.contentPanel.classList.remove('next');

    const selectedButton = document.querySelector('.page.selected');
    if (selectedButton) {
      selectedButton.classList.remove('selected');
    }
    button.classList.add('selected');

    // Add event listener to the iframe's content window
    this.contentPanel.onload = () => {
      const iframeWindow = this.contentPanel.contentWindow;
      iframeWindow.document.querySelector('#back-button').addEventListener('click', () => {
        window.parent.document.getElementById('root').classList.add('visible');
        window.parent.document.getElementById('root').classList.remove('previous');
        window.parent.document.getElementById('content').classList.remove('visible');
        window.parent.document.getElementById('content').classList.add('next');
      });
    };

    this.contentPanel.src = pageUrl;
  }
};

PageController.init();
