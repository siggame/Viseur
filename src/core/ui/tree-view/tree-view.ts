import { escape } from "lodash";
import { partial } from "src/core/partial";
import { isObject } from "src/utils";
import { BaseElement, IBaseElementArgs } from "../base-element";
import * as treeViewNodeHbs from "./tree-view-node.hbs";
import * as treeViewHbs from "./tree-view.hbs";
import "./tree-view.scss";

/** Primitive types tree view can display */
type TreeablePrimitives = string | number | boolean | null | undefined;

/** types a tree view can display */
export type Treeable = TreeablePrimitives | ITreeableObject;

/** Treeable key value object */
interface ITreeableObject {
    [key: string]: Treeable | undefined;
}

/** A node used t display a key/value pair */
export interface ITreeViewNode {
    /** main li element */
    $element: JQuery;

    /** The header for the element */
    $header: JQuery;

    /** The key element container */
    $key: JQuery;

    /** The value element container */
    $value: JQuery;

    /** The container for children */
    $children: JQuery;
}

/** a multi-level tree of expandable lists */
export class TreeView extends BaseElement {
    /** The object we are currently displaying. */
    private displaying: Treeable = {};

    // /** cache of items to re-use */
    // private itemCache = new InsureMap<string, ITreeViewNode>();

    /**
     * Creates a new TreeView component.
     *
     * @param args - The base input args.
     */
    constructor(args: IBaseElementArgs) {
        super(args, treeViewHbs);
    }

    /**
     * Displays some Object as a TreeView.
     *
     * @param tree - The object to display.
     */
    public display(tree: ITreeableObject): void {
        this.displaying = tree;

        this.element.empty();
        this.deepDisplay("root", this.displaying, this.element);
    }

    /**
     * Gets the string to display as the value for a given node.
     *
     * @param node - the node's JQuery elements
     * @param value - The node to get the value for.
     * @returns Whatever string to display.
     */
    protected formatNodeValue(node: ITreeViewNode, value: Treeable): void {
        let formatted = String(value);
        if (Array.isArray(value)) {
            formatted = `Array[${value.length}]`;
        }
        else if (isObject(value)) {
            formatted = "Object";
        }

        node.$value.html(escape(formatted)); // tslint:disable-line:no-inner-html - safe with lodash escape
    }

    /**
     * Displays some tree objects first keys in a parent.
     *
     * @param levelKey - The key level of the display
     * @param tree - Treeable object to display
     * @param $parent - The parent element for these keys.
     */
    private deepDisplay(levelKey: string, tree: ITreeableObject, $parent: JQuery): void {
        for (const key of Object.keys(tree).sort()) {
            const fullKey = `${levelKey}.${key}`;
            const value = tree[key];
            const $element = partial(treeViewNodeHbs, { key }, $parent);
            const node = {
                $element,
                $header: $element.find("header"),
                $key: $element.find(".node-key"),
                $value: $element.find(".node-value"),
                $children: $element.find(".node-children"),
            };

            this.formatNodeValue(node, value);
            node.$element.appendTo($parent);
            node.$element.attr("data-inspect-key", fullKey);

            if (isObject(value)) {
                node.$header.addClass("inspect-expandable");
                const onClick = () => {
                    this.deepDisplay(fullKey, value, node.$children);
                    node.$header.addClass("expanded");

                    node.$header.one("click", () => {
                        node.$children.empty();
                        node.$header.one("click", onClick);
                        node.$header.removeClass("expanded");
                    });
                };

                node.$header.one("click", onClick);
            }
        }
    }
}
