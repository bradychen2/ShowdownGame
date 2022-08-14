import prompts from "prompts";
import Player from "../models/Player";

export const promptOfExchangeHands = async (
  players: Player[],
  currPlayer: Player
) => {
  return prompts([
    {
      type: "number",
      name: "isExchange",
      message: `${currPlayer.name}: would you like to exchange hands with someone? (Yes: 1; No: 0): `,
      validate: (name) =>
        0 <= name && name <= 1
          ? true
          : `Do not type anything other than 0 or 1.`,
    },
    {
      type: (prev) => (prev === 1 ? "number" : null),
      name: "player",
      message: `\n1.${players[0].name}\n2.${players[1].name}\n3.${players[2].name}\n4.${players[3].name}\nWhich player do you want to exchange hands with? (input: 1 ~ 4): `,
      validate: (name) => {
        if (name < 1 || name > 4) {
          return "Plz enter number between 1 to 4";
        }
        if (name === players.indexOf(currPlayer) + 1) {
          return "cannot exchange hands with yourself";
        }
        return true;
      },
    },
  ]);
};