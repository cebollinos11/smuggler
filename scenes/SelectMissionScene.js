export class SelectMissionScene extends Phaser.Scene {
    constructor() {
        super('SelectMissionScene');
    }

    create() {
        this.missions = this.generateMissions();

        // Create a container div for the mission UI
        this.ui = document.createElement('div');
        this.ui.id = 'mission-ui';

        const title = document.createElement('h2');
        title.textContent = 'Choose Your Next Mission';
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
                this.scene.start('PlayMissionScene', { mission });
            });
            this.ui.appendChild(card);
        });

        document.body.appendChild(this.ui);


                // Add Upgrade Ship button
        const upgradeBtn = document.createElement('button');
        upgradeBtn.innerText = 'Upgrade Ship';
        upgradeBtn.style.position = 'absolute';
        upgradeBtn.style.bottom = '20px';
        upgradeBtn.style.left = '50px';
        upgradeBtn.onclick = () => {
            this.cleanupUI(); // Remove current scene's HTML
            this.scene.start('UpgradeScene', {
                previousScene: 'SelectMissionScene'
            });
        };
        document.body.appendChild(upgradeBtn);

        this.upgradeBtn = upgradeBtn; // Store for cleanup

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
    generateMissions() {
        const types = ['Destroy', 'Escort', 'Collect'];
        return Array.from({ length: 3 }, () => ({
            type: Phaser.Utils.Array.GetRandom(types),
            threat: Phaser.Math.Between(1, 5),
            reward: Phaser.Math.Between(100, 500)
        }));
    }

    shutdown() {
        this.cleanupUI();
    }
}
