import { isObject } from "src/utils";
import { IBaseGameNamespace } from "src/viseur/game/interfaces";

/** The expected interface all games must export from their interface. */
interface IGameExport {
    Namespace: IBaseGameNamespace;
}

// require all images in the build
/** Requires a resource in a game's resources directory. */
export const requireGameResource = require.context("./", true, /^(.*(\.(png|jpe?g)$))[^.]*$/im);
for (const key of requireGameResource.keys()) {
    requireGameResource(key);
}

/** All the game namespaces that can be loaded by this instance */
export const Games: {[gameName: string]: IBaseGameNamespace | undefined} = {};

const req = require.context("./", true, /\.\/(?:(?!resources).)*?\/index\.ts/im); // TODO: remove need for deep search

for (const key of req.keys()) {
    if (key === "./index.ts") {
        continue;
    }

    const required = req(key) as IGameExport;
    if (!required || !isObject(required) || !isObject(required.Namespace)) {
        throw new Error(`Game "${key}" does not export the expected interface!`);
    }

    const { Namespace } = required;
    if (Namespace.Game) {
        Games[Namespace.Game.gameName] = Namespace;
    }
}
