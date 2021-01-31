import * as $ from "jquery";
import { BaseInput, Tab, TabArgs } from "src/core/ui";
import { Viseur } from "src/viseur";
import { BaseSetting, BaseSettings } from "src/viseur/settings";
import * as settingsTabHbs from "./settings-tab.hbs";
import "./settings-tab.scss";

/**
 * The "Help" tab on the InfoPane,
 * displaying settings (both for the core and by game).
 */
export class SettingsTab extends Tab {
    /** The settings element for the core viseur settings. */
    private readonly coreSettingsElement = this.element.find(".core-settings");

    /** The settings element for the game's settings. */
    private readonly gameSettingsElement = this.element
        .find(".game-settings")
        .addClass("collapsed");

    /** The name of the game to be replaced. */
    private readonly gameNameElement = this.gameSettingsElement.find(
        ".game-name",
    );

    /** The player color picker inputs to enabled/disable. */
    private readonly customColorInputs: Array<BaseInput<unknown>> = [];

    /**
     * Creates a new settings tab for the Viseur instance.
     *
     * @param args - Initialization args.
     */
    constructor(
        args: TabArgs & {
            /** The Viseur instance we are a part of. */
            viseur: Viseur;
        },
    ) {
        super({
            contentTemplate: settingsTabHbs,
            title: "Settings",
            ...args,
        });

        this.manageSettings(args.viseur.settings, this.coreSettingsElement);

        args.viseur.eventReady.on(({ game }) => {
            this.gameNameElement.html(game.name);
            this.gameSettingsElement.removeClass("collapsed");

            this.manageSettings(
                game.settings as BaseSettings,
                this.gameSettingsElement,
            );

            this.setColorInputsEnabled(game.settings.customPlayerColors.get());
            game.settings.customPlayerColors.changed.on((enabled) => {
                this.setColorInputsEnabled(enabled);
            });
        });
    }

    /**
     * Initializes the settings for a game,
     * invoked when Viseur is ready so it has a game created to load settings from.
     *
     * @param baseSettings - The list of settings from a settings.js file.
     * @param parent - The jQuery parent element.
     */
    private manageSettings(
        baseSettings: Readonly<BaseSettings>,
        parent: JQuery,
    ): void {
        const settings: BaseSetting[] = [];
        const playerColorSettings = new Set<BaseSetting>();
        for (const [key, settingOrSettings] of Object.entries(baseSettings)) {
            const subSettings = Array.isArray(settingOrSettings)
                ? settingOrSettings // it's an array of settings
                : [settingOrSettings]; // it's a single setting

            for (const setting of subSettings) {
                if (setting) {
                    settings[setting.index] = setting;

                    if (key === "playerColors") {
                        playerColorSettings.add(setting);
                    }
                }
            }
        }

        if (settings.length === 0) {
            parent.append($("<span>").addClass("no-settings").html("None"));

            return; // no settings to add, we're done here
        }

        for (const setting of settings) {
            const input = setting.createInput(parent);

            if (playerColorSettings.has(setting)) {
                this.customColorInputs.push(input);
            }
        }

        // add a "reset to defaults" button for this new settings section
        $("<button>")
            .appendTo(parent)
            .addClass("reset-to-defaults")
            .html("Reset to Defaults")
            .on("click", () => {
                this.resetToDefaults(settings);
            });
    }

    /**
     * Resets a list of settings to the default values.
     *
     * @param settings - The list of settings from a settings.js file.
     */
    private resetToDefaults(settings: BaseSetting[]): void {
        for (const setting of settings) {
            setting.set(setting.default);
        }
    }

    /**
     * Enabled or disables all the custom player color inputs.
     *
     * @param enabled - True if they should be enabled, false otherwise.
     */
    private setColorInputsEnabled(enabled: boolean): void {
        for (const input of this.customColorInputs) {
            input.setEnabled(enabled);
        }
    }
}
