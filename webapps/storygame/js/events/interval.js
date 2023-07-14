const EventInterval = {
  eventArray: [], // array to store the event functions

  // Add an event function to the array
  addEvent: function(eventFunc) {
    this.eventArray.push(eventFunc);
  },

  // Execute the event functions sequentially
  execute: function(startIndex = 0) {
    let index = startIndex;

    // Define a recursive function to execute the events
    const executeNextEvent = () => {
      if (index < this.eventArray.length) {
        const eventFunc = this.eventArray[index];
        eventFunc(() => {
          index++;
          executeNextEvent();
        });
      }
    };

    // Start executing the events
    executeNextEvent();
  }
};
