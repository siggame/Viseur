import { Immutable } from "@cadre/ts-utils";
import { Tab } from "src/core/ui/tabular";
import { FileTab } from "./file-tab/file-tab";
import { HelpTab } from "./help-tab/help-tab";
import { InspectTab } from "./inspect-tab/inspect-tab";
import { SettingsTab } from "./settings-tab/settings-tab";

/** These are all the tabs for the InfoPane, in order. */
export const TABS: Immutable<Array<typeof Tab>> = [
    FileTab,
    InspectTab,
    SettingsTab,
    HelpTab,
];
