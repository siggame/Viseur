import { BaseInput, IBaseInputArgs } from "./base-input";

export interface IFileInputEvents {
    /** Triggered when the button is clicked */
    on(event: "loading", listener: () => void): this;

    /** Triggered once a file has been loaded */
    on(event: "loaded", listener: (result: any) => void): this;
}

/** An input for files */
export class FileInput extends BaseInput implements IFileInputEvents {
    /**
     * Initializes the File Input
     * @param {object} args - initialization args
     */
    constructor(args: IBaseInputArgs) {
        super(Object.assign({
            type: "file",
        } as IBaseInputArgs, args));

        this.element.on("change", () => {
            this.loadFile();
        });
    }

    /**
     * loads the contents of the chosen file
     */
    private loadFile(): void {
        this.emit("loading");

        const reader = new FileReader();
        reader.onload = () => {
            this.emit("loaded", reader.result);
        };

        const file = (this.element.get(0) as any).files[0];
        reader.readAsText(file);
    }

    /**
     * Does nothing (File inputs cannot be set via JavaScript)
     */
    public set value(newValue: any) {
        // do nothing, disallow public set
    }
}

module.exports = File;
