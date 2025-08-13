// RewardCondition.js
export class RewardCondition {
    constructor(type, params = {}) {
        this.type = type;
        Object.assign(this, params);
    }

    toString() {
        switch (this.type) {
            case 'destroy':
                return `Destroy ${this.targetCount} enemies of type ${this.targetType}`;
            case 'destroyAll':
                return `Destroy all enemy forces`;
            case 'escort':
                return `Go to the delivery point in less than ${this.turnsAllowed} turns`;
            case 'collect':
                return `Collect ${this.coinsRequired} coins`;
            default:
                return `Unknown mission objective`;
        }
    }

    /**
     * @param {object} progress - current progress state
     * @returns {string} human-readable progress string
     */
    printProgress(progress) {
        switch (this.type) {
            case 'destroy': {
                const destroyed = progress.destroyedByType?.[this.targetType] || 0;
                return `${destroyed}/${this.targetCount} ${this.targetType} enemies destroyed`;
            }
            case 'destroyAll':
                return `${progress.remainingEnemies ?? 0} enemies remaining`;
            case 'escort':
                return `${progress.turnsTaken ?? 0} turns have passed`;
            case 'collect': {
                const collected = progress.coinsCollected || 0;
                return `${collected}/${this.coinsRequired} coins collected`;
            }
            default:
                return `Progress unknown`;
        }
    }

    /**
     * @param {object} progress - current progress state
     * @returns {boolean} true if completed
     */
    checkProgress(progress) {
        switch (this.type) {
            case 'destroy':
                return (progress.destroyedByType?.[this.targetType] || 0) >= this.targetCount;
            case 'destroyAll':
                return progress.remainingEnemies === 0;
            case 'escort':
                return progress.turnsTaken <= this.turnsAllowed && progress.reachedExit === true;
            case 'collect':
                return (progress.coinsCollected || 0) >= this.coinsRequired;
            default:
                return false;
        }
    }
}
