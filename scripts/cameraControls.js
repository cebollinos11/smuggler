export function setupCameraControls(scene) {
    scene.panLocked = false;
    scene.isDragging = false;
    scene.dragStartPoint = new Phaser.Math.Vector2();
    scene.cameraStartScroll = new Phaser.Math.Vector2();

    const cam = scene.cameras.main;
    scene.input.on('pointerdown', (pointer) => {
        if (scene.panLocked) return;
        if (pointer.rightButtonDown() || pointer.middleButtonDown() || pointer.leftButtonDown()) {
            scene.isDragging = true;
            cam.stopFollow();
            scene.dragStartPoint.set(pointer.x, pointer.y);
            scene.cameraStartScroll.set(cam.scrollX, cam.scrollY);
        }
    });

    scene.input.on('pointerup', () => {
        scene.isDragging = false;
    });

    scene.input.on('pointermove', (pointer) => {
        if (scene.isDragging && !scene.panLocked) {
            const dragX = pointer.x - scene.dragStartPoint.x;
            const dragY = pointer.y - scene.dragStartPoint.y;
            cam.scrollX = scene.cameraStartScroll.x - dragX / cam.zoom;
            cam.scrollY = scene.cameraStartScroll.y - dragY / cam.zoom;
        }
    });

    scene.input.keyboard.on('keydown-R', () => {
        scene.resetCameraToShip();
    });
}

export async function resetCameraToShip(scene) {
    const cam = scene.cameras.main;
    const threshold = 20;
    const distX = Math.abs(cam.midPoint.x - scene.ship.sprite.x);
    const distY = Math.abs(cam.midPoint.y - scene.ship.sprite.y);
    let duration = 600;

    if (distX <= threshold && distY <= threshold) {
        duration = 10;
    }

    cam.stopFollow();
    cam.pan(scene.ship.sprite.x, scene.ship.sprite.y, duration, 'Sine.easeInOut', true);

    return new Promise((resolve) => {
        cam.once('camerapancomplete', () => {
            cam.startFollow(scene.ship.sprite);
            resolve();
        });
    });
}
