import * as $ from "jquery";

/**
 * Creates a function that will transform a handlebars template function to a
 * jquery element.
 *
 * @param hbsTemplate - The template function returned from importing a .hbs file.
 * @param args - The key/values to apply to the handlebars template.
 * @param parent - An optional parent element to attach the newly created partial view to.
 * @returns An html wrapped element of the handlebars template with args applied to it.
 */
export function partial(
    hbsTemplate: Handlebars,
    // eslint-disable-next-line @typescript-eslint/ban-types
    args?: {},
    parent?: JQuery,
): JQuery {
    const html = hbsTemplate(args);
    const element = $($.parseHTML(html));

    if (parent) {
        element.appendTo(parent);
    }

    // TODO: figure out jQuery type changes and fix this any hack, or remove
    // jQuery all together :P
    return (element as unknown) as JQuery;
}
