import { createEventEmitter } from "ts-typed-events";
import { BaseInput, BaseInputArgs } from "./base-input";

/** An input for files. */
export class FileInput extends BaseInput<undefined> {
    /** Loading event and emitter. */
    private readonly emitLoading = createEventEmitter();

    /** Triggered when the button is clicked. */
    public readonly eventLoading = this.emitLoading.event;

    /** Loaded event and emitter. */
    private readonly emitLoaded = createEventEmitter<string>();

    /** Triggered once a file has been loaded. */
    public readonly eventLoaded = this.emitLoaded.event;

    /**
     * Initializes the File Input.
     *
     * @param args - The initialization args.
     */
    constructor(args: BaseInputArgs<undefined>) {
        super({
            type: "file",
            ...args,
        });

        this.element.on("change", () => {
            this.loadFile();
        });
    }

    /**
     * Loads the contents of the chosen file.
     */
    private loadFile(): void {
        this.emitLoading();

        const reader = new FileReader();
        reader.onload = () => {
            const { result } = reader;
            this.emitLoaded.emit(
                typeof result === "string"
                    ? result
                    : result
                    ? String(result)
                    : "",
            );
        };

        const { files } = this.element.get(0) as HTMLInputElement;
        if (!files) {
            throw new Error("File Input has no files on html element");
        }
        const file = files[0];
        reader.readAsBinaryString(file);
    }

    /**
     * Does nothing (File inputs cannot be set via JavaScript).
     */
    public set value(newValue: undefined) {
        // do nothing, disallow public set
    }
}
