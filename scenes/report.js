import { GameState } from "../scripts/GameState.js";

export class ReportScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ReportScene' });
    }

    create() {
        const mission = GameState.run.currentMission || {};
        
        // These values are still specific to gameplay results,
        // so SpaceScene can set them in GameState before coming here.
        this.missionFailed = mission.missionFailed;
        this.coinsCollected = mission.coinsCollected;
        this.timeRemaining = mission.timeRemaining;
        this.enemiesDestroyed = mission.enemiesDestroyed;

        // Award credits if mission was successful
        if (!this.missionFailed && mission.reward) {
            GameState.run.credits += mission.reward;
        }

        this.showMissionReportUI(mission);

        // Hide in-game HUD
        const ui = document.getElementById('ui');
        if (ui) {
            ui.style.display = 'none';
        }
    }

    showMissionReportUI(mission) {
        const reportUI = document.getElementById('mission-report');
        const title = document.getElementById('report-title');
        const details = document.getElementById('report-details');
        const failure = document.getElementById('report-failure');
        const coinsText = document.getElementById('report-coins');
        const timeText = document.getElementById('report-time');
        const enemiesText = document.getElementById('report-enemies');
        const rewardText = document.getElementById('report-reward');
        const continueBtn = document.getElementById('continue-button');

        if (this.missionFailed) {
            title.textContent = 'Mission Failed';
            details.style.display = 'none';
            failure.style.display = 'block';
        } else {
            title.textContent = 'Mission Complete!';
            details.style.display = 'block';
            failure.style.display = 'none';

            coinsText.textContent = this.coinsCollected.toString();
            timeText.textContent = this.timeRemaining.toString();
            enemiesText.textContent = this.enemiesDestroyed.toString();
            
            // Show reward from GameState
            if (rewardText) {
                rewardText.textContent = mission.reward ? mission.reward.toString() : "0";
            }
        }

        reportUI.style.display = 'flex';

        continueBtn.onclick = () => {
            reportUI.style.display = 'none';

            // Clear current mission so stale data isn't reused
            GameState.run.currentMission = null;

            // Go back to mission select
            this.scene.start('SelectMissionScene');
        };
    }
}
