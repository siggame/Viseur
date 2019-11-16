import { IBaseGameObject, IBasePlayer } from "@cadre/ts-utils/cadre";
import { capitalize } from "lodash";
import { ITreeViewNode, Treeable, TreeView } from "src/core/ui";
import { isObject } from "src/utils";
import { IBaseTile } from "src/viseur/game";

function isGameObject(val: unknown): val is IBaseGameObject {
    return isObject(val)
        && typeof val.id === "string"
        && typeof val.gameObjectName === "string";
}

/** A tree view for inspecting game states */
export class InspectTreeView extends TreeView {
    /** The name of the game we are inspecting */
    private gameName = "???";

    /**
     * Sets the game name for the tree.
     *
     * @param gameName - The name of the game to use.
     */
    public setGameName(gameName: string): void {
        this.gameName = gameName;
    }

    /**
     * Gets the string to display as the value for a given node.
     *
     * @param node - the node's JQuery elements
     * @param value - The node to get the value for.
     * @returns Whatever string to display.
     */
    protected formatNodeValue(node: ITreeViewNode, value: Treeable): void {
        let type = "???";
        let displayValue = value;
        if (Array.isArray(value)) {
            type = "array";
        }
        else if (value === null) {
            type = "null";
        }
        else if (node.parent && !node.parent.parent) {
            type = "root";
            displayValue = `${this.gameName} ${capitalize(this.name)}`;
        }
        else if (isGameObject(value)) {
            type = "game-object";

            const gameObject = value as unknown as IBaseGameObject; // sketchy, but above check should it valid...
            switch (gameObject.gameObjectName) {
                case "Player":
                    displayValue = `Player "${(gameObject as IBasePlayer).name}"`;
                    break;
                case "Tile":
                    displayValue = `Tile (${(gameObject as IBaseTile).x}, ${(gameObject as IBaseTile).y})`;
                    break;
                default:
                    displayValue = gameObject.gameObjectName;
            }
            displayValue += ` #${gameObject.id}`;
        }
        else if (isObject(value)) {
            type = "map";
            displayValue = `Map[${Object.keys(value).length}]`;
        }
        else {
            type = typeof value;
        }

        node.$element.attr("data-inspect-type", type);

        super.formatNodeValue(node, displayValue);
    }
}
