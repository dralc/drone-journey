'use strict';

/**
 *
 * @param {*} str -
 * @param {*} structType -
 *
 * @returns {false | Object | Array }
 */
function isJsonStruct(str, structType) {
    if (typeof str !== 'string') {
        return false;
    }

    try {
        const result = JSON.parse(str);
        const type = Object.prototype.toString.call(result);
        return (type === `[object ${structType}]`) ? result : false;
    } catch (err) {
        return false;
    }
}

class Utils {

    /**
     * Converts `obj` into a Buffer
     * @param {*} obj
     * @returns {Buffer}
     */
    static serialize(obj) {
        return Buffer.from(JSON.stringify(obj));
    }

    /**
     * Converts a Buffer into it's original form
     * @param {Buffer} buf
     * @returns {*}
     */
    static deserialize(buf) {
        return JSON.parse(buf.toString());
    }

    static isEmpty(buf) {
        if (!buf) {
            return true;
        }

        return (Buffer.isBuffer(buf) && buf.length === 0);
    }

    static getJourneyKey({ droneId, owner, type, status }) {
        return { droneId, owner, type, status };
    }

    static validateJourneyKey(state) {
        const allValidKeys = ['droneId', 'owner', 'type', 'status'];
        const stateKeys = Object.keys(state);

        // Check attribute's presence
        allValidKeys.forEach(key => {
            if (!stateKeys.includes(key)) {
                throw Error(`The state attribute (${key}) couldn't be found`);
            }
        });

        // Check attribute value's type
        stateKeys.forEach(key => {
            const val = state[key];
            if (!val || typeof val !== 'string' || val.trim().length === 0) {
                throw new TypeError(`Can't create a key with a non-string attribute (${key}:${val})`);
            }
        });
    }

    static isJsonObj(str) {
        return isJsonStruct(str, 'Object');
    }
    static isJsonArr(str) {
        return isJsonStruct(str, 'Array');
    }

}

module.exports = Utils;
