import { getRandomEnemy } from "../enemies/enemySpawner.js";

export function generateLevel({
  width = 8000,
  height = 6000,
  borderSize = 100,
  asteroidCount = 20,
  coinCount = 5,
  enemyCount = 3,
  minEnemyDistance = 150,
  minCoinDistance = 50,
  borderSegmentsPerSide = 1,
  difficulty = 1
} = {}) {
  const level = {
    title: "Trouble in the Asteroid Belt",
    createdby: "The architect",
    difficulty: "Medium",
    playerStart: { x: width / 2, y: height / 2 },
    exit: { x: getRandomInt(borderSize, width - borderSize), y: getRandomInt(borderSize, height - borderSize) },
    asteroids: [],
    coins: [],
    enemies: [],
    borderpivots: []
  };

  level.borderpivots = generateBorderPivots(width, height, borderSegmentsPerSide);

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function isOverlapping(pos, list, minDist) {
    return list.some(item => distance(pos, item) < minDist);
  }

  function isTooCloseToStartOrExit(pos, minDist = 200) {
    return distance(pos, level.playerStart) < minDist || distance(pos, level.exit) < minDist;
  }

  function isInsideBorders(pos) {
    return (
      pos.x >= borderSize &&
      pos.x <= width - borderSize &&
      pos.y >= borderSize &&
      pos.y <= height - borderSize
    );
  }

  // Asteroids
  while (level.asteroids.length < asteroidCount) {
    const pos = { x: getRandomInt(borderSize, width - borderSize), y: getRandomInt(borderSize, height - borderSize) };
    if (
      !isTooCloseToStartOrExit(pos) &&
      !isOverlapping(pos, level.asteroids, 40)
    ) {
      level.asteroids.push(pos);
    }
  }

  // Coins
  while (level.coins.length < coinCount) {
    const pos = { x: getRandomInt(borderSize, width - borderSize), y: getRandomInt(borderSize, height - borderSize) };
    if (
      !isTooCloseToStartOrExit(pos) &&
      !isOverlapping(pos, level.asteroids, 40) &&
      !isOverlapping(pos, level.coins, minCoinDistance)
    ) {
      level.coins.push(pos);
    }
  }

// Enemies
const basicEnemies = ["probe", "viper", "basic_turret"];
const advancedEnemies = ["mine", "turret", "advanced_viper", "destroyer"];
const eliteEnemies = ["ghost", "carrier", "deathstar", "dreadnoght"];


  const enemyTypes = [
    ...basicEnemies,
    ...(difficulty >= 3 ? advancedEnemies : []),
    ...(difficulty >= 6 ? eliteEnemies : [])
  ];


  while (level.enemies.length < enemyCount) {
    const pos = { x: getRandomInt(borderSize, width - borderSize), y: getRandomInt(borderSize, height - borderSize) };
    if (
      !isTooCloseToStartOrExit(pos) &&
      distance(pos, level.playerStart) > minEnemyDistance &&
      !isOverlapping(pos, level.asteroids, 30)
    ) {
      level.enemies.push({
        x: pos.x,
        y: pos.y,
        enemy_type: getRandomEnemy(difficulty)
            });
    }
  }

  return level;
}


// Border mesh generator (supports more than 4 points)
function generateBorderPivots(width, height, segmentsPerSide = 1) {
  const pivots = [];

  function pushSegment(x1, y1, x2, y2, count) {
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      pivots.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t
      });
    }
  }

  // Top side
  pushSegment(0, 0, width, 0, segmentsPerSide + 1);
  // Right side
  pushSegment(width, 0, width, height, segmentsPerSide + 1);
  // Bottom side
  pushSegment(width, height, 0, height, segmentsPerSide + 1);
  // Left side
  pushSegment(0, height, 0, 0, segmentsPerSide + 1);

  // Remove duplicates at corners
  return pivots.filter((point, index, self) =>
    index === 0 || point.x !== self[index - 1].x || point.y !== self[index - 1].y
  );
}

// Utility
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
