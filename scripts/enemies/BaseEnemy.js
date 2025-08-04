// BaseEnemy.js
import { BaseShip } from '../BaseShip.js';
import { RENDER_LAYERS } from '../utils/rendering.js';

export class BaseEnemy extends BaseShip {
    constructor(scene, sprite, x, y, config) {
        super(scene, sprite, x, y, config);
        sprite.setDepth(RENDER_LAYERS.ENEMY); // Set a default depth for the enemy

        this.latestPrediction = null; // Add a property to store the latest prediction
        this.hasCollidedWithAsteroidThisTurn = false;
        // this.scene.input.keyboard.on('keydown-P', () => {
        //     const maxTurn = 90;     // example values
        //     const maxSpeed = 500;

        //     const playerX = this.scene.ship.sprite.x;
        //     const playerY = this.scene.ship.sprite.y;
        //     const playerAngle = this.scene.ship.sprite.angle; // In degrees

        //     // Store the prediction
        //     this.predictPlayerPosition(
        //         this.scene, playerX, playerY, maxTurn, maxSpeed, playerAngle
        //     );
        // });
    }

    async updateBehavior(playerX, playerY, playerAngle) {
        if (this.latestPrediction) {
            // Example: move towards prediction, log, or plan further
            console.log("Acting on latest prediction:", this.latestPrediction);
        }
    }





    OnTurnStarts(){
        super.OnTurnStarts();
        this.predictPlayerPosition(
                    this.scene, 
                    this.scene.ship.sprite.x,
                    this.scene.ship.sprite.y,
                    90,
                    500,
                    this.scene.ship.sprite.angle
                );
    }

    predictPlayerPosition(scene, playerX, playerY, maxTurn, maxSpeed, currentAngleDegrees) {
        if (scene.predictionGraphics) {
            scene.predictionGraphics.clear();
        } else {
            scene.predictionGraphics = scene.add.graphics();
        }

        // const g = scene.predictionGraphics;
        // g.clear();
        // g.lineStyle(2, 0xffff00, 0.7);
        // g.fillStyle(0xffff00, 0.2);

        // Convert angles to radians
        const currentAngle = Phaser.Math.DegToRad(currentAngleDegrees);
        const maxTurnRad = Phaser.Math.DegToRad(maxTurn / 2);

        // Draw arc area
        // g.beginPath();
        // g.moveTo(playerX, playerY);
        // g.arc(playerX, playerY, maxSpeed, currentAngle - maxTurnRad, currentAngle + maxTurnRad);
        // g.closePath();
        // g.fillPath();
        // g.strokePath();

        let predictedX, predictedY;

        if (Phaser.Math.Between(0, 1) === 0) {
            // 🎯 50% chance: straight-line prediction
            predictedX = playerX + Math.cos(currentAngle) * maxSpeed / 2;
            predictedY = playerY + Math.sin(currentAngle) * maxSpeed / 2;
        } else {
            // 🔀 50% chance: random prediction inside cone
            const randomAngle = currentAngle + Phaser.Math.FloatBetween(-maxTurnRad, maxTurnRad);
            const randomDistance = Phaser.Math.FloatBetween(0, maxSpeed);
            predictedX = playerX + Math.cos(randomAngle) * randomDistance;
            predictedY = playerY + Math.sin(randomAngle) * randomDistance;
        }

        // Draw the predicted target point
        // g.fillStyle(0xffffff, 1);
        // g.fillCircle(predictedX, predictedY, 40);

        this.latestPrediction = { x: predictedX, y: predictedY };
    }
}
