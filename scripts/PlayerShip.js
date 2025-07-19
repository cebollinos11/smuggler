
// PlayerShip.js
import { BaseShip } from './BaseShip.js';
import { UISetShieldHullLevels } from './ui/controller.js';
import { animatePlayerExploding } from './utils/animations.js';
export class PlayerShip extends BaseShip {
    constructor(scene, sprite, x, y, config = {}) {
        super(scene, sprite, x, y, config);
        this.isPlayer = true;
        this.attackConeAngle = 90; // Wider cone for probing
        this.attackRange = 500; // Shorter range for probing
        this.moveSpeed = 100;
        this.hitBorderWall = false; // Flag to track if the ship has hit a border wall
        this.shieldLevel = 100; // Starting shield level
        this.damageOutput = 50; // Damage output for the player ship
    }

    onHitBorderWall() {
        if(this.hitBorderWall) return; // Prevent multiple hits in the same turn
        this.hitBorderWall = true; // Set the flag to true to prevent further hits this   
        
    }

    destroy() {        
        console.log("Player ship destroyed");        
    }
    takeDamage(amount)
    {
        super.takeDamage(amount);
        this.updateUI();
    }

    updateUI()
    {
        UISetShieldHullLevels(
        this.shieldLevel / 100 * 100, //max shield
        this.hullLifePoints / 100 * 100, //max hud
        this.shieldLevel,
        100,
        this.hullLifePoints,
        100
        );
    }
}
