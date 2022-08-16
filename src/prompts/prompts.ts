import prompts from "prompts";
import Player, { AIPlayer, HumanPlayer } from "../models/Player";

export const promptOfExchangeHands = async (
  players: Array<HumanPlayer | AIPlayer>,
  currPlayer: HumanPlayer
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

export const promptsOfCreatePlayer = async () => {
  return prompts({
    type: "number",
    name: "humanCount",
    message: `How many human players in this game? `,
    validate: (name) => {
      if (name < 1) return `Need at least 1 human player`;
      if (name > 4) return `At most 4 players in a game`;
      return true;
    },
  });
};

export const promptsOfSelectCard = async (player: Player) => {
  return prompts({
    type: "number",
    name: "showCard",
    message: `${player.printHandCards()}\n${
      player.name
    }: plz select the card you would like to show: `,
    validate: (name) =>
      name >= 1 && name <= player.hand.length ? true : "invalid number",
  });
};

export const promptsOfNameSelf = async () => {
  return prompts({
    type: "text",
    name: "name",
    message: "Plz enter your name (not more than 30 chars): ",
    validate: (name: string) => {
      return 0 < name.length && name.length <= 30
        ? true
        : `length of name cannot be longer than 30 chars`;
    },
  });
};
