import { RENDER_LAYERS } from './rendering.js';
import { delay } from './timing.js';

export async function createFloatingText(scene,{
    text,
    x,
    y,
    color = '#fff',
    fontSize = '32px',
    fontFamily = 'Arial',
    stroke = '#000',
    strokeThickness = 2,
    padding = { x: 4, y: 2 },
    depth = RENDER_LAYERS.UI,
    origin = 0.5,
    floatDistance = 0,
    duration = 1000,
    scale = 1,
    alpha = 0
}) {
    return new Promise(resolve => {
        const floatingText = scene.add.text(x, y, text, {
            font: `${fontSize} ${fontFamily}`,
            fill: color,
            stroke,
            strokeThickness,
            padding
        })
        .setDepth(depth)
        .setOrigin(origin);

        scene.tweens.add({
            targets: floatingText,
            y: y - floatDistance,
            alpha,
            scale,
            duration,
            onComplete: () => {
                floatingText.destroy();
                resolve();
            }
        });
    });
}

// A reusable blink effect for Phaser GameObjects
export function blink(scene, target, { repeat = 5, duration = 100 } = {}) {
    scene.tweens.add({
        targets: target,
        alpha: 0,
        yoyo: true,
        repeat: repeat,
        duration: duration,
        onComplete: () => {
            target.setAlpha(1); // Ensure alpha is reset
        }
    });
}


export async function animatePlayerExit(scene, ship, exit) {
    scene.game.soundManager.playSFX("warp");

    // Bring exit to top (in case it's under something)

    // Return a Promise that resolves when the tween completes
    await new Promise(resolve => {
        scene.tweens.add({
            targets: ship.sprite,            
            x: exit.x,
            y: exit.y,
            angle: ship.sprite.angle + 380, // Rotate to face the exit
            scale: 0,
            duration: 2000, // duration in ms
            ease: 'Power1',
            onComplete: () => {
                ship.sprite.destroy();
                console.log("Ship has exited the level!");
                resolve(); // resolve the Promise
            }
        });
    });

    // Additional logic (e.g., scene.scene.start('NextLevelScene')) can go here
}

export async function showExplosion(scene,posx,posy)
{
    const explosion = scene.add.sprite(posx, posy, 'explosion').setBlendMode(Phaser.BlendModes.ADD);
    explosion.setScale(2);
    explosion.setDepth(RENDER_LAYERS.ABOVE_PLAYER); // Ensure explosion is above everything else
    explosion.play('explode');
}

export async function showShieldsGettingHit(scene, posx, posy) {
    const sprite = scene.add.image(posx, posy, 'shieldhit').setBlendMode(Phaser.BlendModes.ADD);
    sprite.setDepth(RENDER_LAYERS.ABOVE_PLAYER);
    sprite.setAlpha(1);
    sprite.setScale(1.6);

    const flickerCount = 4;
    let flickerIndex = 0;

    const flicker = () => {
        if (flickerIndex >= flickerCount) {
            // After flickering, do final tween
            scene.tweens.add({
                targets: sprite,
                scale: 2,
                angle: 360,
                alpha: 0,
                duration: 400,
                ease: 'Cubic.easeOut',
                onComplete: () => sprite.destroy()
            });
            return;
        }

        // Flicker out
        scene.tweens.add({
            targets: sprite,
            alpha: 0.3,
            duration: 50,
            yoyo: true,
            ease: 'Linear',
            onComplete: () => {
                flickerIndex++;
                flicker(); // Continue flickering
            }
        });
    };

    flicker(); // Start flickering
}




export async function animatePlayerExploding(scene, ship) {
    const sprite = ship.sprite;
    const originalTint = sprite.tintTopLeft;

    // Step 1: Turn red and spin out of control
    sprite.setTint(0xff0000);
    scene.tweens.add({
        targets: sprite,
        angle: sprite.angle+45,
        y:sprite.y+50,
        duration: 800,
    });

    // await delay(scene, 1000); // Wait for spin

    // Step 2: Multiple explosions around the ship
    const explosionCount = 5;
    const explosionPromises = [];

    for (let i = 0; i < explosionCount; i++) {
        const offsetX = Phaser.Math.Between(-30, 30);
        const offsetY = Phaser.Math.Between(-30, 30);

        const explosion = scene.add.sprite(sprite.x + offsetX, sprite.y + offsetY, 'explosion').setBlendMode(Phaser.BlendModes.ADD);
        explosion.setScale(Phaser.Math.FloatBetween(1, 1.5));
        explosion.setDepth(RENDER_LAYERS.ABOVE_PLAYER);
        explosion.play('explode');

        explosionPromises.push(new Promise(resolve => {
            explosion.on('animationcomplete', () => {
                explosion.destroy();
                resolve();
            });
        }));

        await delay(scene, 150); // slight delay between explosions
    }

    await Promise.all(explosionPromises);

    // Step 3: Turn black and fade
    sprite.setTint(0x000000);
    scene.tweens.add({
        targets: sprite,
        alpha: 0,
        duration: 800,
        onComplete: () => sprite.destroy()
    });

    await delay(scene, 800);

    console.log("Player ship has exploded!");
}
