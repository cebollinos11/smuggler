import { UpdateMission } from "./ui/controller.js";

export class Progress {
    constructor() {
        this.destroyedByType = {}; // { fighter: 3, bomber: 1, ... }
        this.turnsTaken = 0;
        this.coinsCollected = 0;
        this.reachedExit = false;
        this.remainingEnemies = 0;

        // New: track if player ship exploded
        this.playerShipExploded = false;
    }

    addTurn() {
        this.turnsTaken += 1;
        UpdateMission();
    }

    addCoins() {
        this.coinsCollected += 1;
        UpdateMission();

    }

    addDestroyed(type) {
        if (!this.destroyedByType[type]) {
            this.destroyedByType[type] = 0;
        }
        this.destroyedByType[type] += 1;
        UpdateMission();

        console.log("---- Destroyed counts ----");
            for (const [destroyType, count] of Object.entries(this.destroyedByType)) {
                console.log(`${destroyType}: ${count}`);
            }
            console.log("--------------------------");
    }

    markExitReached() {
        this.reachedExit = true;
    }

    setRemainingEnemies(count) {
        this.remainingEnemies = count;
    }

    // New: mark player ship exploded
    markPlayerShipExploded() {
        this.playerShipExploded = true;
    }

    toObject() {
        return {
            coinsCollected: this.coinsCollected,
            turnsTaken: this.turnsTaken,
            reachedExit: this.reachedExit,
            destroyedByType: { ...this.destroyedByType },
            remainingEnemies: this.remainingEnemies,
            playerShipExploded: this.playerShipExploded // include in save
        };
    }
}
