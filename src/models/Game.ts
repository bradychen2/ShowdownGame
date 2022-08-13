import internal from "stream";
import Deck from "./Deck";
import Exchange from "./Exchange";
import Player from "./Player";
import Card, { Suits, SuitsRanks } from "./Card";
import prompts from "prompts";

export default class Game {
  private _players: Player[];
  private _deck: Deck;
  private _round: number = 13;
  private _waitingExchange: Exchange[];

  constructor() {
    this._deck = this.initDeck();
  }
  private initDeck(): Deck {
    const deck = new Deck();
    const suitsKeys = Object.keys(Suits);
    for (let suit of suitsKeys) {
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
  public initGame(players: Player[]): void {
    players.forEach(async (player) => {
      await player.nameSelf();
    });
    this._deck.shuffle();
    while (this._deck.cards.length !== 0) {
      players.forEach((player) => {
        player.drawCard(this._deck);
      });
    }
  }
  /**
   * Game controller
   */
  public takeTurns(players: Player[]): void {
    const showCards: Card[] = [];
    this.triggerChangeBack();
    players.forEach(async (player) => {
      if (!player.usedExchange) {
        const userInput = await (async () => {
          const res = await prompts([
            {
              type: "number",
              name: "isExchange",
              message:
                "Would you like to exchange hands with someone? (Yes: 1; No: 0): ",
              validate: (name) =>
                0 <= name && name <= 1
                  ? true
                  : `Do not type anything other than 0 or 1.`,
            },
            {
              type: "number",
              name: "player",
              message: `
								1.${players[0].name}\n
								2.${players[1].name}\n
								3.${players[2].name}\n
								4.${players[3].name}\n
								Which player do you want to exchange hands with? (input: 1 ~ 4): 
								`,
              validate: (name) => {
                if (1 >= name && name >= 4) {
                  return "Plz enter number between 1 to 4";
                }
                if (name === this.players.indexOf(player) + 1) {
                  return "cannot exchange hands with yourself";
                }
                return true;
              },
            },
          ]);
          return res;
        })();
        const isExchange: number = userInput.isExchange;
        const targetPlayer: number = userInput.player - 1;
        if (isExchange) {
          const exchange = player.exchangeHands(
            player,
            this.players[targetPlayer],
            this.round + 3 // change back after 3 rounds
          );
          this.addWaitingExchange(exchange);
        }
      }
      const showCard = await player.show();
      showCards.push(showCard);
    });
    this.displayShows(showCards);
    const winnerThisRound = Card.showdown(showCards, this.players);
    winnerThisRound.gainPoints();
    this._round -= 1;
  }
  public endGame(): void {
    let winner: Player = this.players[0];
    for (let i = 1; i < this.players.length; i += 1) {
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
          `change back hands between ${exchange.initiator} and ${exchange.target}`
        );
        exchange.changeBack();
      }
    });
  }
  private displayShows(showCards: Card[]): void {
    for (let i = 0; i < showCards.length; i += 1) {
      const player = this.players[i];
      const showCard = showCards[i];
      console.log(`${player.name} shows: ${showCard.suit} ${showCard.rank}`);
    }
  }
}
