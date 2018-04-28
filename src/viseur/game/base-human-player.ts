import { BaseGame } from "./base-game";
import { BaseGameObject } from "./base-game-object";
import { IOrder } from "./interfaces";

/** the base class all HumanPlayers inherit from in each game */
export class BaseHumanPlayer {
    /** Checks if this human player's logic is implemented, so humans can play this game */
    public static get implemented(): boolean {
        return false;
    }

    /** The game this human player is a part of */
    protected readonly game: BaseGame;

    /** The player that represents this human player in the game  */
    protected player!: BaseGameObject; // set shortly after initialized... maybe shouldnt' be !'d

    /** Orders we could not do until our player was hooked up */
    private readonly backOrders: IOrder[] = [];

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
            this.order.call(this, this.backOrders.shift());
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

        if (this.game.pane) {
            this.game.pane.startTicking(this.player.id);
        }

        // add their return callback function
        order.args.push((returned: any) => {
            if (this.game.pane) {
                this.game.pane.stopTicking();
            }
            order.callback(returned);
        });

        orderFunction.apply(this, order.args);
    }
}
