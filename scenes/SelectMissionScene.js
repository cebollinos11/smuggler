import { generateLevel } from "../scripts/utils/levelgenerator.js";
import { GameState } from "../scripts/GameState.js";
import { RewardCondition } from "../scripts/RewardCondition.js";

export class SelectMissionScene extends Phaser.Scene {
    constructor() {
        super('SelectMissionScene');
    }

    create() {
        const currentLevel = GameState.run.currentLevel;
        this.missions = this.generateMissions(currentLevel);

        this.ui = document.createElement('div');
        this.ui.id = 'mission-ui';

        const title = document.createElement('h2');
        title.textContent = `Choose Your Next Mission (Current Level: ${currentLevel})`;
        this.ui.appendChild(title);

        this.missions.forEach((mission, i) => {
            let coinCount = Math.ceil(mission.threat / 2);
            if (Phaser.Math.Between(0, 1) === 1) coinCount++;

            const baseSize = 2000;
            const maxSize = 10000;
            const size = baseSize + (mission.threat - 1) * ((maxSize - baseSize) / (10 - 1));

            mission.levelData = generateLevel({
                width: size,
                height: size,
                asteroidCount: Math.ceil((Phaser.Math.Between(1, 2))*size / 100),
                coinCount,
                enemyCount: mission.threat + Phaser.Math.Between(0, 1),
                difficulty: mission.threat
            });

            if (mission.type === 'Destroy') {
                const enemies = mission.levelData.enemies;
                if (enemies.length > 0) {
                    const types = [...new Set(enemies.map(e => e.enemy_type))];
                    const chosenType = Phaser.Utils.Array.GetRandom(types);
                    const count = enemies.filter(e => e.enemy_type === chosenType).length;

                    mission.rewardCondition = new RewardCondition('destroy', {
                        targetType: chosenType,
                        targetCount: count
                    });
                } else {
                    mission.rewardCondition = new RewardCondition('destroyAll');
                }
            }
            else if (mission.type === 'Escort') {
                const start = mission.levelData.playerStart;
                const exit = mission.levelData.exit;
                const dx = exit.x - start.x;
                const dy = exit.y - start.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const turnsAllowed = Math.max(1, Math.round(distance * 0.01));

                mission.rewardCondition = new RewardCondition('escort', {
                    turnsAllowed
                });
            }
            else if (mission.type === 'Collect') {
                let coinsRequired = mission.levelData.coins.length;
                if (coinsRequired > 2 && Phaser.Math.Between(0, 1) === 1) {
                    coinsRequired--;
                }
                mission.rewardCondition = new RewardCondition('collect', {
                    coinsRequired
                });
            }

            mission.description = mission.rewardCondition.toString();

            const card = document.createElement('div');
            card.className = 'mission-card';
            card.innerHTML = `
                <strong>Mission ${i + 1}</strong><br>
                Type: ${mission.type}<br>
                Threat: ${mission.threat}<br>
                Reward: ${mission.reward} credits<br>
                Description: ${mission.description}<br>
                <button>Select</button>
            `;

            card.querySelector('button').addEventListener('click', () => {
                this.cleanupUI();
                GameState.run.currentMission = mission;
                this.scene.start('SpaceScene', { levelData: mission.levelData });
            });

            this.ui.appendChild(card);
        });

        document.body.appendChild(this.ui);

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
        // const types = ['Escort'];
        const getReward = threat => 100 + (threat * 75);

        return [
            { type: Phaser.Utils.Array.GetRandom(types), threat: currentLevel, reward: getReward(currentLevel) },
            { type: Phaser.Utils.Array.GetRandom(types), threat: currentLevel, reward: getReward(currentLevel) },
            { type: Phaser.Utils.Array.GetRandom(types), threat: currentLevel + 1, reward: getReward(currentLevel + 1) }
        ];
    }

    shutdown() {
        this.cleanupUI();
    }
}
