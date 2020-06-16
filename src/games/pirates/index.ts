// Do not modify this file
import { Game } from "./game";
import { HumanPlayer } from "./human-player";
import { Pane } from "./pane";

Game.prototype.namespace = {
    Game,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    Pane: Pane as any,
    HumanPlayer,
};

/** The namespace variable expected by all games for this Pirates game. */
export const namespace = Game.prototype.namespace;
