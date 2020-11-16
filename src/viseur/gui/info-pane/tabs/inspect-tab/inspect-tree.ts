import { BaseGameObject } from "@cadre/ts-utils/cadre";
import { capitalize } from "lodash";
import { TreeViewNode, Treeable, TreeView } from "src/core/ui";
import { getGameObjectDisplayText, isObject } from "src/utils";

/**
 * Checks if something's shape is a game object.
 *
 * @param val - The value to check.
 * @returns True if it appears to be a game object, false otherwise.
 */
function isGameObject(val: unknown): val is BaseGameObject {
    return (
        isObject(val) &&
        typeof val.id === "string" &&
        typeof val.gameObjectName === "string"
    );
}

/** A tree view for inspecting game states. */
export class InspectTreeView extends TreeView {
    /** The name of the game we are inspecting. */
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
     * @param node - The node's JQuery elements.
     * @param value - The node to get the value for.
     */
    protected formatNodeValue(node: TreeViewNode, value: Treeable): void {
        let type = "???";
        let displayValue = value;
        if (Array.isArray(value)) {
            type = "array";
        } else if (value === null) {
            type = "null";
        } else if (node.parent && !node.parent.parent) {
            type = "root";
            displayValue = `${this.gameName} ${capitalize(this.name)}`;
        } else if (isGameObject(value)) {
            type = "game-object";

            const gameObject = (value as unknown) as BaseGameObject; // sketchy, but above check should it valid...
            displayValue = getGameObjectDisplayText(gameObject);
        } else if (isObject(value)) {
            type = "map";
            displayValue = `Map[${Object.keys(value).length}]`;
        } else {
            type = typeof value;
        }

        node.$element.attr("data-inspect-type", type);

        super.formatNodeValue(node, displayValue);
    }
}
