/**
 * The resulting handlebars template function from importing a hbs file
 * Takes in args to format the imported handlebars file into
 * @param args the arguments to apply to the templates
 * @returns {string} the template with args applied to it
 */
declare type Handlebars = (args?: {}) => string;

declare module "*.hbs" {
    const _: Handlebars;
    export default _;
}

interface Eases {
    backInOut: (t: number) => number,
    backIn: (t: number) => number,
    backOut: (t: number) => number,
    bounceInOut: (t: number) => number,
    bounceIn: (t: number) => number,
    bounceOut: (t: number) => number,
    circInOut: (t: number) => number,
    circIn: (t: number) => number,
    circOut: (t: number) => number,
    cubicInOut: (t: number) => number,
    cubicIn: (t: number) => number,
    cubicOut: (t: number) => number,
    elasticInOut: (t: number) => number,
    elasticIn: (t: number) => number,
    elasticOut: (t: number) => number,
    expoInOut: (t: number) => number,
    expoIn: (t: number) => number,
    expoOut: (t: number) => number,
    linear: (t: number) => number,
    quadInOut: (t: number) => number,
    quadIn: (t: number) => number,
    quadOut: (t: number) => number,
    quartInOut: (t: number) => number,
    quartIn: (t: number) => number,
    quartOut: (t: number) => number,
    quintInOut: (t: number) => number,
    quintIn: (t: number) => number,
    quintOut: (t: number) => number,
    sineInOut: (t: number) => number,
    sineIn: (t: number) => number,
    sineOut: (t: number) => number,
}

declare const Eases: Eases;

declare module "eases" {
    export = Eases;
}
