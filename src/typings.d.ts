/**
 * The resulting handlebars template function from importing a hbs file
 * Takes in args to format the imported handlebars file into
 * @param args the arguments to apply to the templates
 * @returns {string} the template with args applied to it
 */
declare type Handlebars = (args?: {}) => string;

declare module "*.hbs" {
    const _: Handlebars;
    export = _;
}

declare module "*.json" {
    const _: {
        [key: number]: any;
        [key: string]: any;
    };

    export = _;
}
