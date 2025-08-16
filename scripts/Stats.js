export const StatType = Object.freeze({
  SHIELD: 'shield',
  HULL: 'hull',
  MAXTURNANGLE: 'maxTurnAngle',
  ATTACK_POWER: 'attackPower',
  ATTACK_RANGE: 'attackRange',
  ATTACK_ANGLE: 'attackAngle',
  MAXSPEED: 'maxSpeed',
  HULL_ARMOR: 'hullArmor',
  SHIELD_REGEN: 'shieldRegen',
});

export const StatDefaults = {
  [StatType.MAXSPEED]:     { displayName:"Max Speed", incrementBase: 10,  upgradeBaseIncrement: 0.2, costOfUpgrade: 80, default: 5, min: 3, max: 10 },
  [StatType.MAXTURNANGLE]: { displayName:"Max Turn Angle", incrementBase: 5, upgradeBaseIncrement: 1, costOfUpgrade: 75, default: 90, min: 30, max: 360 },   
  [StatType.HULL]:         { displayName:"Hull", incrementBase: 15, upgradeBaseIncrement: 3, costOfUpgrade: 60, default: 100, min: 40, max: 1000 },
  [StatType.HULL_ARMOR]:   { displayName:"Hull Armor", incrementBase: 2,  upgradeBaseIncrement: 0.5, costOfUpgrade: 55, default: 0, min: 0, max: 50 },
  [StatType.SHIELD]:       { displayName:"Energy Shields", incrementBase: 10, upgradeBaseIncrement: 2, costOfUpgrade: 50, default: 50, min: 0, max: 1000 },
  [StatType.SHIELD_REGEN]: { displayName:"Shield Regeneration", incrementBase: 1, upgradeBaseIncrement: 0.2, costOfUpgrade: 65, default: 0, min: 0, max: 50 },
  [StatType.ATTACK_POWER]: { displayName:"Weapons Power", incrementBase: 5, upgradeBaseIncrement: 1, costOfUpgrade: 70, default: 40, min: 10, max: 200 },
  [StatType.ATTACK_RANGE]: { displayName:"Weapons Range", incrementBase: 10, upgradeBaseIncrement: 2, costOfUpgrade: 40, default: 500, min: 100, max: 2000 },
  [StatType.ATTACK_ANGLE]: { displayName:"Weapons Angle", incrementBase: 5, upgradeBaseIncrement: 1, costOfUpgrade: 30, default: 90, min: 10, max: 360 },
};


