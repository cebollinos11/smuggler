// Enemies
const basicEnemies = ["probe", "viper", "basic_turret"];
const advancedEnemies = ["mine", "turret", "advanced_viper", "destroyer"];
const eliteEnemies = ["ghost", "carrier", "deathstar", "dreadnoght"];

// Get smoothly changing weights for each tier
function getEnemyProbabilities(difficulty) {
  // Clamp to range 1–10
  const d = Math.max(1, Math.min(difficulty, 10));

  // These formulas gradually decrease/increase tiers
  const basic = Math.max(0, 1 - (d - 1) * 0.12);    // Starts 1.0, ends ~0.0
  const advanced = Math.min(1, (d - 2) * 0.12);     // Starts small, peaks mid-game
  const elite = Math.max(0, (d - 5) * 0.12);        // Starts appearing at diff ~5

  // Normalize so total = 1
  const total = basic + advanced + elite;
  return {
    basic: basic / total,
    advanced: advanced / total,
    elite: elite / total
  };
}

// Weighted random pick
export function getRandomEnemy(difficulty) {
  const { basic, advanced, elite } = getEnemyProbabilities(difficulty);
  const roll = Math.random();
  if (roll < basic) {
    return basicEnemies[Math.floor(Math.random() * basicEnemies.length)];
  } else if (roll < basic + advanced) {
    return advancedEnemies[Math.floor(Math.random() * advancedEnemies.length)];
  } else {
    return eliteEnemies[Math.floor(Math.random() * eliteEnemies.length)];
  }
}


