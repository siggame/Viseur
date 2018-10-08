import { BaseElement, IBaseElementArgs } from "../base-element";
import treeViewHbs from "./tree-view.hbs";
import "./treeView.scss";

/** a multi-level tree of expandable lists */
export class TreeView extends BaseElement {
    constructor(args: IBaseElementArgs) {
        super(args, treeViewHbs);
    }

    /**
     * displays some Object as a TreeView
     * @param tree - the object to display
     */
    public display(tree: object): void {
        // TODO: do
    }
}
