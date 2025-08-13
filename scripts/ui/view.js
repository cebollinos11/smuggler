import {GameState} from '../GameState.js';

let controller = null;
let alreadyInit = false;
let sceneRef = null;

function createToggleButton(buttonEl, onLabel, offLabel, initialState = false, callback = null, hotkey = null) {
    let state = initialState;

    function underlineHotkey(label, hotkey) {
        if (!hotkey) return label;
        const i = label.toLowerCase().indexOf(hotkey.toLowerCase());
        if (i === -1) return label;
        return label.slice(0, i) + '<u>' + label[i] + '</u>' + label.slice(i + 1);
    }

    const updateUI = () => {
        const label = state ? onLabel : offLabel;
        buttonEl.innerHTML = underlineHotkey(label, hotkey);
        buttonEl.classList.toggle('toggle-on', state);
        buttonEl.classList.toggle('toggle-off', !state);
    };

    buttonEl.addEventListener('click', () => {
        state = !state;
        sceneRef.game.soundManager.playSFX("flip_switch");
        updateUI();
        if (typeof callback === 'function') {
            callback(state);
        }
    });

    updateUI();
}
export function updateMissionRewardUI(mission, progress) {
    const el = document.getElementById('missionReward');
    if (!el) return;

    if (!mission || !mission.rewardCondition) {
        el.innerText = "No mission";
        return;
    }

    const { rewardCondition } = mission;

    const objectiveText = rewardCondition.toString();
    const progressText = progress
        ? rewardCondition.printProgress(progress)
        : "";

    el.innerText = progressText
        ? `Mission: ${objectiveText}\n${progressText}`
        : `Mission: ${objectiveText}`;
}



export function initUI(viewController, scene) {
    if (alreadyInit) return;
    alreadyInit = true;

    sceneRef = scene;
    controller = viewController;

    document.getElementById('sendMovement').addEventListener('click', () => {
        const angle = parseInt(document.getElementById('arcSlider').value);
        const distance = parseInt(document.getElementById('arcDistSlider').value);
        controller.addArc(angle, distance);
        sceneRef.game.soundManager.playSFX("keypress");
    });

    document.getElementById('arcSlider').addEventListener('input', (e) => {
        const angle = parseInt(e.target.value);
        const distance = parseInt(document.getElementById('arcDistSlider').value);
        document.getElementById('arcValue').innerText = angle;
        controller.onArcInput(angle, distance);
    });

    document.getElementById('arcDistSlider').addEventListener('input', (e) => {
        const distance = parseInt(e.target.value);
        const angle = parseInt(document.getElementById('arcSlider').value);
        document.getElementById('arcDistValue').innerText = distance;
        controller.onArcInput(angle, distance);
    });



    document.getElementById('zoomSlider').addEventListener('input', (e) => {
        const zoom = parseFloat(e.target.value);
        document.getElementById('zoomValue').innerText = zoom.toFixed(2);
        controller.onZoomInput(zoom);
    });

    // Create toggle buttons with underlined hotkeys
    createToggleButton(
        document.getElementById('shieldsButton'),
        'Shields ON', 'Shields OFF', false,
        (newState) => controller.onShieldToggle(newState), 's'
    );

    createToggleButton(
        document.getElementById('doubleDButton'),
        'Double Damage ON', 'Double Damage OFF', false,
        (newState) => controller.onDoubleDToggle(newState), 'd'
    );

    createToggleButton(
        document.getElementById('accurateButton'),
        'AI Targeting ON', 'AI Targeting OFF', false,
        (newState) => controller.onAccurateToggle(newState), 'a'
    );

    createToggleButton(
        document.getElementById('MultiTargetButton'),
        'MultiTarget ON', 'MultiTarget OFF', false,
        (newState) => controller.onMultiTargetToggle(newState), 'm'
    );

    // Checkbox toggles (no visual label change, but hotkeys toggle them)
    document.getElementById('radarToggle').addEventListener('change', (e) => {
        controller.onRadarToggle(e.target.checked);
        sceneRef.game.soundManager.playSFX("flip_switch");
    });

    document.getElementById('uturnToggle').addEventListener('change', (e) => {
        controller.onUTurnToggle(e.target.checked);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        const angleSlider = document.getElementById('arcSlider');
        const distSlider = document.getElementById('arcDistSlider');
        if (!angleSlider || !distSlider || !controller) return;

        let updated = false;
        const distStep = 1;
        let angle = parseFloat(angleSlider.value);
        const angleStep = parseFloat(angleSlider.step) || 11.25;
        const angleMin = parseFloat(angleSlider.min) || -90;
        const angleMax = parseFloat(angleSlider.max) || 90;
        let distance = parseInt(distSlider.value);

        switch (event.key.toLowerCase()) {
            case 'arrowleft':
                angle = Math.max(angle - angleStep, angleMin);
                updated = true;
                break;
            case 'arrowright':
                angle = Math.min(angle + angleStep, angleMax);
                updated = true;
                break;
            case 'arrowup':
                distance = Math.min(distance + distStep, parseInt(distSlider.max));
                updated = true;
                break;
            case 'arrowdown':
                distance = Math.max(distance - distStep, parseInt(distSlider.min));
                updated = true;
                break;
            case 'enter':
                const btn = document.getElementById('sendMovement');
                if(btn.disabled)
                {
                    sceneRef.game.soundManager.playSFX("miss");
                    break;
                }

                controller.addArc(angle, distance);
                sceneRef.game.soundManager.playSFX("keypress");
                break;
            case 's':
                document.getElementById('shieldsButton').click(); break;
            case 'd':
                document.getElementById('doubleDButton').click(); break;
            case 'a':
                document.getElementById('accurateButton').click(); break;
            case 'm':
                document.getElementById('MultiTargetButton').click(); break;
            case 'r':
                const radarToggle = document.getElementById('radarToggle');
                radarToggle.checked = !radarToggle.checked;
                radarToggle.dispatchEvent(new Event('change'));
                break;
            case 'u':
                const uturnToggle = document.getElementById('uturnToggle');
                uturnToggle.checked = !uturnToggle.checked;
                uturnToggle.dispatchEvent(new Event('change'));
                break;
        }

        if (updated) {
            angleSlider.value = angle;
            distSlider.value = distance;
            document.getElementById('arcValue').innerText = angle;
            document.getElementById('arcDistValue').innerText = distance;
            controller.onArcInput(angle, distance);
            sceneRef.game.soundManager.playSFX("keypress");
        }
    });

        if (GameState?.run?.currentMission) {
    }
}

