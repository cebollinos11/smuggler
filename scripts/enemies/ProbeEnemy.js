import { BaseEnemy } from './BaseEnemy.js';
import {EnemyShipTemplates,createShipStats} from '../Stats.js';


export class ProbeEnemy extends BaseEnemy {
    constructor(scene, sprite, x, y) {
        super(scene, sprite, x, y, createShipStats(EnemyShipTemplates.probe));
    }

    async updateBehavior() {
        
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = 50;
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
