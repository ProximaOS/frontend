const Music = {
  audioContext: new AudioContext(),
  source: null,
  buffer: null,
  playing: false,
  currentTime: 0,
  
  loadMusic: async function(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.buffer = audioBuffer;
  },
  
  playMusic: function(loop = true) {
    this.stopMusic();
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = loop;
    this.source.connect(this.audioContext.destination);
    this.source.start(0, this.currentTime);
    this.playing = true;
  },
  
  pauseMusic: function() {
    if (this.source) {
      this.currentTime = this.audioContext.currentTime - this.source.startTime;
      this.source.stop();
      this.playing = false;
    }
  },
  
  stopMusic: function() {
    if (this.source) {
      this.currentTime = 0;
      this.source.stop();
      this.playing = false;
    }
  },
  
  changeMusic: async function(url) {
    await this.loadMusic(url);
    this.playMusic();
  },
  
  playFromTime: function(time) {
    if (this.source) {
      this.currentTime = time;
      this.source.stop();
      this.playMusic();
    }
  }
};
