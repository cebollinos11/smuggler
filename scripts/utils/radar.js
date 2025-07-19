import { RENDER_LAYERS } from "./rendering.js";

export class Radar {
  constructor(scene, player, radarLayer) {
    this.scene = scene;
    this.player = player;
    this.radarLayer = radarLayer || scene.add.graphics();
    this.radarLayer.setDepth(RENDER_LAYERS.ABOVE_PLAYER);
    
    // Configurable radar settings
    this.config = {
      radius: 350,
      colors: {
        enemy: 0xff0000,
        coin: 0xffff00,
        exit: 0x00aaff
      },
      blipRadius: 5,
      lineWidth: 2,
      minAlpha: 0.2
    };
  }

  disableRadar() {
    this.scene.isRadarEnabled = false;
    this.radarLayer.clear();
  }

  update(enemies, coins, exit) {
    if(this.scene.isRadarEnabled === false) {
      this.radarLayer.clear();  
        return; // Exit if radar is disabled
    }
    const { x: px, y: py } = this.player;
    const cfg = this.config;
    this.radarLayer.clear();

    // Draw radar background
    this.radarLayer.fillStyle(0x00ffcc, 0.05);
    this.radarLayer.fillCircle(px, py, cfg.radius);
    this.radarLayer.lineStyle(1, 0x00ffcc, 0.2);
    this.radarLayer.strokeCircle(px, py, cfg.radius);

    // Draw dashed line (used for enemies)
    const drawDashedLine = (x1, y1, x2, y2, color) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      let t = 0;
      const dash = 6;
      const gap = 4;

      const alpha = Phaser.Math.Clamp(1 - (len / cfg.radius), cfg.minAlpha, 1);
      this.radarLayer.lineStyle(cfg.lineWidth, color, alpha);

      while (t <= len) {
        const sx = x1 + Math.cos(angle) * t;
        const sy = y1 + Math.sin(angle) * t;
        t += dash;
        const ex = x1 + Math.cos(angle) * Math.min(t, len);
        const ey = y1 + Math.sin(angle) * Math.min(t, len);
        this.radarLayer.beginPath();
        this.radarLayer.moveTo(sx, sy);
        this.radarLayer.lineTo(ex, ey);
        this.radarLayer.strokePath();
        t += gap;
      }
    };

    // Draw fading line
    const drawRadarLine = (target, color) => {
      const dx = target.x - px;
      const dy = target.y - py;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.min(distance, cfg.radius);
      const angle = Math.atan2(dy, dx);
      const tx = px + Math.cos(angle) * clampedDist;
      const ty = py + Math.sin(angle) * clampedDist;

      const alpha = Phaser.Math.Clamp(1 - (distance / cfg.radius), cfg.minAlpha, 1);
      this.radarLayer.lineStyle(cfg.lineWidth, color, alpha);
      this.radarLayer.beginPath();
      this.radarLayer.moveTo(px, py);
      this.radarLayer.lineTo(tx, ty);
      this.radarLayer.strokePath();
    };

    // Draw blip
    const drawBlip = (target, color) => {
      const dx = target.x - px;
      const dy = target.y - py;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.min(distance, cfg.radius);
      const angle = Math.atan2(dy, dx);
      const tx = px + Math.cos(angle) * clampedDist;
      const ty = py + Math.sin(angle) * clampedDist;

      this.radarLayer.fillStyle(color, 0.9);
      this.radarLayer.fillCircle(tx, ty, cfg.blipRadius);
    };

    // Enemies: Dashed red lines + red blips
    enemies.getChildren().forEach(enemy => {
      drawDashedLine(px, py, enemy.x, enemy.y, cfg.colors.enemy);
      drawBlip(enemy, cfg.colors.enemy);
    });

    // Coins: Solid yellow lines + yellow blips
    coins.getChildren().forEach(coin => {
      drawRadarLine(coin, cfg.colors.coin);
      drawBlip(coin, cfg.colors.coin);
    });

    // Exit: Solid blue line + blue blip
    if (exit) {
      drawRadarLine(exit, cfg.colors.exit);
      drawBlip(exit, cfg.colors.exit);
    }
  }
}
