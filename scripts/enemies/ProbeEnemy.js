import { BaseEnemy } from './BaseEnemy.js';

export class ProbeEnemy extends BaseEnemy {
    constructor(scene, sprite, x, y, config = {}) {
        super(scene, sprite, x, y, config);
        this.moveSpeed = 200; // Slower than typical enemies
        this.attackType = 'probe'; // Specific attack type for ProbeEnemy
        this.attackConeAngle = 360; // Wider cone for probing
        this.attackRange = 500; // Shorter range for probing
        this.hullLifePoints = 1; // Minimal hull points for a probe
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
