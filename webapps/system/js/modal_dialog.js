!(function (exports) {
  'use strict';

  const ModalDialog = {
    dialogAlert: document.getElementById('modal-dialog-alert'),
    dialogConfirm: document.getElementById('modal-dialog-confirm'),
    dialogPrompt: document.getElementById('modal-dialog-prompt'),
    dialogPermissionRequest: document.getElementById('modal-dialog-permission-request'),

    showAlert: function (title, message) {
      this.dialogAlert.querySelector('.title').textContent = title;
      this.dialogAlert.querySelector('.detail').textContent = message;

      const okButton = this.dialogAlert.querySelector('.recommend');
      okButton.addEventListener('click', this.handleAlertButtonClick);

      this.dialogAlert.classList.add('visible');
    },

    showConfirm: function (title, message, callback) {
      this.dialogConfirm.querySelector('.title').textContent = title;
      this.dialogConfirm.querySelector('.detail').textContent = message;

      const cancelButton = this.dialogConfirm.querySelector('.cancel');
      cancelButton.addEventListener(
        'click',
        this.handleCancelButtonClick.bind(this, callback, false)
      );

      const confirmButton = this.dialogConfirm.querySelector('.recommend');
      confirmButton.addEventListener(
        'click',
        this.handleConfirmButtonClick.bind(this, callback, true)
      );

      this.dialogConfirm.classList.add('visible');
    },

    showPrompt: function (title, message, callback) {
      this.dialogPrompt.querySelector('.title').textContent = title;
      this.dialogPrompt.querySelector('.detail').textContent = message;

      const cancelButton = this.dialogPrompt.querySelector('.cancel');
      cancelButton.addEventListener(
        'click',
        this.handleCancelButtonClick.bind(this, callback, null)
      );

      const confirmButton = this.dialogPrompt.querySelector('.recommend');
      confirmButton.addEventListener(
        'click',
        this.handlePromptConfirmButtonClick.bind(this, callback)
      );

      this.dialogPrompt.classList.add('visible');
    },

    showPermissionRequest: function (title, message, callback) {
      this.dialogPermissionRequest.querySelector('.title').textContent = title;
      this.dialogPermissionRequest.querySelector('.detail').textContent = message;

      const cancelButton = this.dialogPermissionRequest.querySelector('.cancel');
      cancelButton.addEventListener(
        'click',
        this.handleCancelButtonClick.bind(this, callback, false)
      );

      const PermissionRequestButton = this.dialogPermissionRequest.querySelector('.recommend');
      PermissionRequestButton.addEventListener(
        'click',
        this.handlePermissionRequestConfirmButtonClick.bind(this, callback, true)
      );

      this.dialogPermissionRequest.classList.add('visible');
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
      const input = ModalDialog.dialogPrompt.querySelector('.inputbox').value;
      ModalDialog.dialogPrompt.classList.remove('visible');
      callback(input);
    },

    handlePermissionRequestConfirmButtonClick: function (callback, value) {
      ModalDialog.dialogPermissionRequest.classList.remove('visible');
      callback(value);
    }
  };

  exports.ModalDialog = ModalDialog;
})(window);
