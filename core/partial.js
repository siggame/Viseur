var $ = require("jquery");

/**
 * Creates a function that will tranforms a handlebars template function to a jquery element
 *
 * @param {function} hbsTemplate - the template function returned from doing a require("someHandlebarsFile.hbs")
 * @return {function} a partial building function that takes in args for the hbs partial and a $parent element and creates jquery wrapped DOM elements
 */
module.exports = function partial(hbsTemplate) {
    return function newPartial(args, $parent) {
        var html = hbsTemplate(args);
        var element = $.parseHTML(html);
        var $element = $(element);

        if($parent) {
            $element.appendTo($parent);
        }

        return $element;
    };
};
