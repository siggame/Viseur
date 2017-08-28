import partial from "src/core/partial";
import { BaseElement, IBaseElementArgs } from "src/core/ui/base-element";
import * as utils from "src/utils";
import { viseur } from "src/viseur";
import { BaseGame } from "../base-game";
import "./gameOverScreen.scss";
import itemHbs from "./gameOverScreenItem.hbs";

/** A screen that overlays the renderer when the game is over */
export class GameOverScreen extends BaseElement {
    /** The game this is a game over screen for */
    public readonly game: BaseGame;

    /** The container to display winners in */
    private readonly winnersElement: JQuery<HTMLElement>;

    /** The container to display losers in */
    private readonly losersElement: JQuery<HTMLElement>;

    /** If this has been built (filled with the game over information) */
    private built: boolean = false;

    /** The items containing winners and losers */
    private readonly items: Array<JQuery<HTMLElement>> = [];

    /**
     * Initialized the game over screen
     * @param {object} args - BaseElement init args
     */
    constructor(args: IBaseElementArgs & {
        /** The game this will be a game over screen for */
        game: BaseGame,
    }) {
        super(args);

        this.game = args.game;
        this.winnersElement = this.element.find(".game-over-winners");
        this.losersElement = this.element.find(".game-over-losers");

        this.hide();

        viseur.timeManager.on("ended", () => {
            this.show();
        });
    }

    /**
     * Shows this game over screen
     */
    public show(): void {
        if (!this.built) {
            this.buildItems();
        }

        this.element.removeClass("collapsed");
    }

    /**
     * Hides this game over screen
     */
    public hide(): void {
        this.element.addClass("collapsed");
    }

    /**
     * Re-colors the items in the game over screen
     */
    public recolor(): void {
        if (!this.built) {
            return; // nothing to recolor... yet
        }

        for (let i = 0; i < this.game.players.length; i++) {
            const player = this.game.players[i];
            const color = this.game.getPlayersColor(player);

            this.items[i].find(".bg-wrapper")
                .css("background-color", color.opaquer(0.375).hex()) // TODO: rgba seems to be dropped from color module
                .css("color", utils.getContrastingColor(color).hex()); // same here
        }
    }

    protected getTemplate(): Handlebars {
        return require("./gameOverScreen.hbs");
    }

    /**
     * [re]builds the winners and losers containers
     */
    private buildItems(): void {
        // empty them out in case of re-build
        this.winnersElement.html("");
        this.losersElement.html("");

        this.items.length = 0; // empty array for [re]build
        const gameState = this.game.current || this.game.next;
        for (const player of gameState.players) {
            const color = this.game.getPlayersColor(player);

            const item = {
                name: utils.escapeHTML(player.name),
                wonOrLost: player.won ? "Won" : "Lost",
                reason: player.won ? player.reasonWon : player.reasonLost,
                bgColor: color.opaquer(0.375).rgb(),
                textColor: utils.getContrastingColor(color).rgb(),
            };

            const list = player.won
                ? this.winnersElement
                : this.losersElement;

            this.items.push(partial(itemHbs, item, list));
        }

        this.losersElement.css("display", this.losersElement.html() === ""
            ? "none"
            : "block",
        );

        if (this.winnersElement.html() === "") { // then there are no winners, it's a tie
            partial(itemHbs, {
                name: "Game Over -",
                wonOrLost: "Tie",
                reason: gameState.players[0].reasonLost,
                // for draws all players should have the same reasonLost
                //  so using the last one's reasonLost should be the same for any of them
            }, this.winnersElement);
        }

        this.recolor();
        this.built = true;
    }
}
