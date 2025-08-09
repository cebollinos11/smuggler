
import { FighterEnemy } from './FighterEnemy.js';
import {EnemyShipTemplates,createShipStats} from '../Stats.js';
export class ViperEnemy extends FighterEnemy {
    constructor(scene, sprite, x, y, data) {
        super(scene, sprite, x, y,createShipStats(data));
    }
}