import { StatType, StatDefaults, createShipStats, ShipStatTemplates } from '../scripts/Stats.js';
import { GameState } from '../scripts/GameState.js';

export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super('UpgradeScene');
    }

    init(data) {
        // Player data comes from previous scene
        this.shipStats = GameState.shipData;
        this.previousScene = data.previousScene || null; // store the scene key we came from
    }

    preload() {
    }

    create() {

        // Create HTML UI
        this.createHTMLUI();

        // Update UI values
        this.updateStatsUI();

        //enable ui
        //find element with id upgrade
        const upgradeEl = document.getElementById('upgrade-ui');
        //make it display block
        upgradeEl.style.display = 'block';

    
        // Create Back Button
    const backBtn = document.createElement('button');
    backBtn.innerText = 'Back';
    backBtn.style.position = 'absolute';
    backBtn.style.top = '10px';
    backBtn.style.left = '10px';
    backBtn.onclick = () => {
        if (this.previousScene) {
            this.scene.start(this.previousScene, this.previousSceneData);
        }
    };
    document.body.appendChild(backBtn);

    // Clean up back button on scene shutdown
    this.events.on('shutdown', () => {
        document.getElementById('upgrade-ui').style.display = 'none';
        backBtn.remove();
    });
    }

    createHTMLUI() {
        
        this.statsListEl = document.getElementById('stats-list');
        this.moneyDisplayEl = document.getElementById('money-display');
    }

updateStatsUI() {
    this.statsListEl.innerHTML = '';
    for (const [stat, data] of Object.entries(this.shipStats)) {
        if (!(stat in StatDefaults)) continue;

        const currentValue = data.current;
        const cost = data.costOfUpgrade;
        const previewValue = (currentValue + data.incrementBase).toFixed(2);

        const canAfford = GameState.run.credits >= cost;
        const buttonLabel = canAfford ? `Upgrade` : `Not enough money`;

        const row = document.createElement('div');
        row.className = 'stat-row';

        row.innerHTML = `
            <div class="stat-name">${stat}</div>
            <div class="stat-preview">${currentValue} → ${previewValue} (Cost: $${cost})</div>
            <button ${!canAfford ? 'disabled' : ''} data-stat="${stat}">${buttonLabel}</button>
        `;

        this.statsListEl.appendChild(row);

        if (canAfford) {
            row.querySelector('button').addEventListener('click', () => {
                this.applyUpgrade(stat);
            });
        }
    }

    this.moneyDisplayEl.innerText = `Money: $${GameState.run.credits}`;
}



    showUpgradePreview(stat) {
        const statData = this.shipStats[stat];
        const previewValue = (statData.current + statData.incrementBase).toFixed(2);
        const cost = statData.costOfUpgrade;

        if (GameState.run.credits < cost) {
            alert('Not enough money!');
            return;
        }

        const confirmDiv = document.createElement('div');
        confirmDiv.style.marginTop = '5px';
        confirmDiv.innerHTML = `
            <div style="margin-top:5px; background:rgba(255,255,255,0.1); padding:5px; border-radius:5px;">
                New Value: ${previewValue} (Cost: $${cost})<br>
                <button id="confirm-upgrade">Confirm</button>
                <button id="cancel-upgrade">Cancel</button>
            </div>
        `;

        const statRow = [...this.statsListEl.children].find(r => 
            r.querySelector('button')?.dataset.stat === stat
        );
        statRow.appendChild(confirmDiv);

        confirmDiv.querySelector('#confirm-upgrade').addEventListener('click', () => {
            this.applyUpgrade(stat);
            confirmDiv.remove();
        });

        confirmDiv.querySelector('#cancel-upgrade').addEventListener('click', () => {
            confirmDiv.remove();
        });
    }

    applyUpgrade(stat) {
        const statData = this.shipStats[stat];
        const cost = statData.costOfUpgrade;

        if (GameState.run.credits >= cost) {
            statData.base += statData.incrementBase;
            statData.current += statData.incrementBase;
            GameState.run.credits -= cost;
            this.moneyDisplayEl.innerText = `Money: $${GameState.run.credits}`;
            this.updateStatsUI();
        }
    }
}
