import { ITabArgs, Tab } from "src/core/ui";
import { viseur } from "src/viseur";
import { BaseSetting, IBaseSettings } from "src/viseur/settings";
import "./settings-tab.scss";

/** The "Help" tab on the InfoPane, displaying settings (both for the core and by game) */
export class SettingsTab extends Tab {
    /** The title of the tab */
    public get title(): string {
        return "Settings";
    }

    /** The settings element for the core viseur settings */
    private coreSettingsElement = this.element.find(".core-settings");

    /** The settings element for the game's settings */
    private gameSettingsElement = this.element.find(".game-settings").addClass("collapsed");

    /** The name of the game to be replaced */
    private gameNameElement = this.gameSettingsElement.find(".game-name");

    constructor(args: ITabArgs) {
        super(args);

        this.manageSettings(viseur.settings, this.coreSettingsElement);

        viseur.events.ready.on((ready) => {
            this.gameNameElement.html(ready.game.name);
            this.gameSettingsElement.removeClass("collapsed");

            this.manageSettings(ready.game.settings, this.gameSettingsElement);
        });
    }

    protected getTemplate(): Handlebars {
        return require("./settings-tab.hbs");
    }

    /**
     * Initializes the settings for a game, invoked when Viseur is ready so it has a game created to load settings from
     * @param {Array} baseSettings the list of settings from a settings.js file
     * @param {$} parent the jQuery parent element
     */
    private manageSettings(baseSettings: IBaseSettings, parent: JQuery<HTMLElement>): void {
        const settings: BaseSetting[] = [];
        for (const key of Object.keys(baseSettings)) {
            let subSettings = baseSettings[key];
            if (!Array.isArray(subSettings)) {
                subSettings = [ subSettings ];
            }
            for (const setting of subSettings) {
                settings[setting.index] = setting;
            }
        }

        if (settings.length === 0) {
            parent.append($("<span>")
                .addClass("no-settings")
                .html("None"),
            );

            return; // no settings to add, we're done here
        }

        for (const setting of settings) {
            setting.createInput(parent);
        }

        // add a "reset to defaults" button for this new settings section
        $("<button>")
            .appendTo(parent)
            .addClass("reset-to-defaults")
            .html("Reset to Defaults")
            .on("click", () => {
                this.resetToDefaults(settings[0].namespace, settings);
            });
    }

    /**
     * Resets a list of settings to the default values
     * @param {string} namespace the namespace for the settings to init.
     * Will be a game name or "viseur" for Viseur core settings
     * @param {Array} settings the list of settings from a settings.js file
     */
    private resetToDefaults(namespace: string, settings: BaseSetting[]): void {
        for (const setting of settings) {
            setting.set(setting.default);
        }
    }
}
