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
  [StatType.SHIELD]:       { incrementBase: 10, upgradeBaseIncrement: 2, costOfUpgrade: 50 },
  [StatType.HULL]:         { incrementBase: 15, upgradeBaseIncrement: 3, costOfUpgrade: 60 },
  [StatType.ATTACK_POWER]: { incrementBase: 5,  upgradeBaseIncrement: 1, costOfUpgrade: 70 },
  [StatType.ATTACK_RANGE]: { incrementBase: 10, upgradeBaseIncrement: 2, costOfUpgrade: 40 },
  [StatType.ATTACK_ANGLE]: { incrementBase: 5,  upgradeBaseIncrement: 1, costOfUpgrade: 30 },
  [StatType.MAXSPEED]:     { incrementBase: 10,  upgradeBaseIncrement: 0.2, costOfUpgrade: 80 },
  [StatType.HULL_ARMOR]:   { incrementBase: 2,  upgradeBaseIncrement: 0.5, costOfUpgrade: 55 },
  [StatType.SHIELD_REGEN]: { incrementBase: 1,  upgradeBaseIncrement: 0.2, costOfUpgrade: 65 },
  [StatType.MAXTURNANGLE]: { incrementBase: 5, upgradeBaseIncrement: 1, costOfUpgrade: 75 }   
};


export const EnemyShipTemplates ={
    probe: {
      [StatType.SHIELD]: 0,
      [StatType.HULL]: 10,
      [StatType.ATTACK_POWER]: 10,
      [StatType.ATTACK_RANGE]: 400,
      [StatType.ATTACK_ANGLE]: 360
    },
    viper: {
      [StatType.SHIELD]: 100,
      [StatType.HULL]: 50,
      [StatType.ATTACK_POWER]: 40,
      [StatType.ATTACK_RANGE]: 500,
      [StatType.ATTACK_ANGLE]: 90,
       [StatType.MAXTURNANGLE]:90,
        [StatType.MAXSPEED]: 300

    },
    destroyer: {
      [StatType.SHIELD]: 200,
      [StatType.HULL]: 400,
      [StatType.ATTACK_POWER]: 55,
      [StatType.ATTACK_RANGE]: 500,
      [StatType.ATTACK_ANGLE]: 115,
      [StatType.MAXTURNANGLE]: 60,
      [StatType.MAXSPEED]: 300
    }
}

// Ship definitions only set the base value
export const ShipStatTemplates = {
  standard: {
    image:"ship",
    [StatType.SHIELD]: 100,
    [StatType.HULL]: 100,
    [StatType.ATTACK_POWER]: 50,
    [StatType.ATTACK_RANGE]: 500,
    [StatType.ATTACK_ANGLE]: 90

  },
  cruiser: {
    image:"playable_ozzy",
    [StatType.SHIELD]: 150,
    [StatType.HULL]: 50,
    [StatType.ATTACK_POWER]: 25,
    [StatType.ATTACK_RANGE]: 400,
    [StatType.ATTACK_ANGLE]: 120
  },
  needle: {
    image:"playable_needle",
    [StatType.SHIELD]: 150,
    [StatType.HULL]: 50,
    [StatType.ATTACK_POWER]: 100,
    [StatType.ATTACK_RANGE]: 800,
    [StatType.ATTACK_ANGLE]: 30
  }
};


// Helper to merge base value with defaults
export function createShipStats(baseStats) {
  const shipStats = {};

  // Loop over every defined stat type
  for (const statType of Object.keys(StatDefaults)) {
    const baseValue = statType in baseStats ? baseStats[statType] : 0;

    shipStats[statType] = {
      base: baseValue,
      current: baseValue,
      ...StatDefaults[statType]
    };
  }

  // Copy over any non-stat fields (like image) from baseStats
  for (const [key, value] of Object.entries(baseStats)) {
    if (!(key in StatDefaults)) {
      shipStats[key] = value;
    }
  }

  return shipStats;
}
