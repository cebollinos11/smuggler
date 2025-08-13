import { GameState } from "../scripts/GameState.js";

export class ReportScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ReportScene' });
    }

create() {
    const ui = document.getElementById('ui');
    if (ui) {
        ui.style.display = 'none';
    }
    const mission = GameState.run.currentMission || {};
    const progress = mission.progress ? mission.progress.toObject() : {};

    // New: game-over check if player ship exploded
    if (progress.playerShipExploded) {
        this.showGameOverUI(mission, progress);
        return;
    }

    // Normal mission success/failure check
    const condition = mission.rewardCondition;
    const success = condition ? condition.checkProgress(progress) : false;
    this.missionFailed = !success;

    if (success && mission.reward) {
        GameState.run.credits += mission.reward;
    }

    GameState.run.currentLevel += 1;
    this.showMissionReportUI(mission, progress, success);

}

showGameOverUI(mission, progress) {
    const reportUI = document.getElementById('mission-report');
    const title = document.getElementById('report-title');
    const details = document.getElementById('report-details');
    const failure = document.getElementById('report-failure');
    const continueBtn = document.getElementById('continue-button');

    title.textContent = 'Game Over';
    details.style.display = 'none';
    failure.style.display = 'block';
    failure.textContent = 'Your ship was destroyed!';

    reportUI.style.display = 'flex';

    continueBtn.onclick = () => {
        reportUI.style.display = 'none';
        GameState.run = {}; // reset run data
        this.scene.start('SelectLevelScene');
    };
}


    showMissionReportUI(mission, progress, success) {
        const reportUI = document.getElementById('mission-report');
        const title = document.getElementById('report-title');
        const details = document.getElementById('report-details');
        const failure = document.getElementById('report-failure');
        const conditionText = document.getElementById('report-condition');
        const rewardText = document.getElementById('report-reward');
        const continueBtn = document.getElementById('continue-button');

        if (!success) {
            title.textContent = 'Mission Failed';
            details.style.display = 'none';
            failure.style.display = 'block';
        } else {
            title.textContent = 'Mission Complete!';
            details.style.display = 'block';
            failure.style.display = 'none';

            // Show condition and progress
            if (conditionText && mission.rewardCondition) {
                conditionText.textContent = mission.rewardCondition.toString();
            }

            if (rewardText) {
                rewardText.textContent = mission.reward ? mission.reward.toString() : "0";
            }
        }

        reportUI.style.display = 'flex';

        continueBtn.onclick = () => {
            reportUI.style.display = 'none';
            GameState.run.currentMission = null;
            this.scene.start('SelectMissionScene');
        };
    }
}
