var ModalDialog = {
  dialogAlert: document.getElementById('modal-dialog-alert'),
  dialogConfirm: document.getElementById('modal-dialog-confirm'),
  dialogPrompt: document.getElementById('modal-dialog-prompt'),

  showAlert: function (title, message) {
    this.dialogAlert.querySelector('.title').textContent = title;
    this.dialogAlert.querySelector('.detail').textContent = message;

    var okButton = this.dialogAlert.querySelector('.recommend');
    okButton.addEventListener('click', this.handleAlertButtonClick);

    this.dialogAlert.classList.add('visible');
  },

  showConfirm: function (title, message, callback) {
    this.dialogConfirm.querySelector('.title').textContent = title;
    this.dialogConfirm.querySelector('.detail').textContent = message;

    var cancelButton = this.dialogConfirm.querySelector('.cancel');
    cancelButton.addEventListener(
      'click',
      this.handleCancelButtonClick.bind(this, callback, false)
    );

    var confirmButton = this.dialogConfirm.querySelector('.recommend');
    confirmButton.addEventListener(
      'click',
      this.handleConfirmButtonClick.bind(this, callback, true)
    );

    this.dialogConfirm.classList.add('visible');
  },

  showPrompt: function (title, message, callback) {
    this.dialogPrompt.querySelector('.title').textContent = title;
    this.dialogPrompt.querySelector('.detail').textContent = message;

    var cancelButton = this.dialogPrompt.querySelector('.cancel');
    cancelButton.addEventListener(
      'click',
      this.handleCancelButtonClick.bind(this, callback, null)
    );

    var confirmButton = this.dialogPrompt.querySelector('.recommend');
    confirmButton.addEventListener(
      'click',
      this.handlePromptConfirmButtonClick.bind(this, callback)
    );

    this.dialogPrompt.classList.add('visible');
  },

  handleAlertButtonClick: function () {
    ModalDialog.dialogAlert.classList.remove('visible');
  },

  handleCancelButtonClick: function (callback, value) {
    ModalDialog.dialogConfirm.classList.remove('visible');
    callback(value);
  },

  handleConfirmButtonClick: function (callback, value) {
    ModalDialog.dialogConfirm.classList.remove('visible');
    callback(value);
  },

  handlePromptConfirmButtonClick: function (callback) {
    var input = ModalDialog.dialogPrompt.querySelector('.inputbox').value;
    ModalDialog.dialogPrompt.classList.remove('visible');
    callback(input);
  },
};