export const EnemyShipTemplates ={
    basic_turret: {
      editorName: "basic_turret",
      spriteKey: "enemy_basic_turret",
      [StatType.SHIELD]: 0,
      [StatType.HULL]: 10,
      [StatType.ATTACK_POWER]: 30,
      [StatType.ATTACK_RANGE]: 1100,
      [StatType.ATTACK_ANGLE]: 90,
      [StatType.MAXSPEED]: 0,
      isTurret: true,
    },
    probe: {
      editorName: "probe",
      spriteKey: "enemy_probe",
      [StatType.SHIELD]: 0,
      [StatType.HULL]: 10,
      [StatType.ATTACK_POWER]: 10,
      [StatType.ATTACK_RANGE]: 400,
      [StatType.ATTACK_ANGLE]: 360,
      [StatType.MAXSPEED]: 90,
    },
    viper: {
      editorName: "viper",
      spriteKey: "enemy_viper",
      [StatType.SHIELD]: 100,
      [StatType.HULL]: 50,
      [StatType.ATTACK_POWER]: 40,
      [StatType.ATTACK_RANGE]: 500,
      [StatType.ATTACK_ANGLE]: 90,
       [StatType.MAXTURNANGLE]:90,
        [StatType.MAXSPEED]: 300

    },
    destroyer: {
      editorName: "destroyer",
      spriteKey: "enemy_kamikaze",
      [StatType.SHIELD]: 200,
      [StatType.HULL]: 400,
      [StatType.ATTACK_POWER]: 55,
      [StatType.ATTACK_RANGE]: 500,
      [StatType.ATTACK_ANGLE]: 115,
      [StatType.MAXTURNANGLE]: 60,
      [StatType.MAXSPEED]: 300
    },
     ghost: {
    editorName: "ghost",
    spriteKey: "enemy_ghost",
    [StatType.SHIELD]: 20,
    [StatType.HULL]: 30,
    [StatType.ATTACK_POWER]: 20,
    [StatType.ATTACK_RANGE]: 400,
    [StatType.ATTACK_ANGLE]: 120,
    [StatType.MAXTURNANGLE]: 180,
    [StatType.MAXSPEED]: 350,
  },

  deathstar: {
    editorName: "deathstar",
    spriteKey: "enemy_deathstar",
    [StatType.SHIELD]: 800,
    [StatType.HULL]: 1000,
    [StatType.ATTACK_POWER]: 150,
    [StatType.ATTACK_RANGE]: 1500,
    [StatType.ATTACK_ANGLE]: 360,
    [StatType.MAXTURNANGLE]: 0,
    [StatType.MAXSPEED]: 0,
  },

  carrier: {
    editorName: "carrier",
    spriteKey: "enemy_carrier",
    [StatType.SHIELD]: 400,
    [StatType.HULL]: 800,
    [StatType.ATTACK_POWER]: 20,
    [StatType.ATTACK_RANGE]: 600,
    [StatType.ATTACK_ANGLE]: 120,
    [StatType.MAXTURNANGLE]: 40,
    [StatType.MAXSPEED]: 300,
  },

  mine: {
    editorName: "mine",
    spriteKey: "enemy_mine",
    [StatType.SHIELD]: 0,
    [StatType.HULL]: 10,
    [StatType.ATTACK_POWER]: 200,
    [StatType.ATTACK_RANGE]: 200,
    [StatType.ATTACK_ANGLE]: 360,
    [StatType.MAXSPEED]: 0,
  },

  turret: {
    editorName: "turret",
    spriteKey: "enemy_turret",
    [StatType.SHIELD]: 100,
    [StatType.HULL]: 150,
    [StatType.ATTACK_POWER]: 60,
    [StatType.ATTACK_RANGE]: 1000,
    [StatType.ATTACK_ANGLE]: 100,
    [StatType.MAXSPEED]: 0,
    isTurret: true,

  },

  advanced_viper: {
    editorName: "advanced_viper",
    spriteKey: "enemy_advanced_viper",
    [StatType.SHIELD]: 150,
    [StatType.HULL]: 70,
    [StatType.ATTACK_POWER]: 60,
    [StatType.ATTACK_RANGE]: 600,
    [StatType.ATTACK_ANGLE]: 100,
    [StatType.MAXTURNANGLE]: 100,
    [StatType.MAXSPEED]: 500,
  },

  dreadnoght: {
    editorName: "dreadnoght",
    spriteKey: "enemy_dreadnoght",
    [StatType.SHIELD]: 1000,
    [StatType.HULL]: 1200,
    [StatType.ATTACK_POWER]: 180,
    [StatType.ATTACK_RANGE]: 1300,
    [StatType.ATTACK_ANGLE]: 150,
    [StatType.MAXTURNANGLE]: 30,
    [StatType.MAXSPEED]: 400,
  },
}

// Ship definitions only set the base value
export const ShipStatTemplates = {
  standard: {
    image:"ship",
    [StatType.SHIELD]: 100,
    [StatType.HULL]: 100,
    [StatType.ATTACK_POWER]: 50,
    [StatType.ATTACK_RANGE]: 500,
    [StatType.ATTACK_ANGLE]: 90,
    [StatType.MAXTURNANGLE]: 90,
    [StatType.MAXSPEED]: 5

  },
  cruiser: {
    image:"playable_ozzy",
    [StatType.SHIELD]: 150,
    [StatType.HULL]: 50,
    [StatType.ATTACK_POWER]: 25,
    [StatType.ATTACK_RANGE]: 400,
    [StatType.ATTACK_ANGLE]: 120,
        [StatType.MAXTURNANGLE]: 90,
    [StatType.MAXSPEED]: 5
  },
  needle: {
    image:"playable_needle",
    [StatType.HULL]: 50,
    [StatType.ATTACK_POWER]: 100,
    [StatType.ATTACK_RANGE]: 800,
    [StatType.ATTACK_ANGLE]: 30,
  },
  ball: {
    image:"playable_ball",
    [StatType.HULL]: 50,
    [StatType.ATTACK_POWER]: 50,
    [StatType.ATTACK_RANGE]: 180,
    [StatType.ATTACK_ANGLE]: 360,
  }
};


// Helper to merge base value with defaults
export function createShipStats(baseStats) {
  const shipStats = {};

  for (const statType of Object.keys(StatDefaults)) {
    const defaults = StatDefaults[statType];
    const baseValue = statType in baseStats ? baseStats[statType] : defaults.default;

    shipStats[statType] = {
      base: baseValue,
      current: baseValue,
      ...defaults
    };
  }

  // Copy over any non-stat fields (like image)
  for (const [key, value] of Object.entries(baseStats)) {
    if (!(key in StatDefaults)) {
      shipStats[key] = value;
    }
  }

  return shipStats;
}
