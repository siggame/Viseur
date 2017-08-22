import * as $ from "jquery";

/**
 * Creates a function that will transform a handlebars template function to a jquery element
 * @param {Handlebars} hbsTemplate - the template function returned from doing a require("someHandlebarsFile.hbs")
 * @param {object} args key/values to apply to the handlebars template
 * @param {$} parent optional parent element to attach the newly created partial view to
 * @returns {$} an html wrapped element of the handlebars template with args applied
 */
export default function partial(hbsTemplate: Handlebars, args: {}, parent?: JQuery<HTMLElement>): JQuery<HTMLElement> {
    const html = hbsTemplate(args);
    const element = $($.parseHTML(html));

    if (parent) {
        element.appendTo(parent);
    }

    return element;
}
