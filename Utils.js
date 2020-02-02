'use strict';

class Utils {

    static serialize(obj) {
        return Buffer.from(JSON.stringify(obj));
    }

    static deserialize(buf) {
        return JSON.parse(buf.toString());
    }

    static isEmpty(buf) {
        return (!!buf && buf.length === 0);
    }

    static getJourneyKey({ droneId, owner, type, status }) {
        return { droneId, owner, type, status };
    }
}

module.exports = Utils;
