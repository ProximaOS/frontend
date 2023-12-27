!(function (exports) {
  'use strict';

  const ModalDialog = {
    dialogAlert: document.getElementById('modal-dialog-alert'),
    dialogConfirm: document.getElementById('modal-dialog-confirm'),
    dialogPrompt: document.getElementById('modal-dialog-prompt'),
    dialogPermissionRequest: document.getElementById('modal-dialog-permission-request'),
    dialogValueSelector: document.getElementById('modal-dialog-value-selector'),
    dialogGreetings: document.getElementById('modal-dialog-greetings'),
    dialogPatchLogs: document.getElementById('modal-dialog-patch-logs'),

    SOUND_MODAL_FOREGROUND: new Audio('/resources/sounds/foreground.wav'),
    SOUND_MODAL_EXCLAMATION: new Audio('/resources/sounds/exclamation.wav'),

    showAlert: function (title, message) {
      this.SOUND_MODAL_EXCLAMATION.currentTime = 0;
      this.SOUND_MODAL_EXCLAMATION.play();

      this.dialogAlert.querySelector('.title').textContent = title;
      this.dialogAlert.querySelector('.detail').textContent = message;

      const okButton = this.dialogAlert.querySelector('.recommend');
      okButton.addEventListener('click', this.handleAlertButtonClick);

      this.dialogAlert.classList.add('visible');
    },

    showConfirm: function (title, message, callback) {
      this.SOUND_MODAL_FOREGROUND.currentTime = 0;
      this.SOUND_MODAL_FOREGROUND.play();

      this.dialogConfirm.querySelector('.title').textContent = title;
      this.dialogConfirm.querySelector('.detail').textContent = message;

      const cancelButton = this.dialogConfirm.querySelector('.cancel');
      cancelButton.addEventListener('click', this.handleCancelButtonClick.bind(this, callback, false));

      const confirmButton = this.dialogConfirm.querySelector('.recommend');
      confirmButton.addEventListener('click', this.handleConfirmButtonClick.bind(this, callback, true));

      this.dialogConfirm.classList.add('visible');
    },

    showPrompt: function (title, message, callback) {
      this.SOUND_MODAL_FOREGROUND.currentTime = 0;
      this.SOUND_MODAL_FOREGROUND.play();

      this.dialogPrompt.querySelector('.title').textContent = title;
      this.dialogPrompt.querySelector('.detail').textContent = message;

      const cancelButton = this.dialogPrompt.querySelector('.cancel');
      cancelButton.addEventListener('click', this.handlePromptCancelButtonClick.bind(this, callback));

      const confirmButton = this.dialogPrompt.querySelector('.recommend');
      confirmButton.addEventListener('click', this.handlePromptConfirmButtonClick.bind(this, callback));

      this.dialogPrompt.classList.add('visible');
    },

    showPermissionRequest: function (title, message, callback) {
      this.SOUND_MODAL_EXCLAMATION.currentTime = 0;
      this.SOUND_MODAL_EXCLAMATION.play();

      this.dialogPermissionRequest.querySelector('.title').textContent = title;
      this.dialogPermissionRequest.querySelector('.detail').textContent = message;

      const cancelButton = this.dialogPermissionRequest.querySelector('.cancel');
      cancelButton.addEventListener('click', this.handlePermissionRequestCancelButtonClick.bind(this, callback));

      const PermissionRequestButton = this.dialogPermissionRequest.querySelector('.recommend');
      PermissionRequestButton.addEventListener('click', this.handlePermissionRequestConfirmButtonClick.bind(this, callback));

      this.dialogPermissionRequest.classList.add('visible');
    },

    showValueSelector: function (title, options, defaultOption) {
      this.SOUND_MODAL_FOREGROUND.currentTime = 0;
      this.SOUND_MODAL_FOREGROUND.play();

      this.dialogValueSelector.querySelector('.title').textContent = title;

      const optionsContainer = this.dialogValueSelector.querySelector('.detail');
      const fragment = document.createDocumentFragment();
      for (let index = 0; index < options.length; index++) {
        const option = options[index];

        const element = document.createElement('li');
        fragment.appendChild(element);

        const name = document.createElement('p');
        name.textContent = option;
        element.appendChild(name);

        if (option === defaultOption) {
          const state = document.createElement('p');
          state.textContent = L10n.get('default');
          element.appendChild(state);
        }
      }
      optionsContainer.appendChild(fragment);

      const cancelButton = this.dialogValueSelector.querySelector('.cancel');
      cancelButton.addEventListener('click', this.handleValueSelectorCancelButtonClick.bind(this, false));

      const confirmButton = this.dialogValueSelector.querySelector('.recommend');
      confirmButton.addEventListener('click', this.handleValueSelectorConfirmButtonClick.bind(this, callback, defaultOption, true));

      this.dialogValueSelector.classList.add('visible');
    },

    showGreetings: function (artwork, title, message) {
      this.SOUND_MODAL_FOREGROUND.currentTime = 0;
      this.SOUND_MODAL_FOREGROUND.play();

      this.dialogGreetings.querySelector('.artwork').src = artwork;
      this.dialogGreetings.querySelector('.title').textContent = title;
      this.dialogGreetings.querySelector('.detail').textContent = message;

      const okButton = this.dialogGreetings.querySelector('.recommend');
      okButton.addEventListener('click', this.handleGreetingsButtonClick.bind(this));

      this.dialogGreetings.classList.add('visible');
    },

    showPatchLogs: function (artwork, title, message) {
      this.SOUND_MODAL_FOREGROUND.currentTime = 0;
      this.SOUND_MODAL_FOREGROUND.play();

      this.dialogPatchLogs.querySelector('.artwork').src = artwork;
      this.dialogPatchLogs.querySelector('.title').textContent = title;
      this.dialogPatchLogs.querySelector('.detail').textContent = message;

      const okButton = this.dialogPatchLogs.querySelector('.recommend');
      okButton.addEventListener('click', this.handlePatchLogsButtonClick.bind(this));

      this.dialogPatchLogs.classList.add('visible');
    },

    handleAlertButtonClick: function (event) {
      event.preventDefault();
      ModalDialog.dialogAlert.classList.remove('visible');
    },

    handleCancelButtonClick: function (callback, value, event) {
      event.preventDefault();
      ModalDialog.dialogConfirm.classList.remove('visible');
      callback(value);
    },

    handleConfirmButtonClick: function (callback, value, event) {
      event.preventDefault();
      ModalDialog.dialogConfirm.classList.remove('visible');
      callback(value);
    },

    handlePromptCancelButtonClick: function (callback, event) {
      event.preventDefault();
      ModalDialog.dialogPrompt.classList.remove('visible');
      callback(null);
    },

    handlePromptConfirmButtonClick: function (callback, event) {
      event.preventDefault();
      const input = ModalDialog.dialogPrompt.querySelector('.inputbox').value;
      ModalDialog.dialogPrompt.classList.remove('visible');
      callback(input);
    },

    handlePermissionRequestCancelButtonClick: function (callback, event) {
      event.preventDefault();
      ModalDialog.dialogPermissionRequest.classList.remove('visible');
      const targetDecision = false;
      callback(targetDecision);
    },

    handlePermissionRequestConfirmButtonClick: function (callback, event) {
      event.preventDefault();
      ModalDialog.dialogPermissionRequest.classList.remove('visible');
      const targetDecision = false;
      callback(targetDecision);
    },

    handleValueSelectorCancelButtonClick: function (event) {
      event.preventDefault();
      ModalDialog.dialogValueSelector.classList.remove('visible');
    },

    handleValueSelectorConfirmButtonClick: function (callback, data, event) {
      event.preventDefault();
      ModalDialog.dialogValueSelector.classList.remove('visible');
      callback(data);
    },

    handleGreetingsButtonClick: function (event) {
      event.preventDefault();
      ModalDialog.dialogGreetings.classList.remove('visible');
    },

    handlePatchLogsButtonClick: function (event) {
      event.preventDefault();
      ModalDialog.dialogPatchLogs.classList.remove('visible');
    }
  };

  exports.ModalDialog = ModalDialog;
})(window);
