import { Immutable, UnknownObject } from "src/utils";
import { JoueurOrder } from "src/viseur/joueur";
import { BaseGame } from "./base-game";
import { BaseGameObject } from "./base-game-object";

/** The base class all HumanPlayers inherit from in each game. */
export class BaseHumanPlayer {
    /**
     * Checks if this human player's logic is implemented, so humans can play this game.
     */
    public static get implemented(): boolean {
        return false;
    }

    /** The game this human player is a part of. */
    protected readonly game: BaseGame;

    /** The player that represents this human player in the game.  */
    protected player!: BaseGameObject;
    // NOTE: set shortly after initialized... maybe shouldnt' be !'d

    /** Orders we could not do until our player was hooked up. */
    private readonly backOrders: Array<Readonly<JoueurOrder>> = [];

    /**
     * Creates a base human player for a game.
     *
     * @param game - The game this human player is playing.
     */
    constructor(game: BaseGame) {
        this.game = game;
    }

    /**
     * Sets the player that this human player controls.
     * If there are back orders they will be ordered now.
     *
     * @param player - The player that this human player controls in the game.
     */
    public setPlayer(player: BaseGameObject): void {
        this.player = player;
    }

    /** Invoked when everything is ready and the human player can start playing. */
    public start(): void {
        while (this.backOrders.length > 0) {
            this.order.call(
                this,
                this.backOrders.shift() as Readonly<JoueurOrder>,
            );
        }
    }

    /**
     * Order the human playing to do some logic.
     *
     * @param order - The order details.
     * @throws If the order is invalid (name can't be found as a function).
     */
    public order(order: Immutable<JoueurOrder>): void {
        if (!this.player) {
            // Then we have not been told our player, so back order it.
            this.backOrders.push(order);

            return; // can't order until we know our player
        }

        const orderFunction = ((this as unknown) as UnknownObject)[order.name];

        if (typeof orderFunction !== "function") {
            throw new Error(`No order '${order.name}' found in humanPlayer`);
        }

        if (this.game.pane) {
            this.game.pane.startTicking(this.player.id);
        }

        // Add their return callback function, and then call that the function
        // we got from above via reflection
        orderFunction.apply(this, [
            ...order.args,
            (returned: unknown) => {
                if (this.game.pane) {
                    this.game.pane.stopTicking();
                }
                order.callback(returned);
            },
        ]);
    }
}
