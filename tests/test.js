module.exports = {
  states: {
    PASS: 0,
    FAILED: 1,
    UNKNOWN: 2
  },

  performTest: function (callback) {
    return new Promise((resolve, reject) => {
      try {
        callback();
        resolve(this.states.PASS);
      } catch (error) {
        if (error) {
          resolve(this.states.FAILED);
        } else {
          resolve(this.states.UNKNOWN);
        }
      }
    });
  }
};
