// BaseShip.js
import { delay } from './utils/timing.js';
import { animateShipAiming, animateShipShooting, flashSprite } from './utils/combat.js';
import { RENDER_LAYERS } from './utils/rendering.js';
import { showExplosion, showShieldsGettingHit, createFloatingText, animatePlayerExploding } from './utils/animations.js';
import { createShipStats, StatType } from './Stats.js';
import { drawConePreview } from './utils/cone.js';
export class BaseShip {
    constructor(scene, sprite, x, y, stats) {
        this.isPlayer = false;
        this.scene = scene;
        this.sprite = sprite;
        this.sprite.setData('controller', this);
        this.unitDistance = 100;
        this.moveSpeed = 100;
        this.x = x;
        this.y = y;

        // Fully stat-driven
        this.stats = stats;
        //reset some stats

        // Shields
        this.shieldsEnabled = false;
        this.shieldGraphics = scene.add.graphics({ lineStyle: { width: 2, color: 0x00ffff, alpha: 0.8 } });
        this.shieldGraphics.setDepth(RENDER_LAYERS.PLAYER_VISUALS_BEHIND);

        // Combat modifiers
        this.doubleDEnabled = false;
        this.accurateEnabled = false;
        this.multiTargetEnabled = false;

        // Trail
        this.trailing = false;
        this.trailDots = [];
        this.lastTrailPosition = null;

        // Collider
        this.sprite.setCircle(this.sprite.width / 2);
    }

    resetStats(){
        this.stats[StatType.SHIELD].current = this.stats[StatType.SHIELD].base;
    }

    startTrailing() {
        this.trailing = true;
        this.lastTrailPosition = new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
    }

    OnTurnStarts() {
        this.hasCollidedWithAsteroidThisTurn = false;
    }

    stopTrailing() {
        this.trailing = false;
        this.lastTrailPosition = null;
    }

    clearTrail() {
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

    OnOverlappingAsteroid() {
        if (!this.hasCollidedWithAsteroidThisTurn) {
            flashSprite(this.scene, this.sprite, 1, 100, "#333333");
        }
        this.hasCollidedWithAsteroidThisTurn = true;
    }

    async takeAttackAction() {
        const attackRange = this.stats[StatType.ATTACK_RANGE].current;
        const attackAngle = this.stats[StatType.ATTACK_ANGLE].current;

        const enemygroup = this.isPlayer ? this.scene.enemies : { getChildren: () => [this.scene.ship.sprite] };
        drawConePreview(this.scene,this.sprite.x, this.sprite.y, this.sprite.angle, attackRange, attackAngle);

        const result = this.scene.findTargetsInConeRange(this.sprite, enemygroup, attackRange, attackAngle);

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

        this.scene.coneGraphics.clear();
    }

    async fireWeapon(target) {
        const attackRange = this.stats[StatType.ATTACK_RANGE].current;
        const attackPower = this.stats[StatType.ATTACK_POWER].current;

        const { x: sx, y: sy } = this.sprite;
        const { x: tx, y: ty } = target;

        const distanceToTarget = Phaser.Math.Distance.Between(sx, sy, tx, ty);
        const laserLine = new Phaser.Geom.Line(sx, sy, tx, ty);

        const asteroidsInLine = this.scene.asteroids.getChildren()
            .map(asteroid => {
                const body = asteroid.body;
                if (!body) return null;

                const radius = body.width / 2;
                const cx = body.x + radius;
                const cy = body.y + radius;
                const circle = new Phaser.Geom.Circle(cx, cy, radius);

                const points = Phaser.Geom.Intersects.GetLineToCircle(laserLine, circle);
                if (points?.length > 0) {
                    return {
                        asteroid,
                        intersection: points[0],
                        distance: Phaser.Math.Distance.Between(sx, sy, points[0].x, points[0].y)
                    };
                }
                return null;
            })
            .filter(Boolean);

        let hitChance = 0;
        const third = attackRange / 3;
        if (distanceToTarget <= third) {
            hitChance = 0.95;
        } else if (distanceToTarget <= 2 * third) {
            const ratio = (distanceToTarget - third) / third;
            hitChance = 0.95 - ratio * (0.95 - 0.70);
        } else {
            const maxDistance = attackRange;
            const remaining = Math.min(distanceToTarget - 2 * third, maxDistance - 2 * third);
            const ratio = remaining / (maxDistance - 2 * third);
            hitChance = 0.70 - ratio * (0.70 - 0.30);
        }

        if (this.accurateEnabled) hitChance = 1.0;

        if (this.hasCollidedWithAsteroidThisTurn) {
            hitChance /= 4;
            createFloatingText(this.scene, {
                text: "Asteroid",
                color: "#ffffff",
                x: this.sprite.x,
                y: this.sprite.y - 32,
                fontSize: "20px"
            });
        }

        createFloatingText(this.scene, {
            text: Math.round(hitChance * 100) + "%",
            color: "#ffffff",
            x: target.x,
            y: target.y - 32,
            fontSize: "20px"
        });

        if (asteroidsInLine.length === 0) {
            this.scene.game.soundManager.playSFX("aim");
            await animateShipAiming(this.scene, this.sprite, target);
        } else {
            return;
        }

        const hitRoll = Math.random();
        const isHit = hitRoll <= hitChance;

        if (!isHit) {
            this.scene.game.soundManager.playSFX("click");
            createFloatingText(this.scene, {
                text: "Miss",
                x: target.x,
                y: target.y - 50,
                color: "#73ff00ff",
                floatDistance: 0,
                scale: 1,
                duration: 1200
            });
            await animateShipShooting(this.scene, this.sprite, target, { flashCount: 3, laserDuration: 300 });
            return;
        }

        await animateShipShooting(this.scene, this.sprite, target, { flashCount: 3, laserDuration: 300 });
        this.scene.game.soundManager.playSFX("hit_ship");

        let damageToInflict = attackPower;
        if (this.doubleDEnabled) {
            damageToInflict *= 2;
            this.scene.game.soundManager.playSFX("double_damage");
        }

        await target.getData('controller').takeDamage(damageToInflict);
    }

    async takeDamage(amount) {
        let shieldDamage = 0;
        let hullDamage = 0;

        const shield = this.stats[StatType.SHIELD];
        const hull = this.stats[StatType.HULL];

        if (shield.current > 0 && this.shieldsEnabled) {
            shieldDamage = Math.min(shield.current, amount);
            shield.current -= shieldDamage;
            amount -= shieldDamage;
            showShieldsGettingHit(this.scene, this.sprite.x, this.sprite.y);
            this.scene.game.soundManager.playSFX("shield_hit");
        }

        if (amount > 0) {
            hullDamage = amount;
            hull.current -= hullDamage;
            showExplosion(this.scene, this.sprite.x, this.sprite.y);
            this.scene.game.soundManager.playSFX("hull_hit");
        }

        this.showFloatingDamageText(shieldDamage, hullDamage);

        if (hull.current <= 0) {
            this.scene.game.soundManager.playSFX("ship_destroyed");
            await this.destroy();
        }
    }

    async destroy() {
        this.clearTrail();
        await animatePlayerExploding(this.scene, this);
        this.scene.enemies.remove(this.sprite, true);
        this.sprite.destroy();
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

        this.scene.game.soundManager.playSFX("turn");

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
