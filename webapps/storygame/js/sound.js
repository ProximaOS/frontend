const Sound = {
  audioContext: new AudioContext(),
  listener: new THREE.AudioListener(),
  sounds: {},
  maxNumOfSounds: 10,
  soundIndex: 0,

  init: function() {
    Main.scene.add(this.listener);
  },

  loadSound: async function(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  },

  playSound: async function(url, position, volume = 1) {
    const buffer = await this.loadSound(url);
    const sound = new THREE.PositionalAudio(this.listener);
    sound.setBuffer(buffer);
    sound.setRefDistance(10);
    sound.setVolume(volume);
    sound.setRolloffFactor(2);
    sound.setPosition(position.x, position.y, position.z);
    sound.setPlaybackRate(Main.gameSpeed);
    sound.setLoop(false);
    Main.scene.add(sound);
    this.sounds[this.soundIndex] = sound;
    this.soundIndex = (this.soundIndex + 1) % this.maxNumOfSounds;
    sound.play();
  },

  playDialogue: async function(url, text, volume = 1) {
    const buffer = await this.loadSound(url);
    const sound = new THREE.Audio(this.listener);
    sound.setBuffer(buffer);
    sound.setVolume(volume);
    sound.setPlaybackRate(Main.gameSpeed);
    sound.setLoop(false);
    Main.scene.add(sound);
    sound.play();
    alert(text);
  }
};
