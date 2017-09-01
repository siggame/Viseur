import { BaseGame } from "./base-game";
import { BaseGameObject } from "./base-game-object";

export interface IOrder {
    /** the name of the order (function name on the player class) */
    name: string;

    /** args to apply to that function name */
    args: any[];

    /** callback that will send back the returned value as the first parameter */
    callback: (returned: any) => void;
}

/** the base class all HumanPlayers inherit from in each game */
export class BaseHumanPlayer {
    /** The game this human player is a part of */
    protected readonly game: BaseGame;

    /** The player that represents this human player in the game  */
    protected player: BaseGameObject;

    /** Orders we could not do until our player was hooked up */
    private backOrders: IOrder[] = [];

    /**
     * Creates a base human player for a game
     * @param game the game
     */
    constructor(game: BaseGame) {
        this.game = game;
    }

    /**
     * Sets the player that this human player controls
     * If there are back orders they will be ordered now
     * @param player the player that this human player controls in the game
     */
    public setPlayer(player: BaseGameObject): void {
        this.player = player;

        while (this.backOrders.length > 0) {
            this.order.apply(this, this.backOrders.shift());
        }
    }

    /**
     * Order the human playing to do some
     * @param {object} order the order details
     * @throws {Error} if the order is invalid (name can't be found as a function)
     */
    public order(order: IOrder): void {
        if (!this.player) { // then we have not been told our player, so back order it
            this.backOrders.push(order);
            return; // can't order until we know our player
        }

        const orderFunction: () => void = (this as any)[order.name];

        if (!orderFunction) {
            throw new Error(`No order '${order.name}' found in humanPlayer`);
        }

        this.game.pane.startTicking(this.player.id);

        // add their return callback function
        order.args.push((returned: any) => {
            order.callback(returned);
        });

        orderFunction.apply(this, order.args);
    }
}
