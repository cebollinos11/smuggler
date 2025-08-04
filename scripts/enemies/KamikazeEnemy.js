import { BaseEnemy } from './BaseEnemy.js';
import { ViperEnemy } from './ViperEnemy.js';
import {EnemyShipTemplates,createShipStats} from '../Stats.js';
export class KamikazeEnemy extends ViperEnemy {
    constructor(scene, sprite, x, y) {
        super(scene, sprite, x, y,createShipStats(EnemyShipTemplates.destroyer));     


    }
}
