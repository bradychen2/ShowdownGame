import Card from "./Card";
import Deck from "./Deck";
import Exchange from "./Exchange";
import prompts from "prompts";

export default class Player {
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

  private async select(hand: Card[]): Promise<Card> {
    const userInput: number = await (async () => {
      const res = await prompts({
        type: "number",
        name: "showCard",
        message: `${this.printHandCards()}\nPlz select the card you would like to show: `,
        validate: (name) =>
          name >= 1 && name <= hand.length ? true : "invalid number",
      });
      return res.showCard;
    })();
    const showCardIdx = userInput - 1;
    return this.hand.splice(showCardIdx, 1)[0];
  }

  private printHandCards(): string {
    let message = ``;
    this.hand.forEach((card, i) => {
      message += `\n${i + 1}. ${card.suit} ${card.rank}`;
    });
    return message;
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

  public drawCard(deck: Deck): Card | null {
    const draw = deck.cards.pop();
    if (draw !== undefined) this.addHand(draw);
    return draw || null;
  }

  public async show(): Promise<Card> {
    return await this.select(this.hand);
  }

  public gainPoints(): void {
    this.points += 1;
  }

  public exchangeHands(
    player1: Player,
    player2: Player,
    changeBack: number
  ): Exchange {
    console.log(`${player1.name} changes hands with ${player2.name}`);
    const handOfPlayer1 = player1.hand;
    player1.hand = player2.hand;
    player2.hand = handOfPlayer1;
    return new Exchange(player1, player2, changeBack);
  }
}
