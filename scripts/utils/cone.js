import { RENDER_LAYERS } from './rendering.js';
export function initDrawCone(scene) {
    // Create the graphics object if it doesn't exist
    scene.coneGraphics = scene.add.graphics();

    // Optional: assign a depth layer
    scene.coneGraphics.setDepth(RENDER_LAYERS.ABOVE_PLAYER);

    // Ensure cleanup on shutdown (like when restarting scene)
    scene.events.on('shutdown', () => {
        if (scene.coneGraphics) {
            scene.coneGraphics.destroy();
            scene.coneGraphics = null;
        }
    });

    // Also cleanup on destroy (if the scene is being removed entirely)
    scene.events.on('destroy', () => {
        if (scene.coneGraphics) {
            scene.coneGraphics.destroy();
            scene.coneGraphics = null;
        }
    });
}

export function cleanCone(scene) {
    if (scene.coneGraphics && !scene.coneGraphics.destroyed) {
        scene.coneGraphics.clear();
    }
}

export function drawConePreview(scene, originX, originY, shipAngle, range, coneAngle) {
    if (!scene.coneGraphics || scene.coneGraphics.destroyed) {
        console.warn('drawConePreview called before initDrawCone. Call initDrawCone(scene) first.');
        return;
    }

    scene.coneGraphics.clear();

    const isFullCircle = Math.abs(coneAngle - 360) < 0.01;
    const shipAngleRad = Phaser.Math.DegToRad(shipAngle);

    if (isFullCircle) {
        // Fill
        scene.coneGraphics.fillStyle(0xff0000, 0.2);
        scene.coneGraphics.beginPath();
        scene.coneGraphics.arc(originX, originY, range, 0, Phaser.Math.PI2);
        scene.coneGraphics.fillPath();

        // Outline
        scene.coneGraphics.lineStyle(3, 0xff0000, 0.5);
        scene.coneGraphics.strokeCircle(originX, originY, range);
    } else {
        const halfAngle = coneAngle / 2;
        const startAngle = shipAngleRad - Phaser.Math.DegToRad(halfAngle);
        const endAngle = shipAngleRad + Phaser.Math.DegToRad(halfAngle);

        // Fill
        scene.coneGraphics.fillStyle(0xff0000, 0.2);
        scene.coneGraphics.slice(originX, originY, range, startAngle, endAngle, false);
        scene.coneGraphics.fillPath();

        // Outline
        scene.coneGraphics.lineStyle(3, 0xff0000, 0.5);
        scene.coneGraphics.beginPath();
        scene.coneGraphics.moveTo(originX, originY);
        scene.coneGraphics.arc(originX, originY, range, startAngle, endAngle, false);
        scene.coneGraphics.lineTo(originX, originY);
        scene.coneGraphics.closePath();
        scene.coneGraphics.strokePath();
    }
}

