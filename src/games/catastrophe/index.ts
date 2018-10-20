// Do not modify this file
import { Game } from "./game";
import { HumanPlayer } from "./human-player";
import { Pane } from "./pane";

Game.prototype.namespace = {
    Game,
    Pane: Pane as any, // tslint:disable-line:no-any
    HumanPlayer,
};

/** The namespace variable expected by all games for this Catastrophe game. */
export const Namespace = Game.prototype.namespace;
module.exports = Namespace;
