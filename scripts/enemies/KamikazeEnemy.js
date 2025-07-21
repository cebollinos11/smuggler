import { BaseEnemy } from './BaseEnemy.js';
import { ViperEnemy } from './ViperEnemy.js';

export class KamikazeEnemy extends ViperEnemy {
    constructor(scene, sprite, x, y) {
        super(scene, sprite, x, y);
        this.maxTurnAngle = 180; // degrees
        this.damageOutput = 30; // Higher damage output for Viper
        this.hullLifePoints = 300; // More hull points for Viper

        this.maxMoveDistance = 500; // pixels


        this.attackConeAngle = 120; // Wider cone for probing
        this.attackRange = 500; // Shorter range for probing

        scene.input.keyboard.on('keydown-V', () => {
            this.autopilot(scene);
        });
    }
}
