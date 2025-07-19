export class ReportScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ReportScene' });
    }

    init(data) {
        this.missionFailed = data.missionFailed || false;
        this.coinsCollected = data.coinsCollected || 0;
        this.timeRemaining = data.timeRemaining || 0;
        this.enemiesDestroyed = data.enemiesDestroyed || 0;
    }

    create() {
        this.showMissionReportUI();
        //hide #ui
        const ui = document.getElementById('ui');
        if (ui) {
            ui.style.display = 'none';
        }
    }

    showMissionReportUI() {
        const reportUI = document.getElementById('mission-report');
        const title = document.getElementById('report-title');
        const details = document.getElementById('report-details');
        const failure = document.getElementById('report-failure');
        const coinsText = document.getElementById('report-coins');
        const timeText = document.getElementById('report-time');
        const enemiesText = document.getElementById('report-enemies');
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
        }

        reportUI.style.display = 'flex';

        continueBtn.onclick = () => {
            reportUI.style.display = 'none';
            this.scene.start('SelectLevelScene'); // Replace as needed
        };
    }
}
