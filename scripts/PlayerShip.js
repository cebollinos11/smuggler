
// PlayerShip.js
import { BaseShip } from './BaseShip.js';
import { UISetShieldHullLevels } from './ui/controller.js';
import { animatePlayerExploding } from './utils/animations.js';
import { ShipStatTemplates,StatType } from './Stats.js'; 
export class PlayerShip extends BaseShip {
 constructor(scene, sprite, x, y,shipdata) {
        super(scene, sprite, x, y, shipdata);
        this.isPlayer = true;
        this.hitBorderWall = false; // Track wall collisions
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
        this.stats[StatType.SHIELD].current  / this.stats[StatType.SHIELD].base  * 100, //max shield
        this.stats[StatType.HULL].current  / this.stats[StatType.HULL].base  * 100, //max hud
        this.stats[StatType.SHIELD].current ,
        this.stats[StatType.SHIELD].base ,
        this.stats[StatType.HULL].current ,
        this.stats[StatType.HULL].base 
        );
    }
}
