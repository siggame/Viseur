module.exports = [
    //<<-- Creer-Merge: settings -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    {
        "id": "flip-board",
        "label": "Flip Board",
        "hint": "Flips the board so that Black is on the bottom",
        "input": "CheckBox",
        "default": false,
    },

    {
        "id": "pawn-promotion",
        "label": "Pawn Promotion",
        "hint": "Human Only: Sets the piece to which the pawn is promoted upon promotion",
        "input": "DropDown",
        "options": [ "Queen", "Knight" "Bishop", "Rook" ]
    },

    //<<-- /Creer-Merge: settings -->>
];
