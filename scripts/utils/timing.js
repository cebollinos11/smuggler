
/**
 * Utility delay function using Phaser's delayedCall wrapped in a Promise.
 * @param {Phaser.Scene} scene 
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export function delay(scene, ms) {
    return new Promise(resolve => scene.time.delayedCall(ms, resolve));
}