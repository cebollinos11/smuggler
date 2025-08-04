
import { FighterEnemy } from './FighterEnemy.js';
import {EnemyShipTemplates,createShipStats} from '../Stats.js';
export class ViperEnemy extends FighterEnemy {
    constructor(scene, sprite, x, y) {
        super(scene, sprite, x, y,createShipStats(EnemyShipTemplates.viper));
    }
}