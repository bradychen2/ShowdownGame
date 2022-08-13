import Player from "./Player";

export default class Exchange {
  private _initiator: Player;
  private _target: Player;
  private _changeBackRound: number;

  public get initiator(): Player {
    return this._initiator;
  }
  public get target(): Player {
    return this._target;
  }
  public get changeBackRound(): number {
    return this._changeBackRound;
  }

  constructor(initiator: Player, target: Player, changeBack: number) {
    this._initiator = initiator;
    this._target = target;
    this._changeBackRound = changeBack;
  }

  public changeBack(): void {
    const handOfInitiator = this.initiator.hand;
    this.initiator.hand = this.target.hand;
    this.target.hand = handOfInitiator;
  }
}
