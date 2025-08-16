import { SoundManager } from '../scripts/SoundManager.js';
import { GameState, GameStateC } from '../scripts/GameState.js';  
import { ShipStatTemplates,createShipStats } from '../scripts/Stats.js';
export class BootScene extends Phaser.Scene {
  preload() {
    // === Create loading bar ===
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    }).setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    }).setOrigin(0.5, 0.5);

    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 30,
      text: '',
      style: {
        font: '16px monospace',
        fill: '#aaaaaa'
      }
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(parseInt(value * 100) + '%');
    });

    this.load.on('fileprogress', (file) => {
      assetText.setText(`${file.key} → ${file.src}`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    // === Assets ===
    // Music
    // this.load.audio('bgm', 'assets/sound/music/flesh.mp3');
    // this.load.audio('bgm_gameplay', 'assets/sound/music/nebulae.mp3');
    // this.load.audio('bgm', 'assets/sound/music/TERMINATOR.mp3');
    
        this.load.audio('bgm', 'assets/sound/music/PabloMenuLoop.mp3');



    // UI
    this.load.audio('click', 'assets/sound/sfx/click.wav');

    // SFX - Gameplay
    this.load.audio('hit_asteroid', 'assets/sound/sfx/asteroid_hit.mp3');
    this.load.audio('aim', 'assets/sound/sfx/aim.mp3');
    this.load.audio('miss', 'assets/sound/sfx/810307__moodyfingers__click-sfx-acquire.flac');
    this.load.audio('hit_ship', 'assets/sound/sfx/244983__ani_music__ani-big-pipe-hit.wav');
    this.load.audio('double_damage', 'assets/sound/sfx/701702__stavsounds__laser-charge.wav');
    this.load.audio('shield_hit', 'assets/sound/sfx/385051__mortisblack__shield.ogg');
    this.load.audio('hull_hit', 'assets/sound/sfx/95078__sandyrb__the-crash.wav');
    this.load.audio('ship_destroyed', 'assets/sound/sfx/587445__samsterbirdies__explosion-gun.flac');
    this.load.audio('turn', 'assets/sound/sfx/350863__cabled_mess__blip_c_03.wav');
    this.load.audio('keypress', 'assets/sound/sfx/keypress.mp3');
    this.load.audio('flip_switch', 'assets/sound/sfx/278204__ianstargem__switch-flip-2.wav');
    this.load.audio('coin_collect', 'assets/sound/sfx/200462__wubitog__tractor-beam-power-generator.wav');
    this.load.audio('warp', 'assets/sound/sfx/220193__gameaudio__teleport-spacey.wav');

    this.load.spritesheet('explosion', 'assets/exp2.jpg', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image('ship', 'assets/playership.png');
    this.load.image('playable_ozzy', 'assets/playableships/ozzy.png');
    this.load.image('playable_needle', 'assets/playableships/needle.png');
    this.load.image('playable_ball', 'assets/playableships/ball.png');



    this.load.image('asteroid256', 'assets/asteroid256.png');
    this.load.image('coin', 'assets/astronaut.png');
    this.load.image('escape', 'assets/blackhole.png');
    this.load.image('reticle', 'assets/reticle.png');
    this.load.image('shieldhit', 'assets/spr_shield_64.png');
    this.load.image('enemy_probe', 'assets/enemies/enemy_probe.png');
    this.load.image('enemy_kamikaze', 'assets/enemies/destroyer.png');
    this.load.image('enemy_viper', 'assets/enemies/enemy_viper.png');
    this.load.image('enemy_basic_turret', 'assets/enemies/basic_turret.png');
    this.load.image('enemy_ghost', 'assets/enemies/enemy_ghost.png');
    this.load.image('enemy_deathstar', 'assets/enemies/enemy_deathstar.png');
    this.load.image('enemy_carrier', 'assets/enemies/enemy_carrier.png');
    this.load.image('enemy_mine', 'assets/enemies/enemy_mine.png');
    this.load.image('enemy_turret', 'assets/enemies/enemy_turret.png');
    this.load.image('enemy_advanced_viper', 'assets/enemies/enemy_advanced_viper.png');
    this.load.image('enemy_dreadnoght', 'assets/enemies/enemy_dreadnoght.png');

    this.load.image('pivot', 'assets/reticle.png');

    //backgrounds
    this.load.image('background', 'assets/background0.png');
    this.load.image('hangar0', 'assets/scenes/hangar0.png');

  }

  create() {
    this.game.soundManager = new SoundManager(this); // Initialize singleton
    //initialize player ship
    GameState.reset(); // Reset game state
    GameState.shipData = createShipStats(ShipStatTemplates.standard);
    //this.scene.start('SelectShipScene');
    // this.scene.start('SelectMissionScene');
     this.scene.start("SelectLevelScene");

  }
}
