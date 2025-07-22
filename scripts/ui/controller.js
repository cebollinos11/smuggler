// ui/controller.js
import {
        updateOverheatUI,

    resetUI,
    initUI,
    setUIEnabled,
    updateShieldHullUI,
    updateOverheatBarUI
} from './view.js';


let sceneRef = null;
let referenceZoom = 1.0;

export function InitUIController(scene) {
    sceneRef = scene;
    initUI(viewController,scene);
    setUIEnabled(true);
}

export function UISetShieldHullLevels(shieldPercent, hullPercent, shieldRaw, shieldMax, hullRaw, hullMax) {
    updateShieldHullUI(shieldPercent, hullPercent, shieldRaw, shieldMax, hullRaw, hullMax);
}
export function updateOverheatPreview() {
    const angle = sceneRef.lastArcAngle || 0;
    const distance = sceneRef.lastArcDistance || 0;
    const uturnEnabled = sceneRef.isUTurnEnabled || false;
    const result = predictOverheat(angle, distance, uturnEnabled);

    updateOverheatUI(result.predicted, sceneRef.overheat, sceneRef.maxOverheat, result.report);

    // Update visual overheat bar with predicted total
    updateOverheatUI(result.predicted, sceneRef.overheat, sceneRef.maxOverheat, result.report);
updateOverheatBarUI(sceneRef.overheat, sceneRef.maxOverheat, result.predicted);
}


export function setReferenceZoom(zoom) {
    referenceZoom = zoom;
}

export function UIOnNewTurn(zapped = false) {
    if (!sceneRef) return;
    resetUI();
    sceneRef.isUTurnEnabled = false;
    updateOverheatPreview();
    setUIEnabled(true);
}




export function predictOverheat(angle, distance, uturnEnabled) {
    const prevAngle = sceneRef.prevAngle || 0;
    const prevThrust = sceneRef.prevThrust || 0;
    let predicted = 0;
    let report = [];

    const deltaAngle = Math.abs(angle - prevAngle);
    const deltaThrust = Math.abs(distance - prevThrust);

    // Cooling system
    predicted -= 10;
    report.push(`-10°C Cooling systems`);

    // Angle change contribution
    if (deltaAngle > 120) {
        predicted += 30;
        report.push(`+30°C Large angle change`);
    } else if (deltaAngle > 80) {
        predicted += 10;
        report.push(`+10°C Moderate angle change`);
    } else if (deltaAngle > 50) {
        predicted += 5;
        report.push(`+5°C Small angle change`);
    }

    const thrustDirection = distance > prevThrust ? "Acceleration" : "Deceleration";

    if (deltaThrust === 2) {
        predicted += 10;
        report.push(`+10°C Small ${thrustDirection}`);
    } else if (deltaThrust >= 3) {
        predicted += 30;
        report.push(`+30°C Large ${thrustDirection}`);
    }

    // U-turn
    if (uturnEnabled) {
        predicted += 50;
        report.push(`+50°C U-turn`);
    }

    // Ship abilities
    const abilities = [
        { label: "Shields", enabled: sceneRef.ship.shieldsEnabled, amount: 10 },
        { label: "Double D", enabled: sceneRef.ship.doubleDEnabled, amount: 11 },
        { label: "Accurate", enabled: sceneRef.ship.accurateEnabled, amount: 12 },
        { label: "Multi Target", enabled: sceneRef.ship.multiTargetEnabled, amount: 13 }
    ];

    for (const ability of abilities) {
        if (ability.enabled) {
            predicted += ability.amount;
            report.push(`+${ability.amount}°C ${ability.label}`);
        }
    }
    console.log(report);
    return { predicted, report };

       
}


// View-Controller interface
export const viewController = {
    addArc: (angle, distance) => {
        sceneRef.lastArcAngle = angle;
        sceneRef.lastArcDistance = distance;
        setUIEnabled(false);
        sceneRef.executeArcCommand(angle, distance);
    },

    onArcInput: (angle, distance) => {
        sceneRef.lastArcAngle = angle;
        sceneRef.lastArcDistance = distance;
        sceneRef.drawArcPreview(angle, distance);
        updateOverheatPreview();
    },



    onShieldToggle: (enabled) => {
        sceneRef.ship.shieldsEnabled = enabled;
        sceneRef.ship.drawShield();
        updateOverheatPreview();
    },
    onDoubleDToggle: (enabled) => {
        sceneRef.ship.doubleDEnabled = enabled;
        updateOverheatPreview();
    },

    onAccurateToggle: (enabled) => {
        sceneRef.ship.accurateEnabled = enabled;
        updateOverheatPreview();
    },

    onMultiTargetToggle: (enabled) => {
        sceneRef.ship.multiTargetEnabled = enabled;
        updateOverheatPreview();
    },

    onRadarToggle: (enabled) => {
        sceneRef.isRadarEnabled = enabled;
        if (!enabled && sceneRef.radar) {
            sceneRef.radar.disableRadar();
        }
    },

    onUTurnToggle: (enabled) => {
        sceneRef.isUTurnEnabled = enabled;
        updateOverheatPreview();
    },

    onZoomInput: (zoom) => {
        if (sceneRef && sceneRef.cameras && sceneRef.cameras.main) {
            sceneRef.cameras.main.setZoom(zoom * referenceZoom);
        }
    }
};


