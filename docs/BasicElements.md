
## Adding a sprite to a game

A sprite is recommended to be saved as a square png, with a transparent background if it is not a tile/backgrond sprite.

For a sprite that you want to add to a game, the first step is to place it in the `viseur/src/<game_name>/resources` folder.

From there, go to the `resources/index.ts` file; if it is empty, it should look something like this:

```ts
import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("<game_name>", {
    // <<-- Creer-Merge: resources -->>
    // "example": load("example.png"),
    // <<-- /Creer-Merge: resources -->>
});
```

For this walkthrough, we'll use `tacocat.png` to represent the sprite we want to add to the game, and we'll name it `taco_cat` to use it inside of the framework later on.

So, the line we'll want to add to the index file is:
(1) `"taco_cat": load("tacocat.png"),`

We want to add this line between the comments identified as `Creer-Merge`; for an explanation on this, see `OnCreerMergeTags.md`.

So, after adding line (1) to `resources/index.ts`, we have the following:

```ts
import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("<game_name>", {
    // <<-- Creer-Merge: resources -->>
    // "example": load("example.png"),
    "taco_cat": load("tacocat.png"),
    // <<-- /Creer-Merge: resources -->>
});
```

## Adding a sprite to an object



