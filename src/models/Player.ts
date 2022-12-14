import Card from "./Card";
import Deck from "./Deck";
import Exchange from "./Exchange";
import { SuitsSymbols } from "./Card";
import { faker } from "@faker-js/faker";
import {
  promptOfExchangeHands,
  promptsOfSelectCard,
  promptsOfNameSelf,
} from "../prompts/prompts";

export default abstract class Player {
  private _name: string;
  private _hand: Card[] = [];
  private _points = 0;
  private _usedExchange = false;

  public get name(): string {
    return this._name;
  }
  public set name(name: string) {
    this._name = name;
  }

  public get hand(): Card[] {
    return this._hand;
  }
  public set hand(hand: Card[]) {
    this._hand = hand;
  }
  public addHand(card: Card): void {
    if (this._hand.length > 13) {
      throw Error(`cannot draw more than 13 cards`);
    }
    this._hand.push(card);
  }

  public get points(): number {
    return this._points;
  }
  public set points(point: number) {
    this._points = point;
  }

  public get usedExchange(): boolean {
    return this._usedExchange;
  }
  public set usedExchange(value: boolean) {
    this._usedExchange = value;
  }

  protected abstract select(): Card | Promise<Card>;

  public printHandCards(): string {
    let message = ``;
    this.hand.forEach((card, i) => {
      message += `\n${i + 1}. ${SuitsSymbols[card.suit]} ${card.rank}`;
    });
    return message;
  }

  public abstract nameSelf(): Promise<void> | void;

  public drawCard(deck: Deck): Card | null {
    const draw = deck.cards.pop();
    if (draw !== undefined) {
      this.addHand(draw);
      draw.owner = this;
    }
    return draw || null;
  }

  public async show(): Promise<Card> {
    return await this.select();
  }

  public gainPoints(): void {
    this.points += 1;
  }

  public abstract triggerExchangeHands(players: Array<AIPlayer | HumanPlayer>):
    | {
        isExchange: number;
        targetPlayerNum: number | undefined;
      }
    | Promise<{
        isExchange: number;
        targetPlayerNum: number | undefined;
      }>;

  public exchangeHands(
    player1: AIPlayer | HumanPlayer,
    player2: AIPlayer | HumanPlayer,
    changeBack: number
  ): Exchange {
    console.log(`${player1.name} changes hands with ${player2.name}`);
    const handOfPlayer1 = player1.hand;
    player1.hand = player2.hand;
    player2.hand = handOfPlayer1;
    for (const card of player1.hand) {
      card.owner = player1;
    }
    for (const card of player2.hand) {
      card.owner = player2;
    }
    this.usedExchange = true;
    return new Exchange(player1, player2, changeBack);
  }
}

export class HumanPlayer extends Player {
  constructor() {
    super();
  }

  protected async select(): Promise<Card> {
    const userInput = await promptsOfSelectCard(this);
    const showCardIdx: number = userInput.showCard - 1;
    return this.hand.splice(showCardIdx, 1)[0];
  }

  public async nameSelf(): Promise<void> {
    const userInput = await promptsOfNameSelf();
    console.log(`Hi, ${userInput.name}!!`);
    this.name = userInput.name;
  }

  public async triggerExchangeHands(players: Array<AIPlayer | HumanPlayer>) {
    const userInput = await promptOfExchangeHands(players, this);
    const isExchange: number = userInput?.isExchange;
    const targetPlayerNum: number | undefined = userInput?.player
      ? userInput.player
      : undefined;
    return { isExchange, targetPlayerNum };
  }
}

export class AIPlayer extends Player {
  constructor() {
    super();
  }

  protected select(): Card {
    const showCardIdx: number = Math.floor(Math.random() * this.hand.length);
    return this.hand.splice(showCardIdx, 1)[0];
  }

  public nameSelf(): void | Promise<void> {
    this.name = faker.name.fullName();
  }

  public triggerExchangeHands(players: Array<AIPlayer | HumanPlayer>) {
    const isExchange = Math.floor(Math.random() * 2);
    const randomTarget = Math.floor(Math.random() * 5);
    const targetPlayerNum =
      randomTarget - 1 !== players.indexOf(this) ? randomTarget : undefined;
    return { isExchange, targetPlayerNum };
  }
}
