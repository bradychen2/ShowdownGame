import Player from "./Player";

export enum Suits {
  "spade" = 4,
  "heart" = 3,
  "diamond" = 2,
  "club" = 1,
}

export type SuitsRanks = keyof typeof Suits;

export default class Card {
  private _rank: number;
  private _suit: SuitsRanks;

  public get suit(): SuitsRanks {
    return this._suit;
  }

  public get rank(): number {
    return this._rank;
  }

  constructor(rank: number, suit: SuitsRanks) {
    if (1 <= rank && rank <= 13) {
      this._rank = rank;
    } else {
      throw Error(`input rank is out of range, input: ${rank}`);
    }
    if (!(suit in Suits)) {
      throw Error(`input suit is invalid, input: ${suit}`);
    } else {
      this._suit = suit;
    }
  }

  public static showdown(showCard: Card[], players: Player[]): Player {
    let biggest: Card = showCard[0];
    showCard.forEach((card) => {
      if (biggest !== card) {
        if (card.rank > biggest.rank) biggest = card;
        else if (card.rank === biggest.rank) {
          if (Suits[card.suit] > Suits[biggest.suit]) {
            biggest = card;
          }
        }
      }
    });
    const idxOfBiggest = showCard.indexOf(biggest);
    return players[idxOfBiggest];
  }
}
