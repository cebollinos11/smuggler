import { generateLevel } from "../scripts/utils/levelgenerator.js";
import { GameState } from "../scripts/GameState.js";

export class SelectMissionScene extends Phaser.Scene {
    constructor() {
        super('SelectMissionScene');
    }

    create() {
        const currentLevel = GameState.run.currentLevel;
        this.missions = this.generateMissions(currentLevel);

        // Create mission UI
        this.ui = document.createElement('div');
        this.ui.id = 'mission-ui';

        const title = document.createElement('h2');
        title.textContent = `Choose Your Next Mission (Current Level: ${currentLevel})`;
        this.ui.appendChild(title);

        this.missions.forEach((mission, i) => {
            const card = document.createElement('div');
            card.className = 'mission-card';
            card.innerHTML = `
                <strong>Mission ${i + 1}</strong><br>
                Type: ${mission.type}<br>
                Threat: ${mission.threat}<br>
                Reward: ${mission.reward} credits<br>
                <button>Select</button>
            `;

            card.querySelector('button').addEventListener('click', () => {
                this.cleanupUI();
            // Save selected mission in GameState
            GameState.run.currentMission = mission;
                // Calculate size based on threat (1 → 1000px, 10 → 5000px)
                const baseSize = 1000;
                const maxSize = 5000;
                const size = baseSize + (mission.threat - 1) * ((maxSize - baseSize) / (10 - 1));

                // Generate level based on mission
                const levelData = generateLevel({
                    width: size,
                    height: size,
                    asteroidCount: Phaser.Math.Between(10, 30),
                    coinCount: Phaser.Math.Between(3, 8),
                    enemyCount: mission.threat + 2,
                    difficulty: mission.threat
                });
                
                GameState.run.currentMission.levelData = levelData;
                this.scene.start('SpaceScene', { levelData });
            });

            this.ui.appendChild(card);
        });

        document.body.appendChild(this.ui);

        // Upgrade Ship button
        const upgradeBtn = document.createElement('button');
        upgradeBtn.innerText = 'Upgrade Ship';
        upgradeBtn.style.position = 'absolute';
        upgradeBtn.style.bottom = '20px';
        upgradeBtn.style.left = '50px';
        upgradeBtn.onclick = () => {
            this.cleanupUI();
            this.scene.start('UpgradeScene', { previousScene: 'SelectMissionScene' });
        };
        document.body.appendChild(upgradeBtn);

        this.upgradeBtn = upgradeBtn;
    }

    cleanupUI() {
        if (this.ui) {
            document.body.removeChild(this.ui);
            this.ui = null;
        }
        if (this.upgradeBtn) {
            this.upgradeBtn.remove();
            this.upgradeBtn = null;
        }
    }

    generateMissions(currentLevel) {
        const types = ['Destroy', 'Escort', 'Collect'];

        // Reward formula
        const getReward = (threat) => {
            const baseReward = 100;
            const rewardPerThreat = 75; // credits per threat level
            return baseReward + (threat * rewardPerThreat);
        };

        const missions = [
            {
                type: Phaser.Utils.Array.GetRandom(types),
                threat: currentLevel,
                reward: getReward(currentLevel)
            },
            {
                type: Phaser.Utils.Array.GetRandom(types),
                threat: currentLevel,
                reward: getReward(currentLevel)
            },
            {
                type: Phaser.Utils.Array.GetRandom(types),
                threat: currentLevel + 1,
                reward: getReward(currentLevel + 1)
            }
        ];

        return missions;
    }

    shutdown() {
        this.cleanupUI();
    }
}
