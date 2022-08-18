import Deck from "./Deck";
import Exchange from "./Exchange";
import { HumanPlayer, AIPlayer } from "./Player";
import Card, { SuitsSymbols } from "./Card";
import { promptsOfCreatePlayer } from "../prompts/prompts";

export default class Game {
  private _players: Array<HumanPlayer | AIPlayer> = [];
  private _deck: Deck;
  private _round = 13;
  private _waitingExchange: Exchange[] = [];

  constructor() {
    this._deck = new Deck();
  }

  /**
   * getter and setter
   */
  public get players(): Array<HumanPlayer | AIPlayer> {
    return this._players;
  }
  public addPlayers(player: HumanPlayer | AIPlayer) {
    this._players.push(player);
  }
  public get deck(): Deck {
    return this._deck;
  }
  public get round(): number {
    return this._round;
  }
  public addWaitingExchange(exchange: Exchange) {
    this._waitingExchange.push(exchange);
  }

  /**
   * Game initiator
   */
  public async initGame(): Promise<void> {
    await this.createPlayers();
    for (const player of this.players) {
      await player.nameSelf();
    }
    this._deck.shuffle();
    while (this._deck.cards.length !== 0) {
      this.players.forEach((player) => {
        player.drawCard(this._deck);
      });
    }
  }

  /**
   * utils of game initiator
   */
  private async createPlayers() {
    const userInput = await promptsOfCreatePlayer();
    const aiCount = 4 - userInput.humanCount;
    for (let i = 1; i <= userInput.humanCount; i += 1) {
      this.players.push(new HumanPlayer());
    }
    for (let i = 1; i <= aiCount; i += 1) {
      this.players.push(new AIPlayer());
    }
  }

  /**
   * Game controller
   */
  public async takeTurns(): Promise<void> {
    const showCards: Card[] = [];
    console.log(`\nROUND - ${14 - this.round}\n`);
    // check if any change back
    if (this._waitingExchange.length !== 0) this.triggerChangeBack();

    for (const player of this.players) {
      // if player hasn't used exchange yet, can decide to exchange hands with someone
      if (!player.usedExchange) {
        const { isExchange, targetPlayerNum } =
          await player.triggerExchangeHands(this.players);
        if (isExchange && targetPlayerNum) {
          const exchange = player.exchangeHands(
            player,
            this.players[targetPlayerNum - 1], // subtract 1 to idx
            this.round - 3 // change back after 3 rounds
          );
          this.addWaitingExchange(exchange);
        }
      }
      // show the selected card
      if (player.hand.length !== 0) {
        const showCard = await player.show();
        showCards.push(showCard);
      }
    }
    this.displayShows(showCards);
    // the winner gets one point in this round
    const winnerThisRound = Card.showdown(showCards);
    winnerThisRound.gainPoints();
    this._round -= 1;
  }

  public endGame(): void {
    let winner: HumanPlayer | AIPlayer = this.players[0];
    console.log(`${winner.name}: ${winner.points} pts`);
    for (let i = 1; i < this.players.length; i += 1) {
      console.log(`${this.players[i].name}: ${this.players[i].points} pts`);
      if (this.players[i].points > winner.points) {
        winner = this.players[i];
      }
    }
    console.log(`===== The winner is ${winner.name}!!! =====`);
  }

  /**
   * utils of Game controller
   */
  private triggerChangeBack(): void {
    this._waitingExchange.forEach((exchange) => {
      if (exchange.changeBackRound === this.round) {
        console.log(
          `change back hands between ${exchange.initiator.name} and ${exchange.target.name}\n`
        );
        exchange.changeBack();
      }
    });
  }
  private displayShows(showCards: Card[]): void {
    console.log("\r");
    for (let i = 0; i < showCards.length; i += 1) {
      const showCard = showCards[i];
      console.log(
        `${showCard.owner.name} shows: ${SuitsSymbols[showCard.suit]} ${
          showCard.rank
        }`
      );
    }
    console.log("\r");
  }
}
