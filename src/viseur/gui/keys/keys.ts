import { Key } from "./key";

export const KEYS = {
    "backspace": new Key(8, "backspace"),
    "tab": new Key(9, "tab"),
    "enter": new Key(13, "enter"),
    "shift": new Key(16, "shift"),
    "ctrl": new Key(17, "ctrl"),
    "alt": new Key(18, "alt"),
    "pauseBreak": new Key(19, "pauseBreak"),
    "capsLock": new Key(20, "capsLock"),
    "escape": new Key(27, "escape"),
    "space": new Key(32, "space"),
    "pageUp": new Key(33, "pageUp"),
    "pageDown": new Key(34, "pageDown"),
    "end": new Key(35, "end"),
    "home": new Key(36, "home"),
    "leftArrow": new Key(37, "leftArrow"),
    "upArrow": new Key(38, "upArrow"),
    "rightArrow": new Key(39, "rightArrow"),
    "downArrow": new Key(40, "downArrow"),
    "insert": new Key(45, "insert"),
    "delete": new Key(46, "delete"),

    "0": new Key(48, "0"),
    "1": new Key(49, "1"),
    "2": new Key(50, "2"),
    "3": new Key(51, "3"),
    "4": new Key(52, "4"),
    "5": new Key(53, "5"),
    "6": new Key(54, "6"),
    "7": new Key(55, "7"),
    "8": new Key(56, "8"),
    "9": new Key(57, "9"),

    ":": new Key(58, ":"),
    ";": new Key(59, ";"),
    "<": new Key(60, "<"),
    "=": new Key(61, "="),
    ">": new Key(62, ">"),
    "?": new Key(63, "?"),
    "@": new Key(64, "@"),

    "A": new Key(65, "A"),
    "B": new Key(66, "B"),
    "C": new Key(67, "C"),
    "D": new Key(68, "D"),
    "E": new Key(69, "E"),
    "F": new Key(70, "F"),
    "G": new Key(71, "G"),
    "H": new Key(72, "H"),
    "I": new Key(73, "I"),
    "J": new Key(74, "J"),
    "K": new Key(75, "K"),
    "L": new Key(76, "L"),
    "M": new Key(77, "M"),
    "N": new Key(78, "N"),
    "O": new Key(79, "O"),
    "P": new Key(80, "P"),
    "Q": new Key(81, "Q"),
    "R": new Key(82, "R"),
    "S": new Key(83, "S"),
    "T": new Key(84, "T"),
    "U": new Key(85, "U"),
    "V": new Key(86, "V"),
    "W": new Key(87, "W"),
    "X": new Key(88, "X"),
    "Y": new Key(89, "Y"),
    "Z": new Key(90, "Z"),

    "[": new Key(91, "["),
    "\\": new Key(92, "\\"),
    "]": new Key(93, "]"),
    "^": new Key(94, "^"),
    "_": new Key(95, "_"),
    "`": new Key(96, "`"),

    "a": new Key(97, "a"),
    "b": new Key(98, "b"),
    "c": new Key(99, "c"),
    "d": new Key(100, "d"),
    "e": new Key(101, "e"),
    "f": new Key(102, "f"),
    "g": new Key(103, "g"),
    "h": new Key(104, "h"),
    "i": new Key(105, "i"),
    "j": new Key(106, "j"),
    "k": new Key(107, "k"),
    "l": new Key(108, "l"),
    "m": new Key(109, "m"),
    "n": new Key(110, "n"),
    "o": new Key(111, "o"),
    "p": new Key(112, "p"),
    "q": new Key(113, "q"),
    "r": new Key(114, "r"),
    "s": new Key(115, "s"),
    "t": new Key(116, "t"),
    "u": new Key(117, "u"),
    "v": new Key(118, "v"),
    "w": new Key(119, "w"),
    "x": new Key(120, "x"),
    "y": new Key(121, "y"),
    "z": new Key(122, "z"),

    "{": new Key(123, "{"),
    "|": new Key(124, "|"),
    "}": new Key(125, "}"),
    "~": new Key(126, "~"),
    // "delete": new Key(127, "delete"),

    "f1": new Key(314, "f1"),
    "f2": new Key(315, "f2"),
    "f3": new Key(316, "f3"),
    "f4": new Key(317, "f4"),
    "f5": new Key(318, "f5"),
    "f6": new Key(319, "f6"),
    "f7": new Key(320, "f7"),
    "f8": new Key(321, "f8"),
    "f9": new Key(322, "f9"),
    "f10": new Key(323, "f10"),
    "f11": new Key(324, "f11"),
    "f12": new Key(325, "f12"),
};

export const KEY_FROM_CODE: {[keyCode: number]: Key} = {};

for (const keyName of Object.keys(KEYS)) {
    const key: Key = (KEYS as any)[keyName];
    KEY_FROM_CODE[key.code] = key;
}

document.addEventListener("keydown", (keyboardEvent) => {
    const key = KEY_FROM_CODE[keyboardEvent.keyCode];

    if (key) {
        key.down.emit(keyboardEvent);
    }
});

document.addEventListener("keyup", (keyboardEvent) => {
    const key = KEY_FROM_CODE[keyboardEvent.keyCode];

    if (key) {
        key.up.emit(keyboardEvent);
    }
});
