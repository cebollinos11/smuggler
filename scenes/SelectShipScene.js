import { ShipStatTemplates, createShipStats, StatDefaults,StatType } from '../scripts/Stats.js';
import { GameState } from '../scripts/GameState.js'; // your GameState file
import { initDrawCone, drawConePreview } from '../scripts/utils/cone.js';

export class SelectShipScene extends Phaser.Scene {
constructor() {
  super({ key: 'SelectShipScene' });
  this.selectedShipKey = 'standard'; 
  this.isDragging = false; 
  this.lastPointerPosition = new Phaser.Math.Vector2();
  this.previousStatPercents = {};  // Store previous stat bar percents
}

getColorForPercent(pct) {
  // pct is 0 to 100
  // We'll interpolate red -> yellow -> green
  if (pct < 50) {
    // red to yellow
    const r = 255;
    const g = Math.round(77 + (pct / 50) * (210 - 77)); // from 77 to 210
    return `rgb(${r},${g},77)`; // red to yellow
  } else {
    // yellow to green
    const g = 210;
    const r = Math.round(255 - ((pct - 50) / 50) * 255); // from 255 to 0
    return `rgb(${r},${g},77)`; // yellow to green
  }
}


create() {
  this.shipSprites = [];
  initDrawCone(this);
  //background
   const bgimage = this.add.image(0, 0, 'hangar0').setScale(1).setDepth(-1);

  // Grid config
  const cols = 5;
  const rows = 2;
  const spacingX = 70; // horizontal spacing
  const spacingY = 221; // vertical spacing
  const originX = -bgimage.width/2*0.69; // center the grid
  const originY = -bgimage.height/2*0.53;

  let index = 0;
  const shipKeys = Object.keys(ShipStatTemplates);
  const totalSlots = cols * rows;

  for (let i = 0; i < totalSlots; i++) {
    let col = i % cols;
    let row = Math.floor(i / cols);
    let x = originX + col * spacingX;
    let y = originY + row * spacingY;

    let sprite;
    if (i < shipKeys.length) {
      // Real ship
      let shipKey = shipKeys[i];
      let ship = ShipStatTemplates[shipKey];

      sprite = this.add.sprite(x, y, ship.image)
        .setInteractive({ useHandCursor: true })
        .setScale(1);
      sprite.angle = -90;
      sprite.shipKey = shipKey;
      sprite.on('pointerdown', () => {
        this.game.soundManager.playSFX('click');
        this.selectShip(shipKey);
      }); 
    } else {
      // Placeholder
      sprite = this.add.rectangle(x, y, 64, 64, 0xffffff).setAlpha(0.5)
        .setStrokeStyle(2, 0x000000); // white square with black border
      let text = this.add.text(x, y, "Coming Soon", {
        fontSize: "12px",
        color: "#000",
        align: "center",
        wordWrap: { width: 70 }
      }).setOrigin(0.5);
    }

    this.shipSprites.push(sprite);
  }



  const targetShipWidth = this.scale.width * 0.05; // 5% of viewport width
        const zoom = targetShipWidth / 64; // 64 = ship original width
        this.cameras.main.setZoom(zoom);  


  this.calculateMaxStats();

  this.selectShip(this.selectedShipKey);

  // Confirm button
  document.getElementById('confirmBtn').addEventListener('click', () => {
    const finalShipStats = createShipStats(ShipStatTemplates[this.selectedShipKey]);
    GameState.shipData = finalShipStats;
    document.getElementById('statsPanel').style.display = 'none';
    this.scene.start('SelectLevelScene');
  });

  document.getElementById('statsPanel').style.display = 'block';

  // Camera panning
  this.input.on('pointerdown', (pointer) => {
    this.isDragging = true;
    this.lastPointerPosition.x = pointer.x;
    this.lastPointerPosition.y = pointer.y;
  });

  this.input.on('pointerup', () => {
    this.isDragging = false;
  });

  this.input.on('pointermove', (pointer) => {
    if (!this.isDragging) return;
    const dx = pointer.x - this.lastPointerPosition.x;
    const dy = pointer.y - this.lastPointerPosition.y;
    this.cameras.main.scrollX -= dx / this.cameras.main.zoom;
    this.cameras.main.scrollY -= dy / this.cameras.main.zoom;
    this.lastPointerPosition.x = pointer.x;
    this.lastPointerPosition.y = pointer.y;
  });
}

calculateMaxStats() {
  this.maxStats = {};
  const shipKeys = Object.keys(ShipStatTemplates);

  // Initialize max stats to 0
  for (let stat in StatDefaults) {
    this.maxStats[stat] = 0;
  }

  // Find max for each stat
  for (let shipKey of shipKeys) {
    let stats = createShipStats(ShipStatTemplates[shipKey]);
    for (let stat in stats) {
      if (stats[stat].base > this.maxStats[stat]) {
        this.maxStats[stat] = stats[stat].base;
      }
    }
  }
}


selectShip(shipKey) {

  this.selectedShipKey = shipKey;
  let shipStats = createShipStats(ShipStatTemplates[shipKey]);

  document.getElementById('shipName').innerText = shipKey.charAt(0).toUpperCase() + shipKey.slice(1);

  const barMaxWidth = 150; // px

  let statsHTML = '';
  for (let stat in StatDefaults) {
    let value = shipStats[stat].base;
    // We set width to previous width or 0 if first time
    let prevPercent = this.previousStatPercents[stat] || 0;

    statsHTML += `
      <div style="margin-bottom: 8px;">
        <strong>${shipStats[stat].displayName}:</strong> ${value}
        <div class="stat-bar-container" style="
          background: #444;
          width: ${barMaxWidth}px;
          height: 14px;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 4px;
        ">
          <div class="stat-bar" data-stat="${stat}" style="
            background: #0f0;
            width: ${prevPercent}%;
            height: 100%;
            transition: width 0.6s ease;
          "></div>
        </div>
      </div>
    `;
  }

  document.getElementById('statsList').innerHTML = statsHTML;

  // Animate bars from previous percent to new percent
  for (let stat in StatDefaults) {
    let value = shipStats[stat].base;
    let max = this.maxStats[stat] || 1;
    let newPercent = (value / max) * 100;

    const bar = document.querySelector(`.stat-bar[data-stat="${stat}"]`);
    if (bar) {
      // Trigger the animation on next tick
      setTimeout(() => {
        bar.style.width = `${newPercent}%`;
        bar.style.backgroundColor = this.getColorForPercent(newPercent);
      }, 50);

      // Update stored previous percent for next time
      this.previousStatPercents[stat] = newPercent;
    }
  }

  // Move reticle over selected ship
  let selectedSprite = this.shipSprites.find(s => s.shipKey === shipKey);
  if (selectedSprite) {


    this.cameras.main.pan(
      selectedSprite.x,
      selectedSprite.y,
      500,
      'Sine.easeInOut'
    );
  }

    // Draw aim cone using ship's attack stats
  const attackRange = shipStats[StatType.ATTACK_RANGE].base;
  const attackAngle = shipStats[StatType.ATTACK_ANGLE].base;

  selectedSprite = this.shipSprites.find(s => s.shipKey === shipKey);
  if (selectedSprite) {
    drawConePreview(
      this,
      selectedSprite.x,
      selectedSprite.y,
      -90,           // shipAngle in degrees; defaulting to 90 (up)
      attackRange,
      attackAngle
    );
  }

}





}

