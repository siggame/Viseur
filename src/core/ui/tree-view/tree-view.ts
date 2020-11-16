import { escape } from "lodash";
import { partial } from "src/core/partial";
import { isObject } from "src/utils";
import { BaseElement, BaseElementArgs } from "../base-element";
import * as treeViewNodeHbs from "./tree-view-node.hbs";
import * as treeViewHbs from "./tree-view.hbs";
import "./tree-view.scss";

/** Primitive types tree view can display. */
type TreeablePrimitives = string | number | boolean | null | undefined;

/** Types a tree view can display. */
export type Treeable = TreeablePrimitives | TreeableObject;

/** Treeable key value object. */
interface TreeableObject {
    [key: string]: Treeable | undefined;
}

/** The base empty node. */
interface BaseNode {
    /** Parent node. */
    parent?: TreeViewNode;

    /** The main element. */
    $element: JQuery;

    /** Our node's key. */
    key: string | number;

    /** A flag used to determine if this should be popped. */
    flag: boolean;
}

/** A node used t display a key/value pair. */
export interface TreeViewNode extends BaseNode {
    /** The header for the element. */
    $header: JQuery;

    /** The key element container. */
    $key: JQuery;

    /** The value element container. */
    $value: JQuery;

    /** A flag to indicate if this node is/was expanded. */
    expanded: boolean;

    /** The container for children. */
    $children: JQuery;

    /** Child nodes of this node. */
    children: { [key: string]: undefined | TreeViewNode };

    /** The onclick handler for this nodes. */
    onClick: () => void;
}

/** A multi-level tree of expandable lists. */
export class TreeView extends BaseElement {
    /** The name of this treeview. */
    public readonly name: string;

    /** The root node for this tree. */
    private readonly rootNode: TreeViewNode;

    /** Flag we flip to determine which nodes were not used. */
    private currentUnusedFlag = true;

    /**
     * Creates a new TreeView component.
     *
     * @param args - The base input args.
     */
    constructor(
        args: BaseElementArgs & {
            /** The name of the root. */
            name: string;
        },
    ) {
        super(args, treeViewHbs);

        this.name = args.name;
        this.rootNode = this.createNewNode(args.name || "root");
        this.rootNode.$children.first().appendTo(this.element);
        this.rootNode.expanded = true;
    }

    /**
     * Displays some Object as a TreeView.
     *
     * @param tree - The object to display.
     */
    public display(tree: TreeableObject): void {
        this.currentUnusedFlag = !this.currentUnusedFlag; // invert so all nodes have the opposite value

        this.deepDisplay(this.rootNode.key, tree, this.rootNode);
        this.pruneUnusedNodes(this.rootNode);
    }

    /**
     * Expands the tree view from the root given a path of keys to follow.
     *
     * @param path - The path (path) to follow.
     */
    public expand(...path: string[]): void {
        this.expandNode(this.rootNode, path);
    }

