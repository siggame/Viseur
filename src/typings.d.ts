/**
 * The resulting handlebars template function from importing a hbs file
 * Takes in args to format the imported handlebars file into.
 *
 * @param args - The arguments to apply to the templates.
 * @returns The template with args applied to it.
 */
declare type Handlebars = (args?: Record<string, unknown>) => string;

declare module "*.png" {
    const _: string;
    export default _;
}

declare module "*.ico" {
    const _: string;
    export default _;
}

declare module "*.gamelog" {
    const _: string;
    export default _;
}

declare module "*.hbs" {
    const _: Handlebars;
    export = _;
}
