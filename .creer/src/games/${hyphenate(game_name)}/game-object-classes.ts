<%include file="functions.noCreer" />// Do not modify this file
// This is a simple lookup object for each GameObject class
<%
imports = { "src/viseur/game/interfaces": [ "BaseGameObjectClasses" ] }
for game_obj_key in game_objs:
    imports['./' + hyphenate(game_obj_key)] = [game_obj_key]
%>${shared['vis']['imports'](imports)}
/** All the non Game classes in this game. */
export const GameObjectClasses: Readonly<BaseGameObjectClasses> = Object.freeze(
    {
% for game_obj_key in game_objs:
        ${game_obj_key},
% endfor
    },
);
