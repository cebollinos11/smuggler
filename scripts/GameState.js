export class GameStateC {
  constructor() {
    this.shipData = null;
    this.run = {
      currentLevel: 1,
      score: 0,
      credits: 0,
      currentMission: null // holds the selected mission
    };
  }
  reset() {
    this.shipData = null;
    this.run = {
        currentLevel: 1,
        score: 0,
        credits: 0,
        currentMission: null
  };
}
}
export let GameState = new GameStateC(); // Singleton instance for global access