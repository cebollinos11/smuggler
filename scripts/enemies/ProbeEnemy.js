import { BaseEnemy } from './BaseEnemy.js';
import {EnemyShipTemplates,createShipStats,StatType} from '../Stats.js';


export class ProbeEnemy extends BaseEnemy {
    constructor(scene, sprite, x, y, data) {
        super(scene, sprite, x, y, createShipStats(data));
    }

    async updateBehavior() {
        
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = this.stats[StatType.MAXSPEED].base;
        const targetX = this.sprite.x + Math.cos(angle) * distance;
        const targetY = this.sprite.y + Math.sin(angle) * distance;

        await new Promise(resolve => {
            this.scene.tweens.add({
                targets: this.sprite,
                x: targetX,
                y: targetY,
                duration: 300,
                onComplete: resolve,
            });
        });
    }
}
