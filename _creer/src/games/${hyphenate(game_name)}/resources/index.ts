import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("${game_name}", {
${merge("    // ", "resources", '    // "example": load("example.png"),', help=False)}
});