    /**
     * Expands a specific node recursively.
     *
     * @param current - The current node to expand.
     * @param keys - The keys to recurse down.
     * @param delay - If we should add a delay for DOM manipulation.
     */
    private expandNode(
        current: TreeViewNode,
        keys: string[],
        delay = true,
    ): void {
        if (delay) {
            setTimeout(() => this.expandNode(current, keys, false), 50);
            return;
        }

        if (keys.length > 0) {
            const key = keys[0];
            const next = current.children[key];
            if (!next) {
                current.onClick();
                this.expandNode(current, keys);
            } else if (!next.expanded) {
                next.onClick();
                this.expandNode(current, keys);
            } else {
                keys.shift();
                this.expandNode(next, keys);
            }
        } else {
            const element = current.$element[0];
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    }

    /**
     * Gets the string to display as the value for a given node.
     *
     * @param node - The node's JQuery elements.
     * @param value - The node to get the value for.
     */
    protected formatNodeValue(node: TreeViewNode, value: Treeable): void {
        let formatted = String(value);
        if (Array.isArray(value)) {
            formatted = `Array[${value.length}]`;
        } else if (isObject(value)) {
            formatted = "Object";
        }

        node.$value.html(escape(formatted));
    }

    /**
     * Creates a new node and inserts it as necessary.
     *
     * @param key - The key of this new node.
     * @param parent - The parent node.
     * If none then this is assume to be the root node.
     * @returns The newly created node, inserted as necessary.
     */
    protected createNewNode(
        key: string | number,
        parent?: TreeViewNode,
    ): TreeViewNode {
        const $parent = parent ? parent.$children : this.element;
        const $element = partial(treeViewNodeHbs, { key }, $parent);

        const node = {
            $element,
            $header: $element.find("header"),
            $key: $element.find(".node-key"),
            $value: $element.find(".node-value"),
            $children: $element.find(".node-children"),
            children: {},
            expanded: false,
            key,
            flag: this.currentUnusedFlag,
            onClick: () => undefined,
            parent,
        };

        if (parent) {
            parent.children[key] = node;
        }

        return node;
    }

    /**
     * Gets the keys for a given object.
     *
     * @param tree - The tree to get keys for.
     * @returns An array of the keys, in order to display.
     */
    protected getKeysFor<T extends TreeableObject>(tree: T): Array<keyof T> {
        return Object.keys(tree).sort((a, b) => {
            const aNum = Number(a);
            const bNum = Number(b);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return aNum - bNum;
            }

            if (a === b) {
                return 0;
            } else {
                return a < b ? -1 : 1;
            }
        });
    }

    /**
     * Deeply displays a given node.
     *
     * @param key - The key of the treeable from its parent Treeable.
     * @param treeable - The Treeable to display, not an object with they
     * given key set.
     * @param parentNode - The parent node of the Treeable, if a child node
     * with the given key is not found, this will have a new child added to
     * it.
     */
    private deepDisplay(
        key: string | number,
        treeable: Treeable,
        parentNode: TreeViewNode,
    ): void {
        const node =
            parentNode.children[key] || this.createNewNode(key, parentNode);
        node.flag = this.currentUnusedFlag;

        if (node.children !== undefined) {
            this.formatNodeValue(node, treeable);

            if (isObject(treeable)) {
                node.onClick = () => {
                    this.onNodeClicked(node, treeable);
                };
                node.$header
                    .addClass("inspect-expandable")
                    .off("click")
                    .on("click", node.onClick);

                if (node.expanded) {
                    const keys = this.getKeysFor(treeable);
                    for (const childKey of keys) {
                        const childValue = treeable[childKey];

                        this.deepDisplay(childKey, childValue, node);
                    }
                }
            }
        }

        // TODO:
        // If this is NOT the current flag, then it was previously displayed
        // so, deep display it, updating its flag
        // also if this HAD children, then it was expanded,
        // so make the above expandable already expanded
    }

    /**
     * Invoked when a node's header is clicked to expand/retract.
     *
     * @param node - The node clicked.
     * @param tree - The value of that given node.
     */
    private onNodeClicked(node: TreeViewNode, tree: Treeable): void {
        node.expanded = !node.expanded;
        node.$header.toggleClass("expanded", node.expanded);

        if (node.expanded && isObject(tree)) {
            const keys = this.getKeysFor(tree);
            for (const key of keys) {
                this.deepDisplay(key, tree[key], node);
            }
        } else {
            node.$children.empty();
            node.children = {};
        }
    }

    /**
     * Prunes this node, removing it from the dom, if it is no longer
     * displayed.
     *
     * @param node - The node to recursively pruned.
     */
    private pruneUnusedNodes(node: TreeViewNode): void {
        if (node.flag !== this.currentUnusedFlag) {
            node.$element.detach();
            if (node.parent) {
                delete node.parent.children[node.key];
            }
        }

        if (node.children) {
            const keys = Object.keys(node.children);
            for (const key of keys) {
                const child = node.children[key];
                if (!child) {
                    throw new Error(
                        `tree view ${key} should never have undefined children!`,
                    );
                }

                this.pruneUnusedNodes(child);
            }
        }
    }
}
