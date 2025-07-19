export class SoundManager {
  static instance;

  /**
   * Initialize the SoundManager. Call once in your main scene (e.g., Boot or Preload).
   * @param {Phaser.Scene} scene - A scene with access to the Sound system.
   */
  static init(scene) {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager(scene);
    }
    return SoundManager.instance;
  }

  constructor(scene) {
    this.scene = scene;
    this.sound = scene.sound;
    this.music = null;
    this.sfx = {};
  }

  /**
   * Play background music by key.
   * @param {string} key - The key of the music loaded via `this.load.audio()`.
   * @param {object} config - Optional config, e.g., { loop: true, volume: 0.5 }
   */
  playMusic(key, config = { loop: true, volume: 0.5 }) {
    if (this.music && this.music.key === key && this.music.isPlaying) {
      return; // Already playing
    }

    if (this.music) {
      this.music.stop();
    }

    this.music = this.sound.add(key, config);
    this.music.play();
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
      this.music = null;
    }
  }

  /**
   * Play a sound effect.
   * @param {string} key - The key of the sound effect.
   * @param {object} config - Optional config, e.g., { volume: 1 }
   */
  playSFX(key, config = { volume: 1 }) {
    const sfxInstance = this.sound.add(key);

    // Apply slight random detune between -100 and +100 cents (~1 semitone)
    const detune = Phaser.Math.Between(-400, 400);
    sfxInstance.setDetune(detune);

    // Apply volume and other settings
    sfxInstance.play(config);

    // Auto-destroy the instance after it finishes playing
    sfxInstance.once('complete', () => {
      sfxInstance.destroy();
    });
  }

  /**
   * Set global volume for music.
   * @param {number} volume - A value between 0 and 1.
   */
  setMusicVolume(volume) {
    if (this.music) {
      this.music.setVolume(volume);
    }
  }

  /**
   * Mute or unmute all sounds.
   * @param {boolean} muted
   */
  setMuted(muted) {
    this.sound.mute = muted;
  }

  /**
   * Get mute status.
   */
  isMuted() {
    return this.sound.mute;
  }
}
