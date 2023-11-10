!(function (exports) {
  'use strict';

  const About = {
    version: document.getElementById('about-version'),
    engineVersion: document.getElementById('about-engine-version'),
    branch: document.getElementById('about-branch'),
    execPath: document.getElementById('about-exec-path'),
    args: document.getElementById('about-argv'),

    init: function () {
      this.version.textContent = Environment.version;
      this.engineVersion.textContent = Environment.engineVersion;
      this.branch.textContent = Environment.type;
      this.execPath.textContent = Environment.execPath;
      this.args.textContent = Environment.argv.join(' ');
    }
  };

  About.init();
})(window);
