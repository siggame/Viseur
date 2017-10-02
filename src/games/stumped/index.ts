// Do not modify this file
import { IBaseGameNamespace } from "src/viseur/game";
import { Game } from "./game";
import { HumanPlayer } from "./human-player";
import { Pane } from "./pane";

Game.prototype.namespace = {
    Game,
    Pane,
    HumanPlayer,
} as IBaseGameNamespace;

export const Namespace = Game.prototype.namespace;
module.exports = Namespace;
