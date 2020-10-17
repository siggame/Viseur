import { isObject } from "src/utils";
import { BaseGameNamespace } from "src/viseur/game/interfaces";

/** The expected interface all games must export from their interface. */
interface GameExport {
    /** The Namespace that contains all data to initiate a game from. */
    namespace: BaseGameNamespace;
}

// require all images in the build
/** Requires a resource in a game's resources directory. */
export const requireGameResource = require.context(
    "./",
    true,
    /^(.*(\.(png|jpe?g)$))[^.]*$/im,
);
for (const key of requireGameResource.keys()) {
    requireGameResource(key);
}

const games: { [gameName: string]: BaseGameNamespace | undefined } = {};
const req = require.context("./", true, /\.\/([^/]+)\/index.ts/); // match ./*/index.ts, but only 1 directory.

for (const key of req.keys()) {
    const required = req(key) as GameExport;
    if (!required || !isObject(required) || !isObject(required.namespace)) {
        throw new Error(
            `Game "${key}" does not export the expected interface!`,
        );
    }

    const { namespace } = required;
    if (namespace.Game) {
        games[namespace.Game.gameName] = namespace;
    }
}

/** All the game namespaces that can be loaded by this instance. */
export const GAMES = Object.freeze(games);
