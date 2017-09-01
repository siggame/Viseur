import { Event, events } from "src/core/event";
import { BaseInput, IBaseInputArgs } from "./base-input";

/** An input for files */
export class FileInput extends BaseInput {
    /** Events this class emits */
    public readonly events = events({
        /** Emitted when this input's value changes */
        changed: new Event<undefined>(),

        /** Triggered when the button is clicked */
        loading: new Event<undefined>(),

        /** Triggered once a file has been loaded */
        loaded: new Event<string>(),
    });

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
        this.events.loading.emit(undefined);

        const reader = new FileReader();
        reader.onload = () => {
            this.events.loaded.emit(reader.result);
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
