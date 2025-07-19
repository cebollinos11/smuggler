import {delay} from './timing.js';
import {RENDER_LAYERS} from './rendering.js';

/**
 * Flashes a sprite a given number of times.
 * @param {Phaser.Scene} scene 
 * @param {Phaser.GameObjects.Sprite} sprite 
 * @param {number} count 
 * @param {number} duration 
 */
export async function flashSprite(scene, sprite, count = 3, duration = 100, flashColor = 0xffffff) {
    for (let i = 0; i < count; i++) {
        sprite.setTintFill(flashColor);
        await delay(scene, duration);
        sprite.clearTint();
        await delay(scene, duration);
    }
}

/**
 * Shoots a laser beam from one point to another.
 * @param {Phaser.Scene} scene 
 * @param {{x: number, y: number}} from 
 * @param {{x: number, y: number}} to 
 * @param {number} duration 
 * @param {number} [color=0xff0000]
 * @param {number} [thickness=4]
 * @returns {Promise<void>}
 */
export async function shootLaser(scene, from, to, duration = 200, color = 0xff0000, thickness = 4) {
    const laser = scene.add.graphics();
    laser.setDepth(RENDER_LAYERS.ABOVE_PLAYER); // Ensure laser is above everything else
    laser.lineStyle(thickness, color, 1);
    laser.beginPath();
    laser.moveTo(from.x, from.y);
    laser.lineTo(to.x, to.y);
    laser.strokePath();

    await delay(scene, duration);
    laser.destroy();
}

export async function animateShipAiming(scene,shooter,target,options={}) {
    const {
        flashCount = 3,
        flashDuration = 100,
        laserDuration = 200,
        explodeOnHit = true,
    } = options;
    flashReticle(scene, target);
    await flashSprite(scene, shooter, flashCount, flashDuration);
}

export async function animateShipShooting(scene, shooter, target, options = {}) {
    const {
        flashCount = 3,
        flashDuration = 100,
        laserDuration = 200,
        explodeOnHit = true,
    } = options;
    
    await shootLaser(scene, shooter, target, laserDuration);    
}

export async function flashReticle(scene, target, flashCount = 3) {
    const reticle = scene.add.sprite(target.x, target.y, 'reticle')
        .setOrigin(0.5)
        .setAlpha(1)
        .setDepth(1000); // On top


    // Flash the reticle
    for (let i = 0; i < flashCount; i++) {
        reticle.setAlpha(1);
        await delay(scene, 100);
        reticle.setAlpha(0);
        await delay(scene, 100);
    }

    reticle.destroy();
}
