import { escape } from "lodash";
import { partial } from "src/core/partial";
import { BaseElement, BaseElementArgs } from "src/core/ui/base-element";
import { getContrastingColor, Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { BaseGame } from "../base-game";
import * as gameOverScreenItemHbs from "./game-over-screen-item.hbs";
import * as gameOverScreenHbs from "./game-over-screen.hbs";
import "./game-over-screen.scss";

/** A screen that overlays the renderer when the game is over. */
export class GameOverScreen extends BaseElement {
    /** The game this is a game over screen for. */
    public readonly game: BaseGame;

    /** The container to display winners in. */
    private readonly winnersElement = this.element.find(".game-over-winners");

    /** The container to display losers in. */
    private readonly losersElement = this.element.find(".game-over-losers");

    /** If this has been built (filled with the game over information). */
    private built = false;

    /** The items containing winners and losers. */
    private readonly items: JQuery[] = [];

    /**
     * Initialized the game over screen.
     *
     * @param args - BaseElement init args.
     */
    constructor(
        args: Immutable<BaseElementArgs> & {
            /** The game this will be a game over screen for. */
            game: BaseGame;

            /** The Viseur instance we are a part of. */
            viseur: Viseur;
        },
    ) {
        super(args, gameOverScreenHbs);

        this.game = args.game;

        this.hide();

        args.viseur.timeManager.eventEnded.on(() => {
            this.show();
        });
    }

    /** Shows this game over screen. */
    public show(): void {
        if (!this.built) {
            this.buildItems();
        }

        this.element.removeClass("collapsed");
    }

    /** Hides this game over screen. */
    public hide(): void {
        this.element.addClass("collapsed");
    }

    /** Re-colors the items in the game over screen. */
    public recolor(): void {
        if (!this.built) {
            return; // nothing to recolor... yet
        }

        for (const [i, player] of this.game.players.entries()) {
            const color = this.game.getPlayersColor(player);

            this.items[i]
                .find(".bg-wrapper")
                .css("background-color", color.opaquer(0.375).string())
                .css("color", getContrastingColor(color).string());
        }
    }

    /** [re]builds the winners and losers containers. */
    private buildItems(): void {
        // empty them out in case of re-build
        this.winnersElement.html("");
        this.losersElement.html("");

        this.items.length = 0; // empty array for [re]build
        const gameState = this.game.getCurrentMostState();
        for (const player of gameState.players) {
            const color = this.game.getPlayersColor(player);

            const item = {
                name: escape(player.name),
                wonOrLost: player.won ? "Won" : "Lost",
                reason: player.won ? player.reasonWon : player.reasonLost,
                bgColor: color.opaquer(0.375).rgb(),
                textColor: getContrastingColor(color).rgb(),
            };

            const list = player.won ? this.winnersElement : this.losersElement;

            this.items.push(partial(gameOverScreenItemHbs, item, list));
        }

        this.losersElement.css(
            "display",
            this.losersElement.html() === "" ? "none" : "block",
        );

        if (this.winnersElement.html() === "") {
            // then there are no winners, it's a tie
            partial(
                gameOverScreenItemHbs,
                {
                    name: "Game Over -",
                    wonOrLost: "Tie",
                    reason: gameState.players[0].reasonLost,
                    // For draws all players should have the same reasonLost
                    //  so using the last one's reasonLost should be the same for
                    //  any of them.
                },
                this.winnersElement,
            );
        }

        this.recolor();
        this.built = true;
    }
}
