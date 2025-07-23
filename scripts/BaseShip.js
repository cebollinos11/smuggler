// BaseShip.js
import { delay } from './utils/timing.js';
import { animateShipAiming, animateShipShooting } from './utils/combat.js';
import { RENDER_LAYERS } from './utils/rendering.js';
import { showExplosion, showShieldsGettingHit, createFloatingText } from './utils/animations.js';

export class BaseShip {
    constructor(scene, sprite, x, y, config = {}) {
        this.isPlayer = false;
        this.scene = scene;
        this.sprite = sprite;
        this.sprite.setData('controller', this);

        this.x = x;
        this.y = y;

        // Default ship stats
        this.unitDistance = 100;
        this.moveSpeed = config.moveSpeed || 100;
        this.maxTurningAngle = config.maxTurningAngle || 5;
        this.attackType = config.attackType || 'laser';
        this.attackConeAngle = config.attackConeAngle || 30;
        this.attackRange = config.attackRange || 300;
        this.shieldLevel = config.shieldLevel || 0;
        this.hullLifePoints = config.hullLifePoints || 100;
        this.basehullLifePoints = this.hullLifePoints;
        this.damageOutput = 10;

        // Shields
        this.shieldsEnabled = false;
        this.shieldGraphics = scene.add.graphics({ lineStyle: { width: 2, color: 0x00ffff, alpha: 0.8 } });
        this.shieldGraphics.setDepth(RENDER_LAYERS.PLAYER_VISUALS_BEHIND);

        // Combat modifiers
        this.doubleDEnabled = false;
        this.accurateEnabled = false;
        this.multiTargetEnabled = false;

        //trail
        this.trailing = false;
        this.trailDots = [];
        this.lastTrailPosition = null;

    }

    startTrailing() {
    this.trailing = true;
    this.lastTrailPosition = new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
    

}

stopTrailing() {
    this.trailing = false;
    this.lastTrailPosition = null;    
}

clearTrail(){
// Optional: clear trail visuals
    for (const dot of this.trailDots) {
        dot.destroy();
    }
    this.trailDots = [];
}

updateTrail() {
    if (!this.trailing || !this.lastTrailPosition) return;

    const currentPos = new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
    const distance = Phaser.Math.Distance.BetweenPoints(this.lastTrailPosition, currentPos);

    if (distance >= 10) {
        const dot = this.scene.add.circle(currentPos.x, currentPos.y, 4, 0xffffff)
            .setDepth(this.sprite.depth - 1)
            .setAlpha(1);

        this.trailDots.push(dot);
        this.lastTrailPosition = currentPos.clone();

        // Fade the dot from alpha 1 to 0.2 in 1 second
        this.scene.tweens.add({
            targets: dot,
            alpha: 0.5,
            scale: 0.5,
            duration: 1000,
            ease: 'Linear'
        });
    }
}




    drawShield() {
        this.shieldGraphics.clear();
        if (this.shieldsEnabled) {
            const radius = 40;
            this.shieldGraphics.lineStyle(3, 0x0000ff, 0.2);
            this.shieldGraphics.strokeCircle(this.sprite.x, this.sprite.y, radius);
            this.shieldGraphics.lineStyle(3, 0x00ffff, 0.6);
            this.shieldGraphics.strokeCircle(this.sprite.x, this.sprite.y, radius + radius * 0.2);
        }
    }

    updatePosition() {
        // Override in subclasses
    }

    async takeAttackAction() {
        const enemygroup = this.isPlayer ? this.scene.enemies : { getChildren: () => [this.scene.ship.sprite] };

        this.scene.drawConePreview(this.sprite.x, this.sprite.y, this.sprite.angle, this.attackRange, this.attackConeAngle);

        const result = this.scene.findTargetsInConeRange(this.sprite, enemygroup, this.attackRange, this.attackConeAngle);

        if (result.length > 0) {
            result.sort((a, b) => {
                const distA = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, a.x, a.y);
                const distB = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, b.x, b.y);
                return distA - distB;
            });

            await delay(this.scene, 500);

