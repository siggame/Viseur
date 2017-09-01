import { IBaseGameNamespace } from "src/viseur/game/interfaces";

// require all images in the build
const reqImages = require.context("./anarchy/", true, /^(.*(\.(png|jpe?g)$))[^.]*$/igm);
for (const key of reqImages.keys()) {
    reqImages(key);
}

/** All the game namespaces that can be loaded by this instance */
export const Games: {[gameName: string]: IBaseGameNamespace} = {};

const req = require.context("./anarchy/", true, /^(.*(index.js$))[^.]*$/igm);

for (const key of req.keys()) {
    const namespace: IBaseGameNamespace = req(key);
    Games[namespace.Game.gameName] = namespace;
}
