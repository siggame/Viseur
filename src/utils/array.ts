/**
 * Returns a newly sorted array of the passed in array. The passed in array is not changed
 * @param array the array to form a sorted one from
 * @param getVal optional callback to get the value from each item to compare against
 * @returns a new array that is the sorted form of the passed in array
 */
export function sortedAscending<T>(array: T[], getVal?: (item: T) => any): T[] {
    return array.slice().sort((a, b) => {
        let first: any = a;
        let second: any = b;

        if (getVal) {
            first = getVal(first);
            second = getVal(second);
        }

        if (first > second) {
            return 1;
        }

        if (first < second) {
            return -1;
        }

        return 0; // a must be equal to b
    });
}
