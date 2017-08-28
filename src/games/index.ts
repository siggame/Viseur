import { IGameNamespace } from "src/viseur/game/interfaces";

export const Games: {[gameName: string]: IGameNamespace} = {};

const req = require.context("./chess/", true, /^(.*(index.js$))[^.]*$/igm);

for (const key of req.keys()) {
    const namespace: IGameNamespace = req(key);

    if (namespace.Game) {
        let dir = key.substr("./".length);
        dir = dir.substr(0, dir.length - "/index.ts".length);

        namespace.path = dir;

        Games[namespace.Game.gameName] = namespace;
    }
}
