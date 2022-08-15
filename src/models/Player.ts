import Card from "./Card";
import Deck from "./Deck";
import Exchange from "./Exchange";
import prompts from "prompts";
import { SuitsSymbols } from "./Card";
import { faker } from "@faker-js/faker";
import { promptOfExchangeHands } from "../prompts/prompts";

export default abstract class Player {
  private _name: string;
  private _hand: Card[] = [];
  private _points: number = 0;
  private _usedExchange: boolean = false;

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

  protected printHandCards(): string {
    let message = ``;
    this.hand.forEach((card, i) => {
      message += `\n${i + 1}. ${SuitsSymbols[card.suit]} ${card.rank}`;
    });
    return message;
  }

  public abstract nameSelf(): Promise<void> | void;

  public drawCard(deck: Deck): Card | null {
    const draw = deck.cards.pop();
    if (draw !== undefined) this.addHand(draw);
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
    this.usedExchange = true;
    return new Exchange(player1, player2, changeBack);
  }
}

export class HumanPlayer extends Player {
  constructor() {
    super();
  }
  protected async select(): Promise<Card> {
    const userInput: number = await (async () => {
      const res = await prompts({
        type: "number",
        name: "showCard",
        message: `${this.printHandCards()}\n${
          this.name
        }: plz select the card you would like to show: `,
        validate: (name) =>
          name >= 1 && name <= this.hand.length ? true : "invalid number",
      });
      return res.showCard;
    })();
    const showCardIdx = userInput - 1;
    return this.hand.splice(showCardIdx, 1)[0];
  }

  public async nameSelf(): Promise<void> {
    const userInput: string = await (async () => {
      const res = await prompts({
        type: "text",
        name: "name",
        message: "Plz enter your name (not more than 30 chars): ",
        validate: (name: string) => {
          return 0 < name.length && name.length <= 30
            ? true
            : `length of name cannot be longer than 30 chars`;
        },
      });
      console.log(`Hi, ${res.name}!!`);
      return res.name;
    })();
    this.name = userInput;
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
