import Game from "./models/Game";

async function main() {
  const game = new Game();
  await game.initGame();
  while (game.round > 0) {
    await game.takeTurns();
  }
  game.endGame();
}

main();
