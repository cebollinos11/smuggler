
/**
 * Repositions turrets so that each one sits on the edge of the closest asteroid to a random coin.
 * Ensures only one turret per asteroid.
 * 
 * @param {Phaser.GameObjects.GameObject[]} enemies - All enemy game objects
 * @param {Phaser.GameObjects.GameObject[]} coins - All coin game objects
 * @param {Phaser.GameObjects.GameObject[]} asteroids - All asteroid game objects
 * @param {number} offset - Extra distance from asteroid edge
 */
export function repositionTurrets(enemies, coins, asteroids, offset = 70) {
    if (!enemies?.length || !coins?.length || !asteroids?.length) return;

    const turrets = enemies.filter(e => e.getData("controller").stats?.isTurret);
    if (turrets.length === 0) return;

    const availableAsteroids = [...asteroids]; // Copy to track usage
    Phaser.Utils.Array.Shuffle(turrets); // Randomize turret order

    for (let turret of turrets) {
        if (coins.length === 0 || availableAsteroids.length === 0) break;

        // Pick a random coin
        const coin = Phaser.Utils.Array.GetRandom(coins);

        // Find closest asteroid to that coin
        let closestAsteroid = null;
        let closestDist = Infinity;
        for (let asteroid of availableAsteroids) {
            const dist = Phaser.Math.Distance.Between(coin.x, coin.y, asteroid.x, asteroid.y);
            if (dist < closestDist) {
                closestDist = dist;
                closestAsteroid = asteroid;
            }
        }
        if (!closestAsteroid) continue;

        // Calculate position on asteroid border
        const angleToCoin = Phaser.Math.Angle.Between(
            closestAsteroid.x, closestAsteroid.y, 
            coin.x, coin.y
        );
        const asteroidRadius = (closestAsteroid.body?.circle?.radius || 64);
        const turretX = closestAsteroid.x + Math.cos(angleToCoin) * (asteroidRadius + offset);
        const turretY = closestAsteroid.y + Math.sin(angleToCoin) * (asteroidRadius + offset);

        // Apply new position & rotation
        turret.setPosition(turretX, turretY);
        turret.setRotation(angleToCoin);

        // Mark asteroid as used
        Phaser.Utils.Array.Remove(availableAsteroids, closestAsteroid);
    }
}
