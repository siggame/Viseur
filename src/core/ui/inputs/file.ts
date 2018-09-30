import { Event, events, Signal } from "ts-typed-events";
import { BaseInput, IBaseInputArgs } from "./base-input";

/** An input for files */
export class FileInput extends BaseInput<undefined> {
    /** Events this class emits */
    public readonly events = events.concat(super.events, {
        /** Triggered when the button is clicked */
        loading: new Signal(),

        /** Triggered once a file has been loaded */
        loaded: new Event<string>(),
    });

    /**
     * Initializes the File Input
     * @param args - initialization args
     */
    constructor(args: IBaseInputArgs) {
        super(Object.assign({
            type: "file",
        }, args));

        this.element.on("change", () => {
            this.loadFile();
        });
    }

    /**
     * loads the contents of the chosen file
     */
    private loadFile(): void {
        this.events.loading.emit();

        const reader = new FileReader();
        reader.onload = () => {
            // must be string from readAsText below
            this.events.loaded.emit(reader.result as string);
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