export function updateShieldHullUI(shieldPercent, hullPercent, shieldRaw = null, shieldMax = null, hullRaw = null, hullMax = null) {
    const shieldBar = document.getElementById('shieldBar');
    const hullBar = document.getElementById('hullBar');
    const shieldLabel = document.getElementById('shieldBarLabel');
    const hullLabel = document.getElementById('hullBarLabel');

    if (shieldBar) shieldBar.style.width = `${Math.max(0, Math.min(100, shieldPercent))}%`;
    if (hullBar) hullBar.style.width = `${Math.max(0, Math.min(100, hullPercent))}%`;

    if (shieldLabel && shieldRaw !== null && shieldMax !== null) {
        shieldLabel.innerText = `${Math.round(shieldRaw)} / ${Math.round(shieldMax)}`;
    }

    if (hullLabel && hullRaw !== null && hullMax !== null) {
        hullLabel.innerText = `${Math.round(hullRaw)} / ${Math.round(hullMax)}`;
    }
}

export function updateOverheatBarUI(current, max, predictedDelta = 0) {
    const currentBar = document.getElementById('overheatBarCurrent');
    const predictedBar = document.getElementById('overheatBarPredicted');
    const label = document.getElementById('overheatBarLabel');

    const basePercent = Math.max(0, Math.min(100, (current / max) * 100));
    const predictedTotal = current + predictedDelta;
    const totalPercent = Math.max(0, Math.min(100, (predictedTotal / max) * 100));
    const deltaPercent = totalPercent - basePercent;

    if (currentBar) currentBar.style.width = `${basePercent}%`;

    if (predictedBar) {
        predictedBar.style.width = `${Math.abs(deltaPercent)}%`;
        predictedBar.style.backgroundColor = deltaPercent >= 0 ? 'yellow' : '#00ff00';
        predictedBar.style.marginLeft = deltaPercent >= 0 ? '0px' : `${deltaPercent}%`;
    }

    if (label) {
        const sign = predictedDelta >= 0 ? '+' : '';
        label.innerText = `${Math.round(current)} / ${Math.round(max)} (${sign}${Math.round(predictedDelta)})`;
    }
}

export function updateOverheatUI(prediction, current, max, report = []) {
    const btn = document.getElementById('sendMovement');

    const sign = prediction >= 0 ? `+${prediction}` : `${prediction}`;
    btn.textContent = `Confirm (${sign}°C)`;

    btn.disabled = prediction + current >= max;
    btn.style.backgroundColor = btn.disabled ? 'red' : '';

    const reportBox = document.getElementById('overheatReport');
    if (reportBox) {
        reportBox.value = report.join('\n');
    }
}

export function setUIEnabled(enabled) {
    const ui = document.getElementById('ui');
    ui.style.display = "flex";
    if (!ui) return;
    const controls = ui.querySelectorAll('input, button, select, textarea');
    controls.forEach(control => control.disabled = !enabled);
}

export function resetUI() {
    const toggle = document.getElementById('uturnToggle');
    toggle.checked = false;
}
