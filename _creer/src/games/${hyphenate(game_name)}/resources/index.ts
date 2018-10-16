import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in ${game['name']}. */
export const GameResources = createResources("${game_name}", {
${merge("    // ", "resources", '    test: load("test.png"), // load files like this,\n                            // and remember to remove these lines and file!', help=False)}
});
