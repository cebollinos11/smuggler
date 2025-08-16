import { generateLevel } from '../scripts/utils/levelgenerator.js'; // Import the level generator
import {proceduralLevels} from "../config/LevelGenerationConfig.js"
import { GameState } from '../scripts/GameState.js';

export default class SelectLevelScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SelectLevelScene' });
  }

  preload() {
    this.load.json('levelList', 'leveldata/levelList.json');
    this.load.image('background', 'assets/background0.png'); // 👈 Make sure this path is correct

  }

  create() {

      this.background = this.add.tileSprite(
      0, 0,
      this.scale.width, this.scale.height,
      'background'
    ).setOrigin(0);

    const ui = document.getElementById('ui-levelselect');
    const buttonContainer = document.getElementById('level-buttons');

    if (!ui || !buttonContainer) return;

    ui.style.display = 'block';
    buttonContainer.innerHTML = '';

// Generate buttons for each predefined procedural level
proceduralLevels.forEach(level => {
  this.createHtmlButton({
    title: level.title,
    createdby: level.createdby,
    difficulty: level.difficulty,
    onClick: () => {
      const levelData = generateLevel(level.config);
      ui.style.display = 'none';
      this.scene.start('SpaceScene', { levelData });
    }
  });
});



    const levelFiles = this.cache.json.get('levelList');

    // Load each level file dynamically and generate buttons
    this.loadLevelMetadata(levelFiles).then(levels => {
      levels.forEach(({ filename, data }) => {
        this.createHtmlButton({
          title: data.title || filename,
          createdby: data.createdby || 'Unknown',
          difficulty: data.difficulty || 'Unknown',
          onClick: () => {
            ui.style.display = 'none';
            this.scene.start('SpaceScene', { levelData: data });
          }
        });
      });
    });

    //add level editor
        this.createHtmlButton({
          title: "level editor",
          createdby: "devs",
          difficulty: "devs",
          onClick: () => {
            ui.style.display = 'none';
            this.scene.start('EditorScene', { });
          }
        });

            //ship select
        this.createHtmlButton({
          title: "Select ship",
          createdby: "devs",
          difficulty: "devs",
          onClick: () => {
            ui.style.display = 'none';
            this.scene.start('SelectShipScene', { });
          }
        });

        // Inside create() in SelectLevelScene, after other buttons:
this.createHtmlButton({
  title: "Upgrades",
  createdby: "devs",
  difficulty: "-",
  onClick: () => {
    ui.style.display = 'none';
    this.scene.start('UpgradeScene', {
      previousScene: 'SelectLevelScene', // store where we came from
    });
  }
});

        // Inside create() in SelectLevelScene, after other buttons:
this.createHtmlButton({
  title: "Start Roguelike Mode",
  createdby: "-",
  difficulty: "-",
  onClick: () => {
    GameState.reset(); // Reset game state
    ui.style.display = 'none';
    this.scene.start('SelectShipScene', {
      previousScene: 'SelectMissionScene', // store where we came from
    });
  }
});


        //play bgm


    this.game.soundManager.playMusic('bgm');
    
    this.input.on('pointerdown', () => {
      this.game.soundManager.playSFX('click');
    });
  }

  async loadLevelMetadata(files) {
    const results = await Promise.all(
      files.map(filename =>
        fetch(`leveldata/${filename}`)
          .then(res => res.json())
          .then(data => ({ filename, data }))
          .catch(() => null)
      )
    );
    return results.filter(entry => entry);
  }

    update() {
    // 🌠 Scroll background slowly to the left
    if (this.background) {
      this.background.tilePositionX += 0.1;
    }
  }


  createHtmlButton({ title, createdby, difficulty, onClick }) {
    const container = document.getElementById('level-buttons');
    const btn = document.createElement('button');
    btn.innerHTML = `
      <strong>${title}</strong><br>
      <small>by ${createdby} — ${difficulty}</small>
    `;
    btn.onclick = onClick;
    container.appendChild(btn);
  }
}
