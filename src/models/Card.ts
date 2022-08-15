import Player from "./Player";

export enum Suits {
  "spade" = 4,
  "heart" = 3,
  "diamond" = 2,
  "club" = 1,
}
export enum SuitsSymbols {
  "spade" = "♠️",
  "heart" = "♥️",
  "diamond" = "♦️",
  "club" = "♣️",
}

export const RuleMap: Map<number, number> = new Map([[1, 14]]);

export type SuitsRanks = keyof typeof Suits;

export default class Card {
  private _rank: number;
  private _suit: SuitsRanks;
  private _owner: Player;

  public get suit(): SuitsRanks {
    return this._suit;
  }

  public get rank(): number {
    return this._rank;
  }

  public get owner(): Player {
    return this._owner;
  }
  public set owner(player: Player) {
    this._owner = player;
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
        // convert 1 to Ace
        const cardRank: number =
          card.rank === 1 ? (RuleMap.get(card.rank) as number) : card.rank;
        const biggestRank: number =
          biggest.rank === 1
            ? (RuleMap.get(biggest.rank) as number)
            : biggest.rank;
        if (cardRank > biggestRank) biggest = card;
        else if (cardRank === biggestRank) {
          if (Suits[card.suit] > Suits[biggest.suit]) {
            biggest = card;
          }
        }
      }
    });
    console.log(`${biggest.owner.name} got this round!!`);
    return biggest.owner;
  }
}
