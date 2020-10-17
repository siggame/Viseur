const transitionEvents =
    "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend";

/**
 * Utility function to invoke a callback once CSS transitions end.
 *
 * @param element - The element to attach to.
 * @param callback - The callback to invoke.
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
 * @param callback - The callback to invoke.
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
 * @param callback - The callback to invoke.
 * @returns The same element you passed, for method chaning.
 */
export function offTransitionEnds<T extends JQuery>(
    element: T,
    callback: () => void,
): T {
    return element.off(transitionEvents, callback);
}
