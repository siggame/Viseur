import mapValues from "lodash/mapValues";
import * as config from "src/../config.json";

const defaults = {
    game: "", // no default game
    humanName: "",
    port: 0,
    server: "",
    session: "",
};

/** The default config. */
export const Config = mapValues(
    defaults,
    (val, key) => typeof config[key] === typeof val
        ? config[key] as typeof val
        : val, // config is wrong type, use the default
) as typeof defaults;
