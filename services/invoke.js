'use strict';

const fabricNetwork = require('fabric-network');
const gateway = new fabricNetwork.Gateway();
const wallet = null;
const identity = null;
const asLocalhost = null;

const gatewayOptions = {
    wallet,
    identity,
    discovery: {
        asLocalhost,
        enabled: true
    }
};

const connectionProfile = null;

async function init() {
    await gateway.connect(connectionProfile, gatewayOptions);
}

function close() {
    gateway.disconnect();
}