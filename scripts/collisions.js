// scripts/collisions.js
import { RENDER_LAYERS } from './utils/rendering.js';
import { GameState } from './GameState.js';
import { flashSprite } from './utils/combat.js';

export function onShipCoinCollision(scene, ship, coin) {
    // Disable collisions
    coin.body.enable = false;
    //play sound
    scene.game.soundManager.playSFX("coin_collect");
    // Bring coin to top (in case it's under something)
    coin.setDepth(100);

    // Tween to move the coin to the ship and shrink it
    scene.tweens.add({
        targets: coin,
        x: ship.x,
        y: ship.y,
        scale: 0,
        duration: 300, // duration in ms
        ease: 'Power1',
        onComplete: () => {
            coin.destroy();
            console.log("Coin collected!");
            GameState.run.currentMission.progress.addCoins();
            flashSprite(scene, ship, 3, 100,0x1de938ff); // Flash the ship to indicate coin collection
        }
    });
}

export function onShipAsteroidCollision(scene, ship, asteroid) {
    if (scene.hasCollidedThisTurn.has(asteroid)) return;
    scene.hasCollidedThisTurn.add(asteroid);
    ship.getData('controller').takeDamage(10*scene.prevThrust); // Assuming ship has a takeDamage method

    scene.tweens.add({
        targets: ship,
        alpha: 0,
        yoyo: true,
        repeat: 5,
        duration: 100,
        onComplete: () => {
            ship.setAlpha(1); // Reset alpha after flashing
        }
    });
}

export function onShipBorderCollision(scene, ship, wall) {
    if (scene.hasCollidedThisTurn.has(wall)) return;
    scene.hasCollidedThisTurn.add(wall);
    console.log("Ship has hit a border wall!");
    //get ships controller
    ship.getData('controller').onHitBorderWall(); // Call the ship's method to handle border collision
}

// export function onShipExitcollision(scene, ship, exit) {
//     if (scene.hasCollidedThisTurn.has(exit)) return;
//     scene.hasCollidedThisTurn.add(exit);
//     // Check if the ship is close enough to the exit
//     if (scene.prevThrust < 2) {
//         console.log("Ship has exited the level!");
//         // Trigger level completion logic here
//         // scene.scene.start('NextLevelScene'); // Replace with your next level scene
//     } else {
//         console.log("Ship is too fast");
//     }
// }
