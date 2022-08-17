import Card from "./Card";

export default class Deck {
  private _cards: Card[];

  constructor() {
    this._cards = [];
  }

  public get cards(): Card[] {
    return this._cards;
  }

  public addCard(card: Card): void {
    this.cards.push(card);
  }

  public shuffle(): void {
    // Fisher and Yates Algo
    for (let i = this.cards.length - 1; i >= 0; i -= 1) {
      const randomIdx = Math.floor(Math.random() * (i + 1));
      const randomCard: Card = this.cards[randomIdx];
      this.cards[randomIdx] = this.cards[i];
      this.cards[i] = randomCard;
    }
  }
}
