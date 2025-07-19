export function handleBorderPivots(scene, borderPivots) {
    // Remove duplicate pivot points (by x and y coordinates, with a small tolerance)
    const tolerance = 0.1;
    const uniquePivots = [];

    borderPivots.forEach(pivot => {
        const alreadyExists = uniquePivots.some(existing =>
            Math.abs(existing.x - pivot.x) < tolerance &&
            Math.abs(existing.y - pivot.y) < tolerance
        );
        if (!alreadyExists) {
            uniquePivots.push(pivot);
        }
    });

    // Create a physics group for the laser walls
    scene.laserWalls = scene.physics.add.staticGroup();        
    const spheres = [];

    // Step 1: Place white spheres at pivot points
    uniquePivots.forEach(pivot => {
        const sphere = scene.add.circle(pivot.x, pivot.y, 8, 0xffffff);
        scene.physics.add.existing(sphere, true); // Static body
        sphere.body.setCircle(8);
        spheres.push({ pivot, obj: sphere });
    });

    // Step 2: For each sphere, connect to its 2 closest neighbors
    for (let i = 0; i < spheres.length; i++) {
        const current = spheres[i];
        const distances = [];

        for (let j = 0; j < spheres.length; j++) {
            if (i === j) continue;
            const other = spheres[j];
            const dx = current.pivot.x - other.pivot.x;
            const dy = current.pivot.y - other.pivot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            distances.push({ other, dist });
        }

        distances.sort((a, b) => a.dist - b.dist);
        const closestTwo = distances.slice(0, 2);

        // Draw laser wall between current and each of the closest two
        closestTwo.forEach(({ other }) => {
            const x1 = current.pivot.x;
            const y1 = current.pivot.y;
            const x2 = other.pivot.x;
            const y2 = other.pivot.y;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const length = Phaser.Math.Distance.Between(x1, y1, x2, y2);
            const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);

            const isVertical = Math.abs(x1 - x2) < Math.abs(y1 - y2);
            const width = isVertical ? 4 : length;
            const height = isVertical ? length : 4;

            const laser = scene.add.rectangle(midX, midY, width, height, 0xff0000);
            scene.physics.add.existing(laser, true);
            scene.laserWalls.add(laser);

        });
    }
}
