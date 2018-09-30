import * as $ from "jquery";

export const transitionEvents = "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend";

/**
 * Utility function to invoke a callback once CSS transitions end.
 *
 * @param element - The element to attach to.
 * @param callback  - The callback to invoke.
 * @returns The same element you passed, for method chaning.
 */
export function onceTransitionEnds<T extends JQuery>(
    element: T,
    callback: () => void,
): T {
    return element.one(transitionEvents, callback);
}

/**
 * Utility function to invoke a callback on CSS transitions ends.
 *
 * @param element - The element to attach to.
 * @param callback  - The callback to invoke.
 * @returns The same element you passed, for method chaning.
 */
export function onTransitionEnds<T extends JQuery>(
    element: T,
    callback: () => void,
): T {
    return element.on(transitionEvents, callback);
}

/**
 * Utility function to remove a callback for CSS transitions ends.
 *
 * @param element - The element to attach to.
 * @param callback  - The callback to invoke.
 * @returns The same element you passed, for method chaning.
 */
export function offTransitionEnds<T extends JQuery>(
    element: T,
    callback: () => void,
): T {
    return element.off(transitionEvents, callback);
}

/**
 * JQuery's deep copy utility function.
 *
 * @param obj - The object to deep copy.
 * @returns A **new** object, that is a deep copy of the passed in obj.
 */
export function deepCopy<T extends object>(obj: T): T {
    return jQuery.extend(true, {}, obj);
}

// tslint:disable-next-line:no-any - for easy debugging
(window as any).$ = $;
