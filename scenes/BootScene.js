import { SoundManager } from '../scripts/SoundManager.js';

export class BootScene extends Phaser.Scene {
  preload() {
    // Music
    this.load.audio('bgm', 'assets/sound/music/flesh.mp3');
    this.load.audio('bgm_gameplay', 'assets/sound/music/nebulae.mp3');

    // UI
    this.load.audio('click', 'assets/sound/sfx/click.wav');

    // SFX - Gameplay
    this.load.audio('hit_asteroid', 'assets/sound/sfx/asteroid_hit.mp3');
    this.load.audio('aim', 'assets/sound/sfx/aim.mp3');                // 🔊 Aiming
    this.load.audio('miss', 'assets/sound/sfx/810307__moodyfingers__click-sfx-acquire.flac');              // 🔊 Missed shot
    this.load.audio('hit_ship', 'assets/sound/sfx/244983__ani_music__ani-big-pipe-hit.wav');      // 🔊 Enemy ship hit
    this.load.audio('double_damage', 'assets/sound/sfx/701702__stavsounds__laser-charge.wav'); // 🔊 Double damage
    this.load.audio('shield_hit', 'assets/sound/sfx/385051__mortisblack__shield.ogg');  // 🔊 Shield hit
    this.load.audio('hull_hit', 'assets/sound/sfx/95078__sandyrb__the-crash.wav');      // 🔊 Hull hit
    this.load.audio('ship_destroyed', 'assets/sound/sfx/587445__samsterbirdies__explosion-gun.flac'); // 🔊 Ship destroyed
    this.load.audio('turn', 'assets/sound/sfx/350863__cabled_mess__blip_c_03.wav');              // 🔊 U-turn
    this.load.audio('keypress', 'assets/sound/sfx/keypress.mp3');              
    this.load.audio('flip_switch', 'assets/sound/sfx/278204__ianstargem__switch-flip-2.wav');              



    // Optionally preload other global assets...
  }

  create() {
    this.game.soundManager = new SoundManager(this); // Initialize singleton
    this.scene.start('SelectLevelScene');
  }
}
