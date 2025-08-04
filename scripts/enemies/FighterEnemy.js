import { BaseEnemy } from './BaseEnemy.js';
import { StatType } from '../Stats.js';

export class FighterEnemy extends BaseEnemy {
    constructor(scene, sprite, x, y , stats) {
        super(scene, sprite, x, y, stats);
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(400);
        this.graphics.lineStyle(10, 0xFFFFFF, 0.6);
    }

    autopilot(scene) {
        const movementData = this.calculateMovement(scene.ship.sprite.x, scene.ship.sprite.y, scene.ship.sprite.angle);
        this.performMovement(movementData);
    }

    async updateBehavior(playerX, playerY, playerAngle) {
        const movementData = this.calculateMovement(playerX, playerY, playerAngle);
        await this.performMovement(movementData);
    }

    calculateMovement() {
        const targetX = this.latestPrediction.x;
        const targetY = this.latestPrediction.y;

        const dx = targetX - this.sprite.x;
        const dy = targetY - this.sprite.y;
        const angleToTarget = Phaser.Math.RadToDeg(Math.atan2(dy, dx));

        const currentAngle = this.sprite.angle;
        let deltaAngle = Phaser.Math.Angle.ShortestBetween(currentAngle, angleToTarget);

        // Use stat system instead of hardcoded fields
        const maxTurnAngle = this.stats[StatType.MAXTURNANGLE].current;
        deltaAngle = Phaser.Math.Clamp(deltaAngle, -maxTurnAngle, maxTurnAngle);

        const fullDeltaRad = Phaser.Math.DegToRad(deltaAngle);
        const steps = 200;
        const angleStep = fullDeltaRad / steps;

        if (Math.abs(fullDeltaRad) < 0.001) {
            this.graphics.clear();
            return {
                startAngleRad: Phaser.Math.DegToRad(currentAngle),
                angleStep: 0,
                radius: 0,
                sign: 0,
                centerX: this.sprite.x,
                centerY: this.sprite.y,
                steps
            };
        }

        const sign = Math.sign(deltaAngle);
        const currentRad = Phaser.Math.DegToRad(currentAngle);

        // Use max speed for arc length calculation
        const maxMoveDistance = this.stats[StatType.MAXSPEED]?.current;
        const radius = maxMoveDistance / Math.abs(fullDeltaRad);

        const centerX = this.sprite.x - Math.sin(currentRad) * radius * sign;
        const centerY = this.sprite.y + Math.cos(currentRad) * radius * sign;

        const startAngleRad = Phaser.Math.Angle.Between(centerX, centerY, this.sprite.x, this.sprite.y);
        const endAngleRad = startAngleRad + fullDeltaRad;

        return {
            startAngleRad,
            endAngleRad,
            angleStep,
            radius,
            sign,
            centerX,
            centerY,
            steps
        };
    }

    performMovement({ startAngleRad, angleStep, radius, sign, centerX, centerY, steps }) {
        return new Promise((resolve) => {
            this.startTrailing();
            let stepIndex = 0;
            this.scene.time.addEvent({
                repeat: steps - 1,
                delay: 6,
                callback: () => {
                    stepIndex++;
                    const angleOffset = startAngleRad + angleStep * stepIndex;
                    this.sprite.x = centerX + Math.cos(angleOffset) * radius;
                    this.sprite.y = centerY + Math.sin(angleOffset) * radius;
                    this.sprite.angle = Phaser.Math.RadToDeg(angleOffset) + (sign < 0 ? -90 : 90);
                    this.updateTrail();
                    if (stepIndex >= steps - 1) {
                        this.stopTrailing();
                        resolve();
                    }
                }
            });
        });
    }
}