import { generateLevel } from '../scripts/utils/levelgenerator.js'; // Import the level generator
import { SoundManager } from '../scripts/SoundManager.js';


export default class SelectLevelScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SelectLevelScene' });
  }

  preload() {
    this.load.json('levelList', '../leveldata/levelList.json');
    this.load.image('background', '../assets/background0.png'); // 👈 Make sure this path is correct

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

    // "Generate Random Level" button
    this.createHtmlButton({
      title: 'Generate Random Level',
      createdby: 'Game Engine',
      difficulty: '???',
      onClick: () => {
  const randomLevel = generateLevel({
    width: 3000,
    height: 3000,
    asteroidCount: 60,
    coinCount: 3,
    enemyCount: 5,
    minEnemyDistance: 150,
    minCoinDistance: 50
  });

  ui.style.display = 'none';
  this.scene.start('SpaceScene', { levelData: randomLevel });
}
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

        //play bgm


    this.game.soundManager.playMusic('bgm');
    
    this.input.on('pointerdown', () => {
      this.game.soundManager.playSFX('click');
    });
  }

  async loadLevelMetadata(files) {
    const results = await Promise.all(
      files.map(filename =>
        fetch(`../leveldata/${filename}`)
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
