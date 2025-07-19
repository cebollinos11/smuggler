// BaseEnemy.js
import { BaseShip } from '../BaseShip.js';
import { RENDER_LAYERS } from '../utils/rendering.js';

export class BaseEnemy extends BaseShip {
    constructor(scene, sprite, x, y, config) {
        super(scene, sprite, x, y, config);
        sprite.setDepth(RENDER_LAYERS.ENEMY); // Set a default depth for the enemy
    }

    async updateBehavior(playerX, playerY,playerAngle) {

    }


}
