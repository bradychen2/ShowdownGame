import internal from "stream";
import Deck from "./Deck";
import Exchange from "./Exchange";
import Player from "./Player";
import Card, { SuitsRanks } from "./Card";
import { promptOfExchangeHands } from "../prompts/prompts";

export default class Game {
  private _players: Player[] = [];
  private _deck: Deck;
  private _round: number = 13;
  private _waitingExchange: Exchange[] = [];

  constructor() {
    this._deck = this.initDeck();
  }
  private initDeck(): Deck {
    const deck = new Deck();
    const suits = ["spade", "heart", "diamond", "club"];
    for (let suit of suits) {
      for (let rank = 1; rank <= 13; rank += 1) {
        deck.addCard(new Card(rank, suit as SuitsRanks));
      }
    }
    return deck;
  }

  /**
   * getter and setter
   */
  public get players(): Player[] {
    return this._players;
  }
  public addPlayers(players: Player) {
    this._players.push(players);
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
    this.createPlayers();
    for (let player of this.players) {
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
  private createPlayers() {
    for (let i = 0; i <= 3; i += 1) {
      this.players.push(new Player());
    }
  }

  /**
   * Game controller
   */
  public async takeTurns(): Promise<void> {
    const showCards: Card[] = [];
    // check if any change back
    this.triggerChangeBack();

    for (let player of this.players) {
      // if player hasn't used exchange yet, can decide to exchange hands with someone
      if (!player.usedExchange) {
        const userInput = await (async () => {
          const res = await promptOfExchangeHands(this.players, player);
          return res;
        })();
        const isExchange: number = userInput.isExchange;
        const targetPlayerNum: number | undefined = userInput.player
          ? userInput.player
          : undefined;
        if (isExchange && targetPlayerNum) {
          const exchange = player.exchangeHands(
            player,
            this.players[targetPlayerNum - 1], // subtract 1 to idx
            this.round + 3 // change back after 3 rounds
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
    const winnerThisRound = Card.showdown(showCards, this.players);
    winnerThisRound.gainPoints();
    this._round -= 1;
  }

  public endGame(): void {
    let winner: Player = this.players[0];
    console.log(`${winner.name}: ${winner.points} pts`);
    for (let i = 1; i < this.players.length; i += 1) {
      console.log(`${this.players[i].name}: ${this.players[i].points} pts`);
      if (this.players[i].points > winner.points) {
        winner = this.players[i];
      }
    }
    console.log(`The winner is ${winner.name}!!!`);
  }

  /**
   * utils of Game controller
   */
  private triggerChangeBack(): void {
    this._waitingExchange.forEach((exchange) => {
      if (exchange.changeBackRound === this.round) {
        console.log(
          `change back hands between ${exchange.initiator} and ${exchange.target}\n`
        );
        exchange.changeBack();
      }
    });
  }
  private displayShows(showCards: Card[]): void {
    console.log("\r");
    for (let i = 0; i < showCards.length; i += 1) {
      const player = this.players[i];
      const showCard = showCards[i];
      console.log(`${player.name} shows: ${showCard.suit} ${showCard.rank}`);
    }
    console.log("\r");
  }
}
