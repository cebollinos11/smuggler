import { BaseEnemy } from './BaseEnemy.js';
import { ViperEnemy } from './ViperEnemy.js';

export class KamikazeEnemy extends ViperEnemy {
    constructor(scene, sprite, x, y) {
        super(scene, sprite, x, y);
        this.maxTurnAngle = 50; // degrees
        this.damageOutput = 50; // Higher damage output for Viper
        this.hullLifePoints = 110; // More hull points for Viper

        this.maxMoveDistance = 500; // pixels


        this.attackConeAngle = 90; // Wider cone for probing
        this.attackRange = 1000; // Shorter range for probing

        scene.input.keyboard.on('keydown-V', () => {
            this.autopilot(scene);
        });
    }
}
