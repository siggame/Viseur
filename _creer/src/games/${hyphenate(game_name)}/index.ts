// Do not modify this file
import { Game } from "./game";
import { HumanPlayer } from "./human-player";
import { Pane } from "./pane";

Game.prototype.namespace = {
    Game,
    Pane,
    HumanPlayer,
};

export const Namespace = Game.prototype.namespace;
module.exports = Namespace;
