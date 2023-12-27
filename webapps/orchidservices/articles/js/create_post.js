!(function (exports) {
  'use strict';

  const CreatePost = {
    postButton: document.getElementById('post-button'),

    dialog: document.getElementById('create-post'),
    dialogAudience: document.getElementById('create-post-audience'),
    dialogInput: document.getElementById('create-post-input'),
    closeButton: document.getElementById('create-post-close-button'),
    submitButton: document.getElementById('create-post-submit-button'),

    init: function () {
      this.postButton.addEventListener('click', this.handlePostButtonClick.bind(this));

      this.dialog.addEventListener('submit', this.handleSubmit.bind(this));
      this.closeButton.addEventListener('click', this.handleCloseButtonClick.bind(this));
      this.submitButton.addEventListener('click', this.handleSubmitButtonClick.bind(this));
    },

    handleSubmit: function (event) {
      event.preventDefault();
    },

    handlePostButtonClick: function (event) {
      this.dialog.classList.add('visible');
    },

    handleCloseButtonClick: function (event) {
      this.dialog.classList.remove('visible');
    },

    handleSubmitButtonClick: function (event) {
      _os.articles.post(this.dialogAudience.value, this.dialogInput.value);
      this.dialog.classList.remove('visible');
    }
  };

  CreatePost.init();
})(window);
