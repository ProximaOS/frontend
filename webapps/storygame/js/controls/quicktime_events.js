const QuickTimeEvent = {
  qteSequence: [],
  qteIndex: 0,
  qteTimer: null,
  qteMashCount: 0,
  qteMashLimit: 10,
  qteMashProgress: 0,
  qteCallback: null,

  qteStart: function(sequence, callback) {
    // initialize the QTE sequence and callback function
    this.qteSequence = sequence;
    this.qteCallback = callback;
    
    // start the QTE timer
    this.qteTimer = setTimeout(() => {
      this.qteEnd(false);
    }, 5000);
    
    // start the QTE sequence
    this.qteIndex = 0;
    this.qteNext();
  },

  qteNext: function() {
    // check if the QTE sequence has ended
    if (this.qteIndex >= this.qteSequence.length) {
      this.qteEnd(true);
      return;
    }
    
    // display the next QTE prompt
    console.log(`Press ${this.qteSequence[this.qteIndex]}...`);
    
    // increment the QTE index
    this.qteIndex++;
    
    // restart the QTE timer
    clearTimeout(this.qteTimer);
    this.qteTimer = setTimeout(() => {
      this.qteEnd(false);
    }, 5000);
  },

  qtePress: function(button) {
    // check if the pressed button matches the next QTE prompt
    if (button === this.qteSequence[this.qteIndex - 1]) {
      // increment the QTE mash count and progress
      this.qteMashCount++;
      this.qteMashProgress = this.qteMashCount / this.qteMashLimit;
      
      // check if the QTE is a mash sequence and has reached the limit
      if (this.qteMashCount >= this.qteMashLimit) {
        this.qteNext();
      }
    } else {
      this.qteEnd(false);
    }
  },

  qteEnd: function(success) {
    // stop the QTE timer
    clearTimeout(this.qteTimer);
    
    // reset the QTE sequence and variables
    this.qteSequence = [];
    this.qteIndex = 0;
    this.qteMashCount = 0;
    this.qteMashProgress = 0;
    
    // execute the QTE callback function with the success status
    if (this.qteCallback) {
      this.qteCallback(success);
    }
  }
};
