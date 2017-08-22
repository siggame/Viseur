import { BaseElement, IBaseElementArgs } from "../base-element";
import "./treeView.scss";

/** a multi-level tree of expandable lists */
export default class TreeView extends BaseElement {
    constructor(args: IBaseElementArgs) {
        super(args);
    }

    /**
     * displays some Object as a TreeView
     * @param tree - the object to display
     */
    public display(tree: object): void {
        // TODO: do
    }
}
