import * as $ from "jquery";

/**
 * Creates a function that will transform a handlebars template function to a
 * jquery element.
 *
 * @param hbsTemplate - The template function returned from doing a
 * require("someHandlebarsFile.hbs").
 * @param args - The key/values to apply to the handlebars template.
 * @param parent - An optional parent element to attach the newly created
 * partial view to.
 * @returns An html wrapped element of the handlebars template with args
 * applied to it.
 */
export function partial(
    hbsTemplate: Handlebars,
    args?: {},
    parent?: JQuery,
): JQuery {
    const html = hbsTemplate(args);
    // TODO: figure out jQuery type changes and fix this any hack, or remove
    // jQuery all together :P
    const element = $($.parseHTML(html)) as any; // tslint:disable-line:no-any

    if (parent) {
        element.appendTo(parent); // tslint:disable-line:no-unsafe-any
    }

    return element; // tslint:disable-line:no-unsafe-any
}
