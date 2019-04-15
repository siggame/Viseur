import { ITreeViewNode, Treeable, TreeView } from "src/core/ui/tree-view";

/** A tree view for inspecting game states */
export class InspectTreeView extends TreeView {
    /**
     * Gets the string to display as the value for a given node.
     *
     * @param node - the node's JQuery elements
     * @param value - The node to get the value for.
     * @returns Whatever string to display.
     */
    protected formatNodeValue(node: ITreeViewNode, value: Treeable): void {
        const type = Array.isArray(value)
            ? "array"
            : typeof value;

        node.$element.attr("data-inspect-type", type);

        super.formatNodeValue(node, value);
    }
}
