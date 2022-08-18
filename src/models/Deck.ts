import Card, { SuitsRanks } from "./Card";
export default class Deck {
  private _cards: Card[];

  constructor() {
    this._cards = [];
    const suits = ["spade", "heart", "diamond", "club"];
    for (const suit of suits) {
      for (let rank = 1; rank <= 13; rank += 1) {
        this.addCard(new Card(rank, suit as SuitsRanks));
      }
    }
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
