import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("${game_name}", {
${merge("    // ", "resources", '    test: load("test.png"), // load files like this,\n                            // and remember to remove these lines and file!', help=False)}
});
