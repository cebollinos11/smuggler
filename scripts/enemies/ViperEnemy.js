import { BaseEnemy } from './BaseEnemy.js';

export class ViperEnemy extends BaseEnemy {
    constructor(scene, sprite, x, y) {
        super(scene, sprite, x, y);
        this.maxTurnAngle = 90; // degrees
        this.damageOutput = 50; // Higher damage output for Viper
        this.hullLifePoints = 30; // More hull points for Viper

        this.maxMoveDistance = 300; // pixels

        this.graphics = scene.add.graphics();
        this.graphics.setDepth(400);
        this.graphics.lineStyle(10, 0xFFFFFF, 0.6);

        this.attackConeAngle = 90; // Wider cone for probing
        this.attackRange = 500; // Shorter range for probing

        scene.input.keyboard.on('keydown-V', () => {
            this.autopilot(scene);
        });
    }

    autopilot(scene) {
        const movementData = this.calculateMovement(scene.ship.sprite.x, scene.ship.sprite.y, scene.ship.sprite.angle);
        this.performMovement(movementData);
    }

    async updateBehavior(playerX, playerY, playerAngle) {
        const movementData = this.calculateMovement(playerX, playerY, playerAngle);
        await this.performMovement(movementData); // wait until movement is fully done
    }

    calculateMovement() {
        
        const targetX = this.latestPrediction.x;;
        const targetY = this.latestPrediction.y;

        const dx = targetX - this.sprite.x;
        const dy = targetY - this.sprite.y;
        const angleToTarget = Phaser.Math.RadToDeg(Math.atan2(dy, dx));

        const currentAngle = this.sprite.angle;
        let deltaAngle = Phaser.Math.Angle.ShortestBetween(currentAngle, angleToTarget);
        deltaAngle = Phaser.Math.Clamp(deltaAngle, -this.maxTurnAngle, this.maxTurnAngle);
        const fullDeltaRad = Phaser.Math.DegToRad(deltaAngle);

        const steps = 200;
        const angleStep = fullDeltaRad / steps;

        // If deltaAngle is too small, treat as straight line
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

        // Proper radius from arc length formula: s = r * theta -> r = s / theta
        const radius = this.maxMoveDistance / Math.abs(fullDeltaRad);

        // Arc center
        const centerX = this.sprite.x - Math.sin(currentRad) * radius * sign;
        const centerY = this.sprite.y + Math.cos(currentRad) * radius * sign;

        const startAngleRad = Phaser.Math.Angle.Between(centerX, centerY, this.sprite.x, this.sprite.y);
        const endAngleRad = startAngleRad + fullDeltaRad;

        // Draw arc from the current position and line to player position
        // this.graphics.clear();
        // this.graphics.lineStyle(10, 0xFFFFFF, 0.6);

        // // Draw the arc
        // this.graphics.beginPath();
        // this.graphics.arc(
        //     centerX,
        //     centerY,
        //     radius,
        //     startAngleRad,
        //     endAngleRad,
        //     sign < 0
        // );
        // this.graphics.strokePath();

        //// Draw line from Viper to player
        // this.graphics.lineStyle(2, 0xFF0000, 0.8); // Thinner red line for clarity
        // this.graphics.beginPath();
        // this.graphics.moveTo(this.sprite.x, this.sprite.y);
        // this.graphics.lineTo(targetX, targetY);
        // this.graphics.strokePath();

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
            let stepIndex = 0;
            const timer = this.scene.time.addEvent({
                repeat: steps - 1,
                delay: 6,
                callback: () => {
                    stepIndex++;
                    const angleOffset = startAngleRad + angleStep * stepIndex;
                    this.sprite.x = centerX + Math.cos(angleOffset) * radius;
                    this.sprite.y = centerY + Math.sin(angleOffset) * radius;
                    this.sprite.angle = Phaser.Math.RadToDeg(angleOffset) + (sign < 0 ? -90 : 90);

                    if (stepIndex >= steps - 1) {
                        resolve(); // movement complete
                    }
                }
            });
        });
    }
}