            if (this.multiTargetEnabled) {
                for (const target of result) {
                    await this.fireWeapon(target);
                }
            } else {
                await this.fireWeapon(result[0]);
            }
        }
    }

    async fireWeapon(target) {
        const { x: sx, y: sy } = this.sprite;
        const { x: tx, y: ty } = target;

        const distanceToTarget = Phaser.Math.Distance.Between(sx, sy, tx, ty);
        const laserLine = new Phaser.Geom.Line(sx, sy, tx, ty);

        const asteroidsInLine = this.scene.asteroids.getChildren().map(asteroid => {
            const body = asteroid.body;
            if (!body) return null;

            const radius = body.width / 2;
            const cx = body.x + radius;
            const cy = body.y + radius;
            const circle = new Phaser.Geom.Circle(cx, cy, radius);

            const points = Phaser.Geom.Intersects.GetLineToCircle(laserLine, circle);

            if (points && points.length > 0) {
                return {
                    asteroid,
                    intersection: points[0],
                    distance: Phaser.Math.Distance.Between(sx, sy, points[0].x, points[0].y)
                };
            }

            return null;
        }).filter(Boolean);

        let hitChance = 0;
        const third = this.attackRange / 3;

        if (distanceToTarget <= third) {
            hitChance = 0.95;
        } else if (distanceToTarget <= 2 * third) {
            const ratio = (distanceToTarget - third) / third;
            hitChance = 0.95 - ratio * (0.95 - 0.70);
        } else {
            const maxDistance = this.attackRange;
            const remaining = Math.min(distanceToTarget - 2 * third, maxDistance - 2 * third);
            const ratio = remaining / (maxDistance - 2 * third);
            hitChance = 0.70 - ratio * (0.70 - 0.30);
        }

        if (this.accurateEnabled) {
            hitChance = 1.0;
        }

        createFloatingText(this.scene, {
            text: Math.round(hitChance * 100) + "%",
            color: "#ffffff",
            x: target.x,
            y: target.y - 32,
            fontSize: "20px"
        });

        this.scene.game.soundManager.playSFX("aim"); // 🔊 Aiming
        await animateShipAiming(this.scene, this.sprite, target);

        if (asteroidsInLine.length > 0) {
            asteroidsInLine.sort((a, b) => a.distance - b.distance);
            const { intersection } = asteroidsInLine[0];

            await animateShipShooting(this.scene, this.sprite, { x: intersection.x, y: intersection.y }, {
                laserDuration: 300,
                flashCount: 3,
            });
            this.scene.game.soundManager.playSFX("hit_asteroid"); // 🔊 Asteroid hit
            showExplosion(this.scene, intersection.x, intersection.y);
            return;
        }

        const hitRoll = Math.random();
        const isHit = hitRoll <= hitChance;

        console.log(`Distance: ${distanceToTarget.toFixed(1)}, Hit chance: ${(hitChance * 100).toFixed(1)}%, Rolled: ${(hitRoll * 100).toFixed(1)}%`);

        await animateShipShooting(this.scene, this.sprite, target, {
            flashCount: 3,
            laserDuration: 300,
        });

        if (!isHit) {
            this.scene.game.soundManager.playSFX("miss"); // 🔊 Missed shot
            createFloatingText(this.scene, {
                text: "Miss",
                x: target.x,
                y: target.y,
                color: "#73ff00ff",
                floatDistance: 0,
                scale: 2,
                duration: 1200
            });
            return;
        }

        this.scene.game.soundManager.playSFX("hit_ship"); // 🔊 Hit ship

        let damageToinflict = this.damageOutput;

        if (this.doubleDEnabled) {
            damageToinflict *= 2;
            this.scene.game.soundManager.playSFX("double_damage"); // 🔊 Double damage
        }

        target.getData('controller').takeDamage(damageToinflict);
    }

    takeDamage(amount) {
        let shieldDamage = 0;
        let hullDamage = 0;

        if (this.shieldLevel > 0 && this.shieldsEnabled) {
            shieldDamage = Math.min(this.shieldLevel, amount);
            this.shieldLevel -= shieldDamage;
            amount -= shieldDamage;
            showShieldsGettingHit(this.scene, this.sprite.x, this.sprite.y);
            this.scene.game.soundManager.playSFX("shield_hit"); // 🔊 Shield hit
        }

        if (amount > 0) {
            hullDamage = amount;
            this.hullLifePoints -= hullDamage;
            showExplosion(this.scene, this.sprite.x, this.sprite.y);
            this.scene.game.soundManager.playSFX("hull_hit"); // 🔊 Hull hit
        }

        this.showFloatingDamageText(shieldDamage, hullDamage);

        console.log(`Ship took ${shieldDamage} shield and ${hullDamage} hull damage. Hull left: ${this.hullLifePoints}, Shield: ${this.shieldLevel}`);

        if (this.hullLifePoints <= 0) {
            this.scene.game.soundManager.playSFX("ship_destroyed"); // 🔊 Destroyed
            this.destroy();
        }
    }

    destroy() {
        this.clearTrail();
        this.sprite.destroy();
        this.scene.enemies.remove(this.sprite, true);
    }

    showFloatingDamageText(shieldDamage, hullDamage) {
        const offset = this.sprite.displayHeight / 2;
        const baseX = this.sprite.x;
        const baseY = this.sprite.y;

        const floatingDmg = {
            text: shieldDamage,
            x: baseX + offset,
            y: baseY - offset,
            color: "#00BFFF",
            floatDistance: 10,
            scale: 1,
            duration: 1200
        };

        if (shieldDamage > 0) {
            createFloatingText(this.scene, floatingDmg);
        }

        if (hullDamage > 0) {
            floatingDmg.y += 32;
            floatingDmg.text = hullDamage;
            floatingDmg.color = "#ff0000";
            createFloatingText(this.scene, floatingDmg);
        }
    }

    async performUTurn() {
        const originalAngle = this.sprite.angle;
        const targetAngle = (originalAngle + 180) % 360;

        this.scene.game.soundManager.playSFX("turn"); // 🔊 U-turn

        await this.createTweenPromise({
            targets: this.sprite,
            x: this.sprite.x + Math.cos(Phaser.Math.DegToRad(originalAngle)) * 20,
            y: this.sprite.y + Math.sin(Phaser.Math.DegToRad(originalAngle)) * 20,
            duration: 150,
            ease: 'Sine.easeOut',
        });

        await this.createTweenPromise({
            targets: this.sprite,
            angle: targetAngle,
            duration: 500,
            ease: 'Cubic.easeInOut',
        });

        await this.createTweenPromise({
            targets: this.sprite,
            x: this.sprite.x + Math.cos(Phaser.Math.DegToRad(targetAngle)) * 20,
            y: this.sprite.y + Math.sin(Phaser.Math.DegToRad(targetAngle)) * 20,
            duration: 150,
            ease: 'Sine.easeIn',
        });
    }

    createTweenPromise(config) {
        return new Promise((resolve) => {
            config.onComplete = resolve;
            this.scene.tweens.add(config);
        });
    }
}
