import { IBaseGameNamespace } from "src/viseur/game/interfaces";

// require all images in the build
/** Requires a resource in a game's resources directory. */
export const requireGameResource = require.context("./", true, /^(.*(\.(png|jpe?g)$))[^.]*$/im);
for (const key of requireGameResource.keys()) {
    requireGameResource(key);
}

/** All the game namespaces that can be loaded by this instance */
export const Games: {[gameName: string]: IBaseGameNamespace | undefined} = {};

const req = require.context("./", true, /^(.*(index.ts$))[^.]*$/im);

for (const key of req.keys()) {
    const namespace = req(key) as IBaseGameNamespace;
    if (namespace.Game) {
        Games[namespace.Game.gameName] = namespace;
    }
}
