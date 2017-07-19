export class Utils {

    /**
     * Returns true if the supplied type is a number.
     *
     * @param val   An unkown type that is being tested to determine if it is
     *              numeric.
     */
    public static isNumeric(val: any): boolean {
        if (isNaN(val)) { return false; }

        const x: number = parseFloat(val);
        return (x | 0) === x;
    }

    /**
     * Validates a string representing a key for Firebase compliance.
     *
     * @param key   The key to be verified.
     *
     * @return True if the key provided is considered a valid Firebase key.
     */
    public static isValidKey(key: string): boolean {

        if (typeof key !== "string") {
            return false
        }

        if (key.length === 0) {
            return false
        }

        // Key must not contain 
        if (/[\[\].#$\/\u0000-\u001F\u007F]/.test(key)) {
            return false
        }

        return true
    }
}
