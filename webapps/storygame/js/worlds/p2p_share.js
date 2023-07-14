const P2PShare = {
  peerConnection: null,
  dataChannels: {},
  sendBuffers: {},
  receiveBuffers: {},
  id: null,

  createPeerConnection(id) {
    this.peerConnection = new RTCPeerConnection();

    // Set up handling of ICE candidates
    this.peerConnection.addEventListener("icecandidate", this.onIceCandidate.bind(this));

    this.id = id;
  },

  addDataChannel(id) {
    // Create data channel for the given peer ID
    const dataChannel = this.peerConnection.createDataChannel(`dataChannel-${id}`);
    this.dataChannels[id] = dataChannel;

    // Set up send buffer and message handling for the data channel
    this.sendBuffers[id] = [];
    this.receiveBuffers[id] = [];
    dataChannel.addEventListener("open", () => this.onDataChannelOpen(id));
    dataChannel.addEventListener("message", event => this.onDataChannelMessage(id, event));

    return new Promise(resolve => {
      // Set up offer creation
      this.peerConnection.createOffer()
        .then(offer => {
          this.peerConnection.setLocalDescription(offer);
        })
        .catch(error => {
          console.error(error);
        });

      // Set up handling of answer from remote peer
      this.peerConnection.addEventListener("connectionstatechange", () => {
        if (this.peerConnection.connectionState === "connected") {
          resolve();
        }
      });
    });
  },

  shareData(id, data) {
    if (!this.dataChannels[id]) {
      console.error(`No data channel found for ID ${id}`);
      return;
    }

    // Send data object as JSON string over the data channel
    const message = JSON.stringify({ id: this.id, data });
    this.dataChannels[id].send(message);
  },

  receiveData(id, callback) {
    if (!this.dataChannels[id]) {
      console.error(`No data channel found for ID ${id}`);
      return;
    }

    // Wait for receive buffer to have a message for this ID
    const interval = setInterval(() => {
      const index = this.receiveBuffers[id].findIndex(message => message.id === id);
      if (index !== -1) {
        clearInterval(interval);
        const message = this.receiveBuffers[id].splice(index, 1)[0];
        callback(message.data);
      }
    }, 100);
  },

  onDataChannelOpen(id) {
    console.log(`Data channel opened for ID ${id}`);
  },

  onDataChannelMessage(id, event) {
    // Parse message as JSON and add it to receive buffer for the given ID
    const message = JSON.parse(event.data);
    this.receiveBuffers[id].push(message);
  },

  onIceCandidate(event) {
    if (event.candidate) {
      // Send ICE candidate to remote peer
      this.dataChannels.forEach(dataChannel => dataChannel.send(JSON.stringify({ ice: event.candidate })));
    }
  }
};
