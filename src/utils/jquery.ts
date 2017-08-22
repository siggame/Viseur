import * as $ from "jquery";

export const transitionEvents = "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend";

export function onceTransitionEnds(element: JQuery<HTMLElement>, callback: () => void): JQuery<HTMLElement> {
    return element.one(transitionEvents, callback);
}

export function onTransitionEnds(element: JQuery<HTMLElement>, callback: () => void): JQuery<HTMLElement> {
    return element.on(transitionEvents, callback);
}

export function offTransitionEnds(element: JQuery<HTMLElement>, callback: () => void): JQuery<HTMLElement> {
    return element.off(transitionEvents, callback);
}

export function deepCopy(obj: any): any {
    return jQuery.extend(true, {}, obj);
}

// for easy debugging
(window as any).$ = $;
